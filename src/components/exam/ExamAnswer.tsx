import { Mic } from 'lucide-react';

interface ExamAnswerProps {
  answer: string;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearAnswer: () => void;
}

export const ExamAnswer = ({ answer, isRecording, onStartRecording, onStopRecording, onClearAnswer }: ExamAnswerProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-accessible font-medium">Your Answer:</p>
        {isRecording && (
          <span className="text-sm text-destructive font-medium flex items-center gap-2 animate-fade-in">
            <span className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
            Recording...
          </span>
        )}
      </div>
      <div className="min-h-[120px] p-5 bg-background/80 rounded-lg border-2 border-primary/30 transition-all">
        <p className="text-accessible leading-relaxed">
          {answer || (
            <span className="text-muted-foreground italic">
              {isRecording ? 'Listening...' : 'Your answer will appear here as you speak'}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
