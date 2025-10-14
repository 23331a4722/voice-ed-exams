import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const VoiceButton = ({ isListening, onToggle, size = 'default' }: VoiceButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onToggle}
          variant={isListening ? 'default' : 'secondary'}
          size={size}
          className={`${isListening ? 'voice-pulse shadow-glow' : ''} min-w-[44px] min-h-[44px]`}
          aria-label={isListening ? 'Stop voice command' : 'Activate voice command'}
          aria-live="polite"
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          {size !== 'icon' && (
            <span className="ml-2">{isListening ? 'Listening...' : 'Voice Command'}</span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">
          {isListening 
            ? 'Click to stop listening' 
            : 'Click to activate voice commands'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
