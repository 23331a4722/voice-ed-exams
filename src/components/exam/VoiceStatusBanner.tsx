import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Mic } from 'lucide-react';

interface VoiceStatusBannerProps {
  isReading: boolean;
  isRecording: boolean;
}

export const VoiceStatusBanner = ({ isReading, isRecording }: VoiceStatusBannerProps) => {
  if (!isReading && !isRecording) return null;

  return (
    <Card className="bg-accent/20 border-accent animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {isReading ? (
            <>
              <Volume2 className="h-6 w-6 text-accent voice-pulse" />
              <p className="text-accessible font-medium">Reading question and options...</p>
            </>
          ) : (
            <>
              <Mic className="h-6 w-6 text-destructive voice-pulse" />
              <p className="text-accessible font-medium">Recording your answer... Speak now</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
