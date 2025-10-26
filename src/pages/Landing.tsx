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
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Mic className="h-4 w-4" />
                Voice-Powered Accessibility
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Education That
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Everyone Can Access
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Take exams with complete independence using voice commands. Built for visually impaired students, designed for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="min-h-[56px] text-lg px-8 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register')}
                className="min-h-[56px] text-lg px-8"
              >
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for <span className="text-primary">Inclusive Learning</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature designed with accessibility and ease of use in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Intuitive, Accessible
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes with our straightforward process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Quick and easy registration process' },
              { step: '02', title: 'Start Your Exam', desc: 'Choose your exam and begin with voice guidance' },
              { step: '03', title: 'Answer with Voice', desc: 'Speak your answers naturally and submit' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 md:p-16 rounded-2xl border border-primary/20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Experience Inclusive Education?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join students who are already taking exams with confidence using VoiceEd
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="min-h-[56px] text-lg px-8 shadow-lg hover:shadow-xl transition-all"
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
