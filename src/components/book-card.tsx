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

function BookCard({ title, description, image }: Props) {
  return (
    <Card>
      {image && (
        <CardHeader>
          <Image
            src={image}
            alt={`${title} book cover`}
            width="0"
            height="0"
            sizes="100vw"
            className="w-2/3 h-auto"
            loading="lazy"
          />
        </CardHeader>
      )}

      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>

      <CardFooter>
        <Button variant="link" className="px-0">
          See more
        </Button>
      </CardFooter>
    </Card>
  );
}

export default BookCard;
