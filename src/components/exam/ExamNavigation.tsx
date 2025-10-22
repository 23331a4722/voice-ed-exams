import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

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
  onPrevious,
  onNext,
  onSubmit,
}: ExamNavigationProps) => {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="flex gap-4">
      <Button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        variant="outline"
        className="flex-1 min-h-[56px] hover-scale"
      >
        <ChevronLeft className="mr-2 h-5 w-5" />
        Previous
      </Button>
      
      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          className="flex-1 min-h-[56px] shadow-glow hover-scale"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Submit Exam
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="flex-1 min-h-[56px] hover-scale"
        >
          Next
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
