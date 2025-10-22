import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ExamHeaderProps {
  timeLeft: number;
  totalTime: number;
}

export const ExamHeader = ({ timeLeft, totalTime }: ExamHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (timeLeft / totalTime) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <Card className="gradient-card border-primary/30">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-accessible font-medium">Time Remaining</span>
          <span className={`text-3xl font-bold tabular-nums transition-colors ${
            isLowTime ? 'text-warning animate-pulse' : 'text-primary'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <Progress value={timePercentage} className="h-3" />
      </CardContent>
    </Card>
  );
};
