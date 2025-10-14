import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface VoiceCommand {
  command: string;
  action: () => void;
  keywords: string[];
}

export const useVoiceNavigation = (customCommands?: VoiceCommand[]) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.cancel(); // Clear queue
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const defaultCommands: VoiceCommand[] = [
    {
      command: 'go to dashboard',
      keywords: ['dashboard', 'home', 'main'],
      action: () => {
        navigate('/dashboard');
        speak('Navigating to dashboard');
      }
    },
    {
      command: 'start exam',
      keywords: ['start exam', 'begin exam', 'take exam'],
      action: () => {
        navigate('/exam');
        speak('Starting exam');
      }
    },
    {
      command: 'view results',
      keywords: ['results', 'scores', 'grades'],
      action: () => {
        navigate('/results');
        speak('Showing results');
      }
    },
    {
      command: 'admin panel',
      keywords: ['admin', 'admin panel', 'teacher'],
      action: () => {
        navigate('/admin');
        speak('Opening admin panel');
      }
    },
    {
      command: 'help',
      keywords: ['help', 'commands', 'what can you do'],
      action: () => {
        const helpText = 'Available commands: Go to dashboard, Start exam, View results, Admin panel, Submit, Next question, Previous question';
        speak(helpText);
        toast.info(helpText);
      }
    }
  ];

  const allCommands = [...defaultCommands, ...(customCommands || [])];

  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    for (const cmd of allCommands) {
      if (cmd.keywords.some(keyword => lowerTranscript.includes(keyword))) {
        cmd.action();
        return true;
      }
    }
    
    speak('Command not recognized. Say help for available commands.');
    return false;
  }, [allCommands, speak]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const newRecognition = new SpeechRecognitionAPI();
    
    newRecognition.continuous = false;
    newRecognition.interimResults = false;
    newRecognition.lang = 'en-US';

    newRecognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening...');
    };

    newRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice command:', transcript);
      processCommand(transcript);
    };

    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error !== 'no-speech') {
        toast.error('Voice recognition error. Please try again.');
      }
    };

    newRecognition.onend = () => {
      setIsListening(false);
    };

    setRecognition(newRecognition);
    newRecognition.start();
  }, [processCommand]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [recognition]);

  return {
    isListening,
    startListening,
    stopListening,
    speak
  };
};
