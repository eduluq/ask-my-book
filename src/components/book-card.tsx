import Image from "next/image";
import { Prisma } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

type Props = Prisma.BookGetPayload<{}>;

function truncate(input: string) {
  console.log(input, input.length);
  if (input.length > 250) {
    return input.substring(0, 250) + "...";
  }
  return input;
}

function BookCard({ title, description, image }: Props) {
  return (
    <Card className="hover:bg-stone-100">
      <CardHeader></CardHeader>

      <CardContent>
        <div className="flex">
          {image && (
            <Image
              src={image}
              alt={`${title} book cover`}
              width="0"
              height="0"
              sizes="100vw"
              className="w-2/3 h-auto"
              loading="lazy"
            />
          )}

          <div className="ml-4">
            <CardTitle>{title}</CardTitle>

            {!!description && (
              <CardDescription>{truncate(description)}</CardDescription>
            )}

            <Button variant="link" className="px-0 mt-2">
              See more
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BookCard;
