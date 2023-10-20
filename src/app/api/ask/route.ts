import { revalidatePath } from "next/cache";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VercelPostgres } from "langchain/vectorstores/vercel_postgres";
import { StreamingTextResponse, LangChainStream } from "ai";
import { Prisma } from "@prisma/client";

import db from "@/lib/db";
import { stringToStream } from "@/lib/utils";

const getContext = async (questionAsked: string, bookId: string) => {
  const vectorStore = await VercelPostgres.initialize(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.VERCEL_OPENAI_API_KEY,
    }),
    {
      tableName: "book_vector_store",
    }
  );

  const relevantSections = await vectorStore.similaritySearch(
    questionAsked,
    10,
    {
      bookId: bookId,
    }
  );

  const formattedRelevantSections = relevantSections
    .map((s) => `- ${s.pageContent.trim()}\n\n`)
    .join("");

  return formattedRelevantSections;
};

const getPrompt = async (
  questionAsked: string,
  context: string,
  book: Prisma.BookGetPayload<{ include: { questions: true } }>
) => {
  const promptTemplate = PromptTemplate.fromTemplate(
    "{bookAuthor} is the author of the book {bookTitle}. These are questions and answers by him. Please keep your answers to three sentences maximum, and speak in complete sentences. Stop speaking once your point is made.\n\nContext that may be useful, pulled from {bookTitle}: \n\n{context} {bookQuestions} \n\n\nQ: {questionAsked}\n\nA: "
  );

  const formattedBookQuestions = book.questions
    .map((q) => `\n\n\nQ: ${q.question.trim()}\n\nA: ${q.answer}`)
    .join("");

  const formattedPrompt = await promptTemplate.format({
    bookTitle: book.title,
    bookAuthor: book.author,
    bookQuestions: formattedBookQuestions,
    context,
    questionAsked,
  });

  return formattedPrompt;
};

const answerBookQuestion = async (
  questionAsked: string,
  book: Prisma.BookGetPayload<{ include: { questions: true } }>,
  handleCompletition: (answer: string, context: string) => void
) => {
  const llm = new OpenAI({
    openAIApiKey: process.env.VERCEL_OPENAI_API_KEY,
    temperature: 0,
    streaming: true,
  });

  const context = await getContext(questionAsked, book.id);
  const prompt = await getPrompt(questionAsked, context, book);

  console.log(prompt);

  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion) => {
      handleCompletition(completion, context);
    },
  });

  llm.call(prompt, {}, [handlers]).catch(console.error);

  return stream;
};

export async function POST(request: Request) {
  const body = await request.json();

  let questionAsked = body.prompt;
  const bookId = body.bookId;

  if (!bookId) throw new Error("bookId is required");
  if (!questionAsked) throw new Error("prompt is required");

  const book = await db.book.findUnique({
    where: { id: bookId },
    include: {
      questions: {
        take: 10,
        orderBy: {
          askCount: "desc",
        },
      },
    },
  });

  if (!book) throw new Error("book not found");

  if (!questionAsked.endsWith("?")) questionAsked += "?";

  const previousQuestion = await db.question.findFirst({
    where: {
      question: questionAsked,
    },
  });

  if (previousQuestion) {
    console.log(
      `Previously asked question and answered ${previousQuestion.answer}`
    );

    await db.question.update({
      where: {
        id: previousQuestion.id,
      },
      data: {
        askCount: previousQuestion.askCount + 1,
      },
    });

    revalidatePath(`/book/${bookId}`);

    const stream = stringToStream(previousQuestion.answer || "");

    return new StreamingTextResponse(stream);
  }

  const stream = await answerBookQuestion(
    questionAsked,
    book,
    async (answer, context) => {
      await db.book.update({
        where: {
          id: bookId,
        },
        data: {
          questions: {
            create: {
              question: questionAsked,
              answer,
              context,
            },
          },
        },
      });

      revalidatePath(`/book/${bookId}`);
    }
  );

  return new StreamingTextResponse(stream);
}
