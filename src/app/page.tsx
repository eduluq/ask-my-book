import { cache } from "react";
import Link from "next/link";

import db from "@/lib/db";
import BookCard from "@/components/book-card";

async function Book() {
  const books = await cache(async () => await db.book.findMany())();

  return (
    <main>
      <div className="max-w-prose mb-8">
        <h1>Ask My Book</h1>
        <p>
          This is an experiment in using AI to make book's content more
          accessible.
        </p>
        <ul>
          <li>1. Choose a book</li>
          <li>2. Ask a question and AI'll answer it in real-time:</li>
        </ul>
      </div>

      <ul className="flex space-x-4">
        {books.map((book) => {
          return (
            <li key={book.id} className="max-w-xs">
              <Link href={`/books/${book.id}`}>
                <BookCard {...book} />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default Book;
