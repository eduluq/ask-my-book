import Image from "next/image";
import { notFound } from "next/navigation";

import QuestionForm from "@/components/question-form";
import QuestionCard from "@/components/question-card";
import { Skeleton } from "@/components/ui/skeleton";
import db from "@/lib/db";

interface Props {
  bookId: string;
}

async function getBookById(id: string) {
  const book = await db.book.findUnique({
    where: { id },
    include: {
      questions: {
        take: 10,
        orderBy: {
          askCount: "desc",
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return book;
}

export function BookDetailsSkeleton() {
  return (
    <div>
      <div className="flex mb-8">
        <Skeleton className="w-[140px] h-[280px] rounded-lg mr-4" />
        <div>
          <Skeleton className="w-[600px] h-[100px] rounded-lg mb-4" />
          <Skeleton className="w-[600px] h-[164px] rounded-lg" />
        </div>
      </div>

      <Skeleton className="w-[756px] h-[280px] rounded-lg mb-8" />

      <div className="gap-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 [&>li:not(:first-child)]:mt-4">
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    </div>
  );
}

async function BookDetails({ bookId }: Props) {
  const book = await getBookById(bookId);

  return (
    <div>
      <div className="lg:flex mb-8">
        {book.image && (
          <Image
            src={book.image}
            alt="The minimalism entrepreneur book cover"
            width={136}
            height={200}
          />
        )}

        <div className="p-4 max-w-prose">
          <h1 className="mb-2">{book.title}</h1>
          <p className="mb-4 text-muted-foreground">{book.description}</p>
        </div>
      </div>

      <div className="max-w-prose mb-12">
        <QuestionForm bookId={book.id} />
      </div>

      <h3 className="mb-4">See what other people are asking...</h3>
      <ul className="gap-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 [&>li:not(:first-child)]:mt-4">
        {book.questions.map((question) => {
          return (
            <li key={question.id} className="break-inside-avoid mb-4">
              <QuestionCard {...question} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BookDetails;
