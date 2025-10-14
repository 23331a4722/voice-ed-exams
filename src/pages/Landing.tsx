import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Eye, Volume2, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Announce page to screen readers
    const announcement = 'Welcome to VoiceEd. An inclusive exam platform for all students. Voice navigation enabled.';
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  }, []);

  const features = [
    {
      icon: Mic,
      title: 'Voice Navigation',
      description: 'Navigate entirely through voice commands. Hands-free, accessible exam taking.'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'All questions and content read aloud automatically with natural speech.'
    },
    {
      icon: Eye,
      title: 'High Contrast Design',
      description: 'WCAG 2.1 AA compliant with large text and clear visual hierarchy.'
    },
    {
      icon: CheckCircle,
      title: 'Auto-Save',
      description: 'Your answers are saved automatically. Never worry about losing progress.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                VoiceEd
              </span>
              <br />
              <span className="text-foreground text-4xl md:text-5xl">
                Inclusive Exams for All
              </span>
            </h1>
            <p className="text-accessible-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Empowering visually impaired students with voice-enabled exams. 
              Take tests, navigate, and succeed—all through voice commands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="min-h-[56px] text-lg shadow-glow"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register')}
                className="min-h-[56px] text-lg"
              >
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Built for <span className="text-primary">Accessibility</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="gradient-card p-6 rounded-lg border border-border hover:border-primary transition-all"
                >
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-accessible text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center gradient-card p-12 rounded-2xl border border-primary/30 shadow-glow">
            <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
            <p className="text-accessible-lg text-muted-foreground mb-8">
              Join VoiceEd today and experience truly inclusive education.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="min-h-[56px] text-lg"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
