import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const VoiceButton = ({ isListening, onToggle, size = 'default' }: VoiceButtonProps) => {
  return (
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
  );
};
