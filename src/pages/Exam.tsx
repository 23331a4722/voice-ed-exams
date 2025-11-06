import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';
import { useExamSession } from '@/hooks/useExamSession';
import { useExamWithQuestions } from '@/hooks/useExamWithQuestions';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { VoiceInstructions } from '@/components/exam/VoiceInstructions';
import { VoiceStatusBanner } from '@/components/exam/VoiceStatusBanner';
import { ExamQuestion } from '@/components/exam/ExamQuestion';
import { ExamAnswer } from '@/components/exam/ExamAnswer';
import { ExamNavigation } from '@/components/exam/ExamNavigation';
import { Loader2 } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: 'text' | 'multiple-choice';
}

const Exam = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const [isRecording, setIsRecording] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Load exam and questions from database
  const { exam, questions, isLoading: examLoading } = useExamWithQuestions(examId);

  // Initialize exam session with persistence
  const {
    sessionId,
    currentQuestion,
    timeLeft,
    answers,
    isLoading: sessionLoading,
    updateAnswer,
    updateCurrentQuestion,
    updateTime,
    completeSession
  } = useExamSession(questions.length, examId, exam?.duration);

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
        if (import.meta.env.DEV) {
          console.log('Error stopping previous recognition:', e);
        }
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
        if (import.meta.env.DEV) {
          console.log('Recording started');
        }
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
        if (import.meta.env.DEV) {
          console.error('Speech recognition error:', event.error);
        }
        
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
            if (import.meta.env.DEV) {
              console.log('Network error (usually temporary, continuing...)');
            }
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
        if (import.meta.env.DEV) {
          console.log('Recording ended');
        }
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
          if (import.meta.env.DEV) {
            console.error('Error starting recording:', err);
          }
          setIsRecording(false);
          toast.error('Could not start recording. Please try again.');
        }
      }, 100);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error initializing speech recognition:', error);
      }
      setIsRecording(false);
      toast.error('Failed to initialize voice recording');
    }
  }, [recognition, currentQuestion, answers, isRecording, updateAnswer]);

  // Clear answer command
  const handleClearAnswer = useCallback(() => {
    updateAnswer(currentQuestion, '');
    toast.success('Answer cleared');
  }, [currentQuestion, updateAnswer]);

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
      if (import.meta.env.DEV) {
        console.error('Speech synthesis error:', event);
      }
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
      toast.success('Next question');
    }
  }, [currentQuestion, questions.length, stopRecording, updateCurrentQuestion]);

  const handlePrevious = useCallback(() => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    if (currentQuestion > 0) {
      updateCurrentQuestion(currentQuestion - 1);
      toast.success('Previous question');
    }
  }, [currentQuestion, stopRecording, updateCurrentQuestion]);

  const handleSubmit = useCallback(async () => {
    stopRecording();
    window.speechSynthesis.cancel();
    
    await completeSession();
    toast.success('Exam submitted!');
    navigate('/results');
  }, [stopRecording, completeSession, navigate]);

  // Voice commands specific to exam
  const examCommands = [
    {
      command: 'read question',
      keywords: ['read question', 'repeat question', 'read it'],
      action: readQuestionAndOptions
    },
    {
      command: 'start recording',
      keywords: ['start recording', 'record', 'begin answer'],
      action: startRecording
    },
    {
      command: 'stop recording',
      keywords: ['stop recording', 'stop', 'end recording'],
      action: stopRecording
    },
    {
      command: 'clear answer',
      keywords: ['clear answer', 'delete answer', 'remove answer'],
      action: handleClearAnswer
    },
    {
      command: 'next question',
      keywords: ['next question', 'next', 'go to next'],
      action: handleNext
    },
    {
      command: 'previous question',
      keywords: ['previous question', 'previous', 'go back'],
      action: handlePrevious
    },
    {
      command: 'submit exam',
      keywords: ['submit exam', 'submit', 'finish exam'],
      action: handleSubmit
    }
  ];

  const { speak } = useVoiceNavigation(examCommands);

  // Countdown timer
  useEffect(() => {
    if (sessionLoading || examLoading) return;

    const timer = setInterval(() => {
      updateTime(timeLeft - 1);
    }, 1000);

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleSubmit();
    }

    return () => clearInterval(timer);
  }, [sessionLoading, examLoading, timeLeft, handleSubmit, updateTime]);

  // Read question when it changes
  useEffect(() => {
    if (questions.length > 0 && !sessionLoading && !examLoading) {
      setTimeout(() => {
        readQuestionAndOptions();
      }, 1000);
    }
  }, [currentQuestion, questions.length, sessionLoading, examLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
      if (e.key === 'ArrowRight' && !isRecording) {
        handleNext();
      }
      if (e.key === 'ArrowLeft' && !isRecording) {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, startRecording, stopRecording, handleNext, handlePrevious]);

  // Loading states
  if (examLoading || sessionLoading || !exam || questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Check if exam ID is missing
  if (!examId) {
    return (
      <Layout>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No exam selected</h2>
          <p className="text-muted-foreground mb-4">Please select an exam to begin</p>
          <button 
            onClick={() => navigate('/exams')}
            className="text-primary underline"
          >
            Go to exams
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <div className="max-w-4xl mx-auto">
        <VoiceInstructions />
        <VoiceStatusBanner isRecording={isRecording} isReading={isReading} />
        
        <ExamHeader 
          examTitle={exam.title}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          timeLeft={timeLeft}
        />

        <div className="space-y-6 mb-8">
          <ExamQuestion
            question={questions[currentQuestion]}
            questionNumber={currentQuestion}
          />

          <ExamAnswer
            answer={answers[currentQuestion] || ''}
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onClearAnswer={handleClearAnswer}
          />
        </div>

        <ExamNavigation
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </Layout>
  );
};

export default Exam;
