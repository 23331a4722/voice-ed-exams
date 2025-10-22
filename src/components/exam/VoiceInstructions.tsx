import { Card, CardContent } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';

export const VoiceInstructions = () => {
  return (
    <Card className="bg-primary/10 border-primary">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Volume2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-accessible font-semibold">Voice Mode Active</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Questions auto-read with options. Answer automatically recorded. 
              Say <strong>"next question"</strong>, <strong>"previous question"</strong>, 
              <strong>"repeat question"</strong>, or <strong>"submit exam"</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
