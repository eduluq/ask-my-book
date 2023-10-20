import { Suspense } from "react";

import BookDetails, { BookDetailsSkeleton } from "@/components/book-details";

interface Props {
  params: { bookId: string };
}

async function Book(props: Props) {
  return (
    <main>
      <Suspense fallback={<BookDetailsSkeleton />}>
        <BookDetails bookId={props.params.bookId} />
      </Suspense>
    </main>
  );
}

export default Book;
