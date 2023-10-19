"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

function QuestionForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "What is The Minimalist Entrepreneur about?",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    // ✅ This will be type-safe and validated.
    console.log(values.question);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ask a question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Answers are AI generated</FormDescription>
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
  );
}

export default QuestionForm;
