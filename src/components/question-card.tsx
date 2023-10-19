import { Prisma } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = Prisma.QuestionGetPayload<{}>;

function QuestionCard({ question, answer }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>{answer}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default QuestionCard;
