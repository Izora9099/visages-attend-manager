import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, ScanFace, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = (location.state as LocationState)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
      {/* Left — editorial panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 ink-panel overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, hsl(22 80% 60%) 0, transparent 40%), radial-gradient(circle at 80% 80%, hsl(22 80% 60%) 0, transparent 40%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(40 18% 88% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(40 18% 88% / 1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative flex items-center gap-3 z-10">
          <div className="h-9 w-9 rounded-md bg-accent/90 flex items-center justify-center shadow-md">
            <ScanFace className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg tracking-tight text-sidebar-foreground">FACE.IT</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/50">Attendance Intelligence</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="eyebrow text-sidebar-foreground/60 mb-6">Volume I — Issue 04</p>
          <h2 className="display-serif font-light text-5xl xl:text-6xl leading-[1.05] text-sidebar-foreground text-balance">
            Attendance, <em className="text-accent not-italic font-normal">measured</em> with the
            precision of a&nbsp;modern&nbsp;register.
          </h2>
          <p className="mt-8 text-sidebar-foreground/70 text-[15px] leading-relaxed max-w-md">
            A quietly powerful platform for departments who treat presence as data, and
            data as evidence. Built for institutions, refined for daily use.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-8 max-w-md">
          {[
            ['98.7', 'Recognition accuracy'],
            ['12k+', 'Daily check-ins'],
            ['<400ms', 'Verification time'],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="display-serif text-2xl text-sidebar-foreground num font-light">{v}</p>
              <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex items-center justify-center p-6 sm:p-12 paper">
        <div className="w-full max-w-sm animate-fade-up">
          {/* mobile brand */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center">
              <ScanFace className="h-4 w-4 text-background" />
            </div>
            <p className="font-display text-base">FACE.IT</p>
          </div>

          <p className="eyebrow mb-3">Sign in</p>
          <h1 className="display-serif text-4xl leading-[1.05] text-balance">
            Welcome back.
          </h1>
          <p className="text-muted-foreground text-sm mt-3 mb-10">
            Enter your credentials to access the dashboard.
          </p>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive animate-fade-in">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="eyebrow">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="jane.doe"
                disabled={isLoading}
                autoComplete="username"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="eyebrow">Password</Label>
                <button type="button" className="text-[11px] uppercase tracking-wider text-accent hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="ink"
              size="lg"
              className="w-full mt-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Signing in</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-6 border-t border-hairline text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 flex justify-between">
            <span>FACE.IT &copy; 2026</span>
            <span>Secure by design</span>
          </div>
        </div>
      </main>
    </div>
  );
}
