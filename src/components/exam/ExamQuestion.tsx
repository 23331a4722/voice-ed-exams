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
  currentIndex: number;
  totalQuestions: number;
  onRepeat: () => void;
  isReading: boolean;
}

export const ExamQuestion = ({
  question,
  currentIndex,
  totalQuestions,
  onRepeat,
  isReading,
}: ExamQuestionProps) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <Card className="gradient-card border-primary/50">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-2xl">
            Question {currentIndex + 1} of {totalQuestions}
          </CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={onRepeat}
            className="min-w-[44px] min-h-[44px] hover-scale"
            aria-label="Repeat question"
            disabled={isReading}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
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
