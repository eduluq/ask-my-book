import { Prisma } from "@prisma/client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = Prisma.QuestionGetPayload<{}>;

function QuestionCard({ question, answer, askCount }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>{answer}</CardDescription>
      </CardHeader>
      <CardFooter>({askCount})</CardFooter>
    </Card>
  );
}

export default QuestionCard;
