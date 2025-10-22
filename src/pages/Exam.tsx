import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Volume2, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: 'text' | 'multiple-choice';
}

const Exam = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
        
        // Combine existing answer with new transcript
        const existingAnswer = answers[currentQuestion] || '';
        const newAnswer = (existingAnswer + finalTranscript + interimTranscript).trim();
        
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = newAnswer;
        setAnswers(newAnswers);
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
      setCurrentQuestion(prev => prev + 1);
      toast.success('Moving to next question');
    }
  }, [currentQuestion, questions.length, stopRecording]);

  const handlePrevious = useCallback(() => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      toast.success('Going to previous question');
    }
  }, [currentQuestion, stopRecording]);

  const handleSubmit = useCallback(() => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance('Exam submitted successfully! Showing your results.');
    utterance.onend = () => {
      navigate('/results');
    };
    window.speechSynthesis.speak(utterance);
    toast.success('Exam submitted successfully!');
  }, [navigate, stopRecording]);

  // Enhanced voice commands specific to the exam
  const examVoiceCommands = [
    {
      command: 'next question',
      keywords: ['next question', 'next', 'skip'],
      action: handleNext
    },
    {
      command: 'previous question',
      keywords: ['previous question', 'previous', 'back', 'go back'],
      action: handlePrevious
    },
    {
      command: 'submit exam',
      keywords: ['submit exam', 'submit', 'finish exam', 'finish'],
      action: handleSubmit
    },
    {
      command: 'repeat question',
      keywords: ['repeat question', 'repeat', 'say again', 'read again'],
      action: readQuestionAndOptions
    }
  ];

  const { speak } = useVoiceNavigation(examVoiceCommands);

  // Read question when component mounts
  useEffect(() => {
    const announcement = 'Exam started. Questions will be read automatically. Say next question to skip, previous question to go back, repeat question to hear again, or submit exam when finished.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    utterance.onend = () => {
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

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        // Voice alerts at 5 and 1 minute marks
        if (prev === 300 || prev === 60) {
          const minutes = Math.floor(prev / 60);
          const alert = `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
          const utterance = new SpeechSynthesisUtterance(alert);
          window.speechSynthesis.speak(utterance);
          toast.warning(alert);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestion];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Voice Instructions Banner */}
        <Card className="mb-6 bg-primary/10 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Volume2 className="h-6 w-6 text-primary" />
              <p className="text-accessible">
                <strong>Voice Mode Active:</strong> Questions auto-read with options. Answer automatically recorded. Say "next question", "previous question", "repeat question", or "submit exam"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recording Status */}
        {(isReading || isRecording) && (
          <Card className="mb-6 bg-accent/20 border-accent">
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
        )}

        {/* Timer */}
        <Card className="mb-6 gradient-card border-primary/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-accessible">Time Remaining</span>
              <span className={`text-2xl font-bold ${timeLeft < 300 ? 'text-warning' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Progress value={(timeLeft / 3600) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6 gradient-card border-primary/50">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-2xl">
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={readQuestionAndOptions}
                className="min-w-[44px] min-h-[44px]"
                aria-label="Repeat question"
                disabled={isReading}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-accessible-lg font-semibold mb-4">
                {currentQ.question}
              </p>

              {/* Options */}
              {currentQ.options && currentQ.options.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-accessible font-medium text-muted-foreground">Options:</p>
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background/50 rounded-lg border border-border"
                    >
                      <p className="text-accessible">{option}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-accessible font-medium">Your Answer:</p>
                {isRecording && (
                  <span className="text-sm text-destructive font-medium flex items-center gap-2">
                    <span className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    Recording...
                  </span>
                )}
              </div>
              <div className="min-h-[100px] p-4 bg-background/80 rounded-lg border-2 border-primary/30">
                <p className="text-accessible">
                  {answers[currentQuestion] || (
                    <span className="text-muted-foreground italic">
                      {isRecording ? 'Listening...' : 'Your answer will appear here as you speak'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1 min-h-[56px]"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="flex-1 min-h-[56px] shadow-glow"
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 min-h-[56px]"
            >
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Exam;
