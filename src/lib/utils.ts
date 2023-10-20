import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export const stringToStream = (str: string) => {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        controller.enqueue(encoder.encode(char));
        const randomWaiting = Math.floor(Math.random() * 5) + 5;
        await delay(randomWaiting); // delay to simulate streaming
      }
      controller.close();
    },
  });
};
