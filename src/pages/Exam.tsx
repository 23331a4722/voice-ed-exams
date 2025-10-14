import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
      const text = `Question ${currentQuestion + 1} of ${questions.length}. ${questions[currentQuestion].question}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentQuestion, questions]);

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
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported');
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
      toast.error('Recording error. Please try again.');
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
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    window.speechSynthesis.cancel();
    toast.success('Exam submitted successfully!');
    navigate('/results');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
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
                🔊
              </Button>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </CardHeader>
          <CardContent>
            <p className="text-accessible-lg mb-6">
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
                variant={isRecording ? 'destructive' : 'secondary'}
                className="w-full min-h-[56px] text-lg voice-pulse"
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Record Voice Answer
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
