import { revalidatePath } from "next/cache";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StreamingTextResponse, LangChainStream } from "ai";
import { Prisma } from "@prisma/client";

import db from "@/lib/db";

// Set the runtime to edge for best performance
// export const runtime = "edge";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const stringToStream = (str: string) => {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        controller.enqueue(encoder.encode(char));
        const randomWaiting = Math.floor(Math.random() * 10) + 5;
        await delay(randomWaiting);
      }
      controller.close();
    },
  });
};

const answerQueryWithContext = async (
  questionAsked: string,
  book: Prisma.BookGetPayload<{ include: { questions: true } }>,
  handleCompletition: (answer: string, context: string) => void
) => {
  const prompt = PromptTemplate.fromTemplate(
    "{bookAuthor} is the author of the book {bookTitle}. These are questions and answers by him. Please keep your answers to three sentences maximum, and speak in complete sentences. Stop speaking once your point is made.\n\nContext that may be useful, pulled from {bookTitle}:\n {bookQuestions} \n\n\nQ: {questionAsked}\n\nA: "
  );

  const context = ""; // TODO - get most relevant context

  const formattedPrompt = await prompt.format({
    bookTitle: book.title,
    bookAuthor: "Sahil Lavingia",
    bookQuestions: book.questions
      .map((q) => `\n\n\nQ: ${q.question}\n\nA: ${q.answer}`)
      .join(""),
    questionAsked,
  });

  const llm = new OpenAI({
    openAIApiKey: process.env.VERCEL_OPENAI_API_KEY,
    temperature: 0,
    streaming: true,
  });

  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion) => {
      handleCompletition(completion, context);
    },
  });

  console.log("prompt", formattedPrompt);

  llm.call(formattedPrompt, {}, [handlers]).catch(console.error);

  return stream;
};

export async function POST(request: Request) {
  const body = await request.json();
  let questionAsked = body.prompt;
  const bookId = body.bookId;

  if (!bookId) throw new Error("bookId is required");

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

  const stream = await answerQueryWithContext(
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
