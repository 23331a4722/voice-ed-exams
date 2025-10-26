import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';
import { useExamSession } from '@/hooks/useExamSession';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { VoiceInstructions } from '@/components/exam/VoiceInstructions';
import { VoiceStatusBanner } from '@/components/exam/VoiceStatusBanner';
import { ExamQuestion } from '@/components/exam/ExamQuestion';
import { ExamAnswer } from '@/components/exam/ExamAnswer';
import { ExamNavigation } from '@/components/exam/ExamNavigation';

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: 'text' | 'multiple-choice';
}

const Exam = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: 'What is the capital of France?',
      options: ['A: London', 'B: Paris', 'C: Berlin', 'D: Madrid'],
      type: 'multiple-choice'
    },
    {
      id: 2,
      question: 'Which planet is known as the Red Planet?',
      options: ['A: Venus', 'B: Mars', 'C: Jupiter', 'D: Saturn'],
      type: 'multiple-choice'
    },
    {
      id: 3,
      question: 'What is the largest ocean on Earth?',
      options: ['A: Atlantic Ocean', 'B: Indian Ocean', 'C: Arctic Ocean', 'D: Pacific Ocean'],
      type: 'multiple-choice'
    },
    {
      id: 4,
      question: 'Explain the process of photosynthesis in plants.',
      type: 'text'
    }
  ];

  const TOTAL_TIME = 3600; // 60 minutes

  // Initialize exam session with persistence
  const {
    sessionId,
    currentQuestion,
    timeLeft,
    answers,
    isLoading,
    updateAnswer,
    updateCurrentQuestion,
    updateTime,
    completeSession
  } = useExamSession(questions.length);

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      setRecognition(null);
    }
  }, [recognition]);

  const startRecording = useCallback(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported. Please use Chrome or Edge browser.');
      return;
    }

    // Stop any existing recognition first
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.log('Error stopping previous recognition:', e);
      }
    }

    try {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const newRecognition = new SpeechRecognitionAPI();
      
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'en-US';
      newRecognition.maxAlternatives = 1;

      newRecognition.onstart = () => {
        setIsRecording(true);
        console.log('Recording started');
      };

      newRecognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update answer using the session hook
        const existingAnswer = answers[currentQuestion] || '';
        const newAnswer = (existingAnswer + finalTranscript + interimTranscript).trim();
        updateAnswer(currentQuestion, newAnswer);
      };

      newRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific errors
        switch (event.error) {
          case 'no-speech':
            // Don't show error for no speech, just continue listening
            break;
          case 'audio-capture':
            toast.error('No microphone detected. Please check your microphone.');
            setIsRecording(false);
            break;
          case 'not-allowed':
            toast.error('Microphone permission denied. Please enable microphone access.');
            setIsRecording(false);
            break;
          case 'network':
            // Network errors are usually temporary and non-fatal
            console.log('Network error (usually temporary, continuing...)');
            break;
          case 'aborted':
            // Normal when stopping
            break;
          default:
            toast.error('Recording error. Please try speaking again.');
            setIsRecording(false);
        }
      };

      newRecognition.onend = () => {
        console.log('Recording ended');
        // Only update state if we're actually stopping
        if (isRecording) {
          setIsRecording(false);
        }
      };

      setRecognition(newRecognition);
      
      // Start with small delay for initialization
      setTimeout(() => {
        try {
          newRecognition.start();
        } catch (err) {
          console.error('Error starting recording:', err);
          setIsRecording(false);
          toast.error('Could not start recording. Please try again.');
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsRecording(false);
      toast.error('Failed to initialize voice recording');
    }
  }, [recognition, currentQuestion, answers, isRecording]);

  const readQuestionAndOptions = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsReading(true);

    const currentQ = questions[currentQuestion];
    let text = `Question ${currentQuestion + 1} of ${questions.length}. ${currentQ.question}`;

    if (currentQ.options && currentQ.options.length > 0) {
      text += '. The options are: ';
      currentQ.options.forEach((option, index) => {
        text += `${option}. `;
      });
    }

    text += '. Please state your answer now.';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsReading(false);
      // Automatically start recording after reading
      setTimeout(() => {
        if (!isRecording) {
          toast.info('🎤 Recording your answer...', { duration: 2000 });
          startRecording();
        }
      }, 500);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsReading(false);
      // Even if speech fails, allow recording
      setTimeout(() => {
        if (!isRecording) {
          toast.info('🎤 Recording your answer...', { duration: 2000 });
          startRecording();
        }
      }, 500);
    };

    // Use setTimeout to ensure speech synthesis is ready
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [currentQuestion, questions, startRecording, isRecording]);

  const handleNext = useCallback(() => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    if (currentQuestion < questions.length - 1) {
      updateCurrentQuestion(currentQuestion + 1);
      toast.success('Moving to next question');
    }
  }, [currentQuestion, questions.length, stopRecording, updateCurrentQuestion]);

  const handlePrevious = useCallback(() => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    if (currentQuestion > 0) {
      updateCurrentQuestion(currentQuestion - 1);
      toast.success('Going to previous question');
    }
  }, [currentQuestion, stopRecording, updateCurrentQuestion]);

  const handleSubmit = useCallback(async () => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    await completeSession();
    
    const utterance = new SpeechSynthesisUtterance('Exam submitted successfully! Showing your results.');
    utterance.onend = () => {
      navigate('/results');
    };
    window.speechSynthesis.speak(utterance);
  }, [navigate, stopRecording, completeSession]);

  // Voice command to clear current answer
  const handleClearAnswer = useCallback(() => {
    updateAnswer(currentQuestion, '');
    toast.success('Answer cleared');
    speak('Answer cleared');
  }, [currentQuestion, updateAnswer]);

  // Enhanced voice commands specific to the exam
  const examVoiceCommands = [
    {
      command: 'next question',
      keywords: ['next question', 'next', 'skip', 'move on'],
      action: handleNext
    },
    {
      command: 'previous question',
      keywords: ['previous question', 'previous', 'back', 'go back', 'last question'],
      action: handlePrevious
    },
    {
      command: 'submit exam',
      keywords: ['submit exam', 'submit', 'finish exam', 'finish', 'complete exam', 'done'],
      action: handleSubmit
    },
    {
      command: 'repeat question',
      keywords: ['repeat question', 'repeat', 'say again', 'read again', 'what was the question'],
      action: readQuestionAndOptions
    },
    {
      command: 'stop recording',
      keywords: ['stop recording', 'stop', 'pause recording', 'pause'],
      action: stopRecording
    },
    {
      command: 'start recording',
      keywords: ['start recording', 'record', 'begin recording', 'resume'],
      action: startRecording
    },
    {
      command: 'clear answer',
      keywords: ['clear answer', 'delete answer', 'remove answer', 'erase answer'],
      action: handleClearAnswer
    }
  ];

  const { speak, isListening, startListening } = useVoiceNavigation(examVoiceCommands);

  // Read question and start voice listening when component mounts
  useEffect(() => {
    const announcement = 'Exam started. This is a fully voice-driven exam. Questions will be read automatically and your answers will be recorded. Say next question to skip, previous question to go back, repeat question to hear again, stop recording to pause, or submit exam when finished.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    utterance.onend = () => {
      // Start voice listening for commands
      setTimeout(() => {
        if (!isListening) {
          startListening();
          toast.info('🎤 Voice commands active', { duration: 2000 });
        }
      }, 500);
      // Read first question
      setTimeout(() => readQuestionAndOptions(), 1000);
    };
    
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);

    return () => {
      stopRecording();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Read question when it changes
  useEffect(() => {
    if (currentQuestion > 0) {
      setTimeout(() => readQuestionAndOptions(), 500);
    }
  }, [currentQuestion]);

  // Timer effect with session persistence
  useEffect(() => {
    if (isLoading) return;

    const timer = setInterval(() => {
      const newTime = timeLeft - 1;
      updateTime(newTime);
      
      if (newTime <= 0) {
        clearInterval(timer);
        handleSubmit();
      } else if (newTime === 300 || newTime === 60) {
        const minutes = Math.floor(newTime / 60);
        const alert = `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
        const utterance = new SpeechSynthesisUtterance(alert);
        window.speechSynthesis.speak(utterance);
        toast.warning(alert);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit, isLoading, updateTime]);

  const currentQ = questions[currentQuestion];

  // Keyboard shortcuts as fallback
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case ' ':
          e.preventDefault();
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          readQuestionAndOptions();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, isRecording, handleNext, handlePrevious, readQuestionAndOptions, startRecording, stopRecording]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Loading exam session...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <VoiceInstructions />
        
        <VoiceStatusBanner isReading={isReading} isRecording={isRecording} />
        
        <ExamHeader timeLeft={timeLeft} totalTime={TOTAL_TIME} />
        
        <ExamQuestion
          question={currentQ}
          currentIndex={currentQuestion}
          totalQuestions={questions.length}
          onRepeat={readQuestionAndOptions}
          isReading={isReading}
        />
        
        <ExamAnswer answer={answers[currentQuestion]} isRecording={isRecording} />
        
        <ExamNavigation
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          onPrevious={() => {}}
          onNext={() => {}}
          onSubmit={() => {}}
        />
      </div>
    </Layout>
  );
};

export default Exam;
