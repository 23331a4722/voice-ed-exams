import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceButton } from './VoiceButton';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const Layout = ({ children, showNav = true }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isListening, startListening, stopListening } = useVoiceNavigation();
  const { signOut, userRole } = useAuth();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: 'Exams', path: '/exam' },
    { icon: BarChart3, label: 'Results', path: '/results' },
    { icon: Settings, label: 'Admin', path: '/admin' },
  ];

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            VoiceEd
          </h1>
          <div className="flex items-center gap-4">
            <VoiceButton 
              isListening={isListening} 
              onToggle={handleVoiceToggle}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Logout"
              className="min-w-[44px] min-h-[44px]"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-4 z-50"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-around items-center max-w-2xl mx-auto">
              {navItems
                .filter(item => {
                  // Show Dashboard, Exams, Results for students
                  if (userRole === 'student') {
                    return item.path !== '/admin';
                  }
                  // Show only Admin for teachers/admins
                  return item.path === '/admin';
                })
                .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center gap-1 min-w-[60px] min-h-[60px] h-auto py-2"
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};
