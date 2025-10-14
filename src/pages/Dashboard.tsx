import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const announcement = 'Student Dashboard. You have 3 available exams. Use voice commands or tap to start an exam.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const exams = [
    {
      id: 1,
      title: 'Mathematics Final Exam',
      duration: '60 minutes',
      questions: 25,
      status: 'available'
    },
    {
      id: 2,
      title: 'English Literature Quiz',
      duration: '30 minutes',
      questions: 15,
      status: 'available'
    },
    {
      id: 3,
      title: 'Science Midterm',
      duration: '45 minutes',
      questions: 20,
      status: 'completed'
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Welcome Back, Student!</h1>
        <p className="text-accessible text-muted-foreground mb-8">
          Select an exam to begin, or use voice commands like "Start exam"
        </p>

        <div className="grid gap-6">
          {exams.map((exam) => (
            <Card 
              key={exam.id}
              className={`gradient-card border-2 ${
                exam.status === 'available' 
                  ? 'border-primary/50 hover:border-primary' 
                  : 'border-border opacity-75'
              } transition-all`}
            >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{exam.title}</CardTitle>
                  <CardDescription className="text-accessible">
                    <span className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        {exam.questions} questions
                      </span>
                    </span>
                  </CardDescription>
                </div>
                  {exam.status === 'completed' && (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {exam.status === 'available' ? (
                  <Button
                    onClick={() => navigate('/exam')}
                    className="min-h-[48px] w-full sm:w-auto shadow-glow"
                  >
                    Start Exam
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/results')}
                    variant="outline"
                    className="min-h-[48px] w-full sm:w-auto"
                  >
                    View Results
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
