import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const announcement = 'Student Dashboard. Browse available exams or check your results. Use voice commands or tap to navigate.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const stats = [
    { label: 'Available Exams', value: '3', icon: ClipboardList },
    { label: 'Completed', value: '5', icon: CheckCircle2 },
    { label: 'Average Score', value: '85%', icon: Clock },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Welcome Back, Student!</h1>
        <p className="text-accessible text-muted-foreground mb-8">
          Your exam dashboard - start a new exam or review your progress
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-accessible text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className="h-10 w-10 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="gradient-card border-2 border-primary/50 hover:border-primary transition-all cursor-pointer"
                onClick={() => navigate('/exams')}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ClipboardList className="h-6 w-6" />
                Browse Exams
              </CardTitle>
              <CardDescription className="text-accessible">
                View and start available exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/exams')}
                className="min-h-[48px] w-full shadow-glow"
              >
                View All Exams
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-card border-2 border-border hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => navigate('/results')}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                My Results
              </CardTitle>
              <CardDescription className="text-accessible">
                Review your exam performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/results')}
                variant="outline"
                className="min-h-[48px] w-full"
              >
                View Results
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
