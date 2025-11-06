import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2 } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: 'text' | 'multiple-choice';
}

interface ExamQuestionProps {
  question: Question;
  questionNumber: number;
}

export const ExamQuestion = ({
  question,
  questionNumber,
}: ExamQuestionProps) => {

  return (
    <Card className="gradient-card border-primary/50">
      <CardHeader>
        <CardTitle className="text-2xl">
          Question {questionNumber + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-accessible-lg font-semibold mb-6">
            {question.question}
          </p>

          {question.options && question.options.length > 0 && (
            <div className="space-y-3">
              <p className="text-accessible font-medium text-muted-foreground mb-3">
                Options:
              </p>
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <p className="text-accessible">{option}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
