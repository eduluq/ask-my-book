"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";

const FormSchema = z.object({
  question: z
    .string()
    .min(2, {
      message: "question must have at least 2 characters.",
    })
    .max(50, {
      message: "question must have less than 50 characters.",
    }),
});

export default function Home() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "What is The Minimalist Entrepreneur about?",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    // ✅ This will be type-safe and validated.
    console.log(values.question);

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <main className="p-24">
      <Image
        src="https://m.media-amazon.com/images/I/711KXUuHfbL._SY522_.jpg"
        alt="The minimalism entrepreneur book cover"
        width={136}
        height={200}
      />

      <h1 className="mb-2">Ask My Book</h1>
      <p className="mb-4">
        This is an experiment in using AI to make my book's content more
        accessible. Ask a question and AI'll answer it in real-time:
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-4">
            <Button size="lg" type="submit">
              Submit
            </Button>
            <Button variant="secondary" size="lg" type="submit">
              I'm feeling lucky
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
