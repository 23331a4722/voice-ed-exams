import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const announcement = 'Registration page. Create your VoiceEd account. Please select your role: student or teacher.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    // Mock registration
    toast.success('Registration successful! Please login.');
    navigate('/login');
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
            <CardTitle className="text-3xl">Create Account</CardTitle>
            <CardDescription className="text-accessible">
              Join VoiceEd and start your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-accessible">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="min-h-[48px] text-accessible"
                  aria-required="true"
                />
              </div>

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
                  placeholder="Create a strong password"
                  className="min-h-[48px] text-accessible"
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-accessible">
                  I am a...
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="min-h-[48px] text-accessible bg-background">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="student" className="text-accessible">Student</SelectItem>
                    <SelectItem value="teacher" className="text-accessible">Teacher/Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full min-h-[56px] text-lg shadow-glow"
              >
                Create Account
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/login')}
                  className="text-accessible"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
