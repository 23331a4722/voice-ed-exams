import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const announcement = 'Login page. Enter your credentials to access VoiceEd.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Mock authentication - in production, this would be real auth
    toast.success('Login successful!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 min-h-[44px]"
          aria-label="Go back to home"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </Button>

        <Card className="gradient-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription className="text-accessible">
              Sign in to access your exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-accessible">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="min-h-[48px] text-accessible"
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-accessible">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="min-h-[48px] text-accessible"
                  aria-required="true"
                />
              </div>

              <Button
                type="submit"
                className="w-full min-h-[56px] text-lg shadow-glow"
              >
                Sign In
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/register')}
                  className="text-accessible"
                >
                  Don't have an account? Register here
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
