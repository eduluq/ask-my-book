"use client";

import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompletion } from "ai/react";

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
import { Label } from "./ui/label";
import { useEffect } from "react";

interface Props {
  bookId: string;
}

const FormSchema = z.object({
  question: z
    .string()
    .min(2, {
      message: "Your question must have at least 2 characters.",
    })
    .max(100, {
      message: "Your question must have less than 100 characters.",
    }),
});

function QuestionForm({ bookId }: Props) {
  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: "/api/ask",
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "What is The Minimalist Entrepreneur about?",
    },
  });

  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (!!completion) {
      setCompletion("");
    }
  }, [values]);

  function onSubmit(values: z.infer<typeof FormSchema>) {
    complete(values.question, { body: { bookId } });
  }

  function onReset() {
    setCompletion("");
    form.reset({ question: "" });
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

        {!!completion && (
          <p>
            <Label>Answer: </Label>
            {completion}
          </p>
        )}

        <div className="flex space-x-4">
          {!!completion || isLoading ? (
            <Button
              size="lg"
              disabled={isLoading}
              type="reset"
              onClick={onReset}
            >
              {isLoading ? "Asking..." : "Ask another question"}
            </Button>
          ) : (
            <Button size="lg" disabled={isLoading} type="submit">
              Ask
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

export default QuestionForm;
