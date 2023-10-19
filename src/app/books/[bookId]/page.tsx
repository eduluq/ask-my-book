import Image from "next/image";

import db from "@/lib/db";
import QuestionForm from "@/components/question-form";
import QuestionCard from "@/components/question-card";

interface Props {
  params: { bookId: string };
}

async function Book(props: Props) {
  const book = await db.book.findUniqueOrThrow({
    where: { id: props.params.bookId },
    include: { questions: true },
  });

  return (
    <main>
      <div className="flex mb-8">
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
          <p className="mb-4">{book.description}</p>
        </div>
      </div>

      <div className="mb-12">
        <QuestionForm />
      </div>

      <h3 className="mb-4">See what other people are asking...</h3>
      <ul className="gap-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 [&>li:not(:first-child)]:mt-4">
        {book.questions.map((question) => {
          return (
            <li key={question.id}>
              <QuestionCard {...question} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default Book;