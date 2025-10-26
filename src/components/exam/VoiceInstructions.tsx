import { Card, CardContent } from '@/components/ui/card';
import { Mic } from 'lucide-react';

export const VoiceInstructions = () => {
  return (
    <Card className="bg-primary/10 border-primary">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Mic className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-accessible font-semibold">🎤 Fully Voice-Driven Exam</p>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
              <p><strong>Available voice commands:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>"next question"</strong> or <strong>"next"</strong> - Go to next question</li>
                <li><strong>"previous question"</strong> or <strong>"back"</strong> - Go to previous question</li>
                <li><strong>"repeat question"</strong> or <strong>"repeat"</strong> - Hear question again</li>
                <li><strong>"clear answer"</strong> or <strong>"delete answer"</strong> - Clear current answer</li>
                <li><strong>"read answer"</strong> or <strong>"my answer"</strong> - Hear your current answer</li>
                <li><strong>"stop recording"</strong> - Stop recording your answer</li>
                <li><strong>"start recording"</strong> - Resume recording your answer</li>
                <li><strong>"submit exam"</strong> or <strong>"finish"</strong> - Submit your exam</li>
              </ul>
              <p className="mt-3"><strong>Keyboard shortcuts:</strong> Arrow keys (navigate), Spacebar (record), Ctrl+R (repeat)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
