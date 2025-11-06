import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ExamHeaderProps {
  examTitle: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
}

export const ExamHeader = ({ examTitle, currentQuestion, totalQuestions, timeLeft }: ExamHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300;

  return (
    <Card className="gradient-card border-primary/30 mb-6">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{examTitle}</h2>
          <p className="text-muted-foreground text-accessible">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-accessible font-medium">Time Remaining</span>
          <span className={`text-3xl font-bold tabular-nums transition-colors ${
            isLowTime ? 'text-warning animate-pulse' : 'text-primary'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
