import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ExamNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const ExamNavigation = ({
  currentQuestion,
  totalQuestions,
}: ExamNavigationProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground italic">
            Use voice commands to navigate (no buttons needed)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
