import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Results = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const announcement = 'Results page. Your exam results are displayed below. You scored 85 percent.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const results = {
    examTitle: 'Mathematics Final Exam',
    score: 85,
    totalQuestions: 25,
    correct: 21,
    incorrect: 4,
    timeTaken: '45 minutes',
    date: new Date().toLocaleDateString()
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Exam Results</h1>

        {/* Summary Card */}
        <Card className="gradient-card border-primary/30 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{results.examTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-7xl font-bold mb-4">
                <span className={results.score >= 70 ? 'text-success' : 'text-warning'}>
                  {results.score}%
                </span>
              </div>
              <p className="text-accessible-lg text-muted-foreground">
                {results.score >= 70 ? 'Excellent work!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">{results.correct}</div>
                <div className="text-accessible text-muted-foreground">Correct</div>
              </div>

              <div className="text-center p-4 bg-background/50 rounded-lg">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold">{results.incorrect}</div>
                <div className="text-accessible text-muted-foreground">Incorrect</div>
              </div>

              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{results.timeTaken}</div>
                <div className="text-accessible text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <div className="mt-6 text-center text-accessible text-muted-foreground">
              Completed on {results.date}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 min-h-[56px] text-lg"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/exam')}
            variant="outline"
            className="flex-1 min-h-[56px] text-lg"
          >
            Take Another Exam
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
