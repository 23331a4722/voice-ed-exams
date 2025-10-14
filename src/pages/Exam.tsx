import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';

const Exam = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const questions = [
    {
      id: 1,
      question: 'What is the capital of France?',
      type: 'text'
    },
    {
      id: 2,
      question: 'Explain the process of photosynthesis in plants.',
      type: 'text'
    },
    {
      id: 3,
      question: 'Calculate the area of a circle with radius 5 units.',
      type: 'text'
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const speakQuestion = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Question ${currentQuestion + 1} of ${questions.length}. ${questions[currentQuestion].question}. Say your answer or say next question to continue, previous question to go back, or submit exam to finish.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentQuestion, questions]);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Next question');
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentQuestion, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Previous question');
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentQuestion]);

  const handleSubmit = useCallback(() => {
    window.speechSynthesis.cancel();
    toast.success('Exam submitted successfully!');
    const utterance = new SpeechSynthesisUtterance('Exam submitted successfully!');
    window.speechSynthesis.speak(utterance);
    navigate('/results');
  }, [navigate]);

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
      action: speakQuestion
    },
    {
      command: 'answer question',
      keywords: ['answer question', 'record answer', 'start recording'],
      action: () => {
        if (!isRecording) {
          startRecording();
        }
      }
    },
    {
      command: 'stop recording',
      keywords: ['stop recording', 'stop', 'finish recording'],
      action: () => {
        if (isRecording) {
          stopRecording();
        }
      }
    }
  ];

  const { speak } = useVoiceNavigation(examVoiceCommands);

  useEffect(() => {
    // Announce exam page on load
    const announcement = 'Exam page. Voice commands available: Say next question, previous question, repeat question, answer question, or submit exam.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    utterance.onend = () => {
      // Read the first question after the announcement
      setTimeout(() => speakQuestion(), 500);
    };
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  useEffect(() => {
    speakQuestion();
  }, [currentQuestion, speakQuestion]);

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

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported');
      speak('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const newRecognition = new SpeechRecognitionAPI();
    
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'en-US';

    newRecognition.onstart = () => {
      setIsRecording(true);
      toast.info('Recording started. Speak your answer.');
      speak('Recording your answer. Speak now.');
    };

    newRecognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = transcript;
      setAnswers(newAnswers);
    };

    newRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error('Recording error. Please try again.');
        speak('Recording error. Please try again.');
      }
    };

    newRecognition.onend = () => {
      setIsRecording(false);
    };

    setRecognition(newRecognition);
    newRecognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      toast.success('Answer recorded');
      speak('Answer recorded successfully');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Voice Instructions Banner */}
        <Card className="mb-6 bg-primary/10 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Volume2 className="h-6 w-6 text-primary" />
              <p className="text-accessible">
                <strong>Voice Commands:</strong> "Next question" • "Previous question" • "Answer question" • "Repeat question" • "Submit exam"
              </p>
            </div>
          </CardContent>
        </Card>

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
        <Card className="mb-6 gradient-card">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-2xl">
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={speakQuestion}
                className="min-w-[44px] min-h-[44px]"
                aria-label="Repeat question"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </CardHeader>
          <CardContent>
            <p className="text-accessible-lg mb-6 font-medium">
              {questions[currentQuestion].question}
            </p>

            {/* Answer Input */}
            <div className="space-y-4">
              <Textarea
                value={answers[currentQuestion]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder="Type your answer or use voice recording..."
                className="min-h-[150px] text-accessible"
                aria-label="Answer input"
              />

              {/* Voice Recording */}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'destructive' : 'default'}
                className={`w-full min-h-[56px] text-lg ${isRecording ? 'voice-pulse shadow-glow' : ''}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Recording (or say "stop recording")
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Record Voice Answer (or say "answer question")
                  </>
                )}
              </Button>
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
