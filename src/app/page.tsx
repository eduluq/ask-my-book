import { Suspense } from "react";

import BookList, { BookListSkeleton } from "@/components/book-list";

async function Home() {
  return (
    <main>
      <div className="max-w-prose mb-8">
        <h1>Ask My Book</h1>
        <p>
          {
            "This is an experiment in using AI to make book\'s content more accessible."
          }
        </p>
        <ul>
          <li>{"1. Choose a book"}</li>
          <li>{"2. Ask a question and AI\'ll answer it in real-time:"}</li>
        </ul>
      </div>

      <Suspense fallback={<BookListSkeleton />}>
        <BookList />
      </Suspense>
    </main>
  );
}

export default Home;
