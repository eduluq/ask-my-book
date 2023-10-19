import { revalidatePath } from "next/cache";
import { OpenAI } from "langchain/llms/openai";
import { StreamingTextResponse, LangChainStream } from "ai";

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

export async function POST(request: Request) {
  const body = await request.json();
  let questionAsked = body.prompt;
  const bookId = body.bookId;

  if (!bookId) throw new Error("bookId is required");

  revalidatePath(`/book/${bookId}`);

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

    const stream = stringToStream(previousQuestion.answer || "");

    return new StreamingTextResponse(stream);
  }

  const llm = new OpenAI({
    openAIApiKey: process.env.VERCEL_OPENAI_API_KEY,
    temperature: 0,
    streaming: true,
  });

  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion) => {
      await db.book.update({
        where: {
          id: bookId,
        },
        data: {
          questions: {
            create: {
              question: questionAsked,
              answer: completion,
              // context: ""
            },
          },
        },
      });
    },
  });

  llm.call(questionAsked, {}, [handlers]).catch(console.error);

  return new StreamingTextResponse(stream);
}
