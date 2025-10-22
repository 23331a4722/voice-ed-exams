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
      try {
        window.speechSynthesis.cancel(); // Clear queue
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
        };
        
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      } catch (error) {
        console.error('Error in speech synthesis:', error);
      }
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
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    // Check if already listening
    if (recognition && isListening) {
      return;
    }

    try {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const newRecognition = new SpeechRecognitionAPI();
      
      newRecognition.continuous = false;
      newRecognition.interimResults = false;
      newRecognition.lang = 'en-US';
      newRecognition.maxAlternatives = 1;

      newRecognition.onstart = () => {
        setIsListening(true);
        toast.info('🎤 Listening for commands...', { duration: 2000 });
      };

      newRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice command received:', transcript);
        processCommand(transcript);
      };

      newRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle specific errors gracefully
        switch (event.error) {
          case 'no-speech':
            toast.info('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            toast.error('No microphone detected. Please check your microphone.');
            break;
          case 'not-allowed':
            toast.error('Microphone permission denied. Please enable microphone access.');
            break;
          case 'network':
            // Network errors are common and usually temporary, don't show error
            console.log('Network error in speech recognition (usually temporary)');
            break;
          case 'aborted':
            // Aborted is normal when stopping, don't show error
            break;
          default:
            toast.error('Voice recognition error. Please try again.');
        }
      };

      newRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(newRecognition);
      
      // Start with a small delay to ensure proper initialization
      setTimeout(() => {
        try {
          newRecognition.start();
        } catch (err) {
          console.error('Error starting recognition:', err);
          setIsListening(false);
          toast.error('Could not start voice recognition. Please try again.');
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      toast.error('Failed to initialize voice recognition');
      setIsListening(false);
    }
  }, [processCommand, recognition, isListening]);

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
