import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, ClipboardList, BarChart } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState('');

  useEffect(() => {
    const announcement = 'Admin panel. Create and manage exams, monitor student progress.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !duration || !questions) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Exam created successfully!');
    setExamTitle('');
    setDuration('');
    setQuestions('');
  };

  const stats = [
    { label: 'Total Students', value: 156, icon: Users },
    { label: 'Active Exams', value: 8, icon: ClipboardList },
    { label: 'Avg. Score', value: '78%', icon: BarChart }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        {/* Stats */}
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
                    <Icon className="h-12 w-12 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create Exam Form */}
        <Card className="gradient-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Create New Exam
            </CardTitle>
            <CardDescription className="text-accessible">
              Set up a new exam for your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateExam} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examTitle" className="text-accessible">
                  Exam Title
                </Label>
                <Input
                  id="examTitle"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g., Mathematics Final Exam"
                  className="min-h-[48px] text-accessible"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-accessible">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="min-h-[48px] text-accessible"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions" className="text-accessible">
                  Questions (one per line)
                </Label>
                <Textarea
                  id="questions"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder="What is 2+2?&#10;Explain photosynthesis.&#10;Name three planets."
                  className="min-h-[150px] text-accessible"
                />
              </div>

              <Button
                type="submit"
                className="w-full min-h-[56px] text-lg shadow-glow"
              >
                Create Exam
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Exams */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Exams</h2>
          <div className="grid gap-4">
            {[
              { title: 'Mathematics Final', students: 45, avgScore: 82 },
              { title: 'English Literature', students: 38, avgScore: 76 },
              { title: 'Science Midterm', students: 52, avgScore: 79 }
            ].map((exam, index) => (
              <Card key={index} className="gradient-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                      <p className="text-accessible text-muted-foreground">
                        {exam.students} students · Avg. {exam.avgScore}%
                      </p>
                    </div>
                    <Button variant="outline" className="min-h-[44px]">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
