import Link from "next/link";

import BookCard from "@/components/book-card";
import { Skeleton } from "@/components/ui/skeleton";
import db from "@/lib/db";

async function getBooks() {
  return await db.book.findMany();
}

export function BookListSkeleton() {
  return <Skeleton className="w-[500px] h-[250px] rounded-lg" />;
}

async function BookList() {
  const books = await getBooks();

  return (
    <ul className="flex space-x-4">
      {books.map((book) => {
        return (
          <li key={book.id} className="max-w-lg">
            <Link href={`/books/${book.id}`}>
              <BookCard {...book} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default BookList;
