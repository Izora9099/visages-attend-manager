import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
      setError('Enter your username and password.');
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
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — flat navy, no gradients */}
      <aside className="hidden flex-col justify-between bg-navy p-12 text-rail-ink lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <img src="/Uploads/FaceIt logo no bg__cropped.png" alt="" className="h-10 w-10 object-contain" />
          <div>
            <p className="font-display text-lg font-bold leading-5 tracking-[0.02em]">FACE.IT</p>
            <p className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.2em] text-rail-muted">Attendance console</p>
          </div>
        </div>

        <div className="max-w-xl">
          <h2 className="text-display-xl text-balance">Attendance, measured.</h2>
          <p className="mt-6 max-w-md text-body-l text-rail-muted">
            Run sessions, verify students by face and prove who was in the room — with the
            confidence score and a manual fallback on every match.
          </p>
        </div>

        <dl className="grid max-w-md grid-cols-3 gap-8 border-t border-rail-hairline pt-6">
          {[
            ['0.75', 'Match threshold'],
            ['5', 'Face images per student'],
            ['75%', 'Eligibility minimum'],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse gap-1">
              <dt className="text-[11px] font-medium uppercase leading-4 tracking-[0.12em] text-rail-muted">{l}</dt>
              <dd className="num font-display text-[28px] font-semibold leading-8 text-scan-pale">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center p-4 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <img src="/Uploads/FaceIt logo no bg__cropped.png" alt="" className="h-8 w-8 object-contain" />
            <p className="font-display text-base font-bold tracking-[0.02em]">FACE.IT</p>
          </div>

          <p className="eyebrow mb-2">Sign in</p>
          <h1 className="text-heading-1 text-ink">Welcome back</h1>
          <p className="mb-8 mt-2 text-ink-muted">
            Sign in with the account your administrator gave you.
          </p>

          {error && (
            <div
              role="alert"
              id="login-error"
              className="mb-6 flex items-start gap-3 rounded-md bg-absent-soft px-4 py-3 text-sm leading-5 text-absent"
            >
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-[13px] font-medium leading-[18px] text-ink">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="jane.doe"
                disabled={isLoading}
                autoComplete="username"
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "login-error" : undefined}
                required
                className="h-control-lg text-[15px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium leading-[18px] text-ink">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="text-[13px]"
                  onClick={() => toast.info("Contact your system administrator to reset your password.")}
                >
                  Forgot password
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  required
                  className="h-control-lg pr-12 text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-md text-ink-muted transition-colors duration-120 hover:text-ink"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" block loading={isLoading} className="mt-2">
              {isLoading ? 'Signing in' : 'Sign in'}
              {!isLoading && <ArrowRight aria-hidden="true" />}
            </Button>
          </form>

          <div className="mt-12 flex justify-between border-t border-hairline pt-6 text-caption text-ink-muted">
            <span>FACE.IT &copy; 2026</span>
            <span>Biometric data stays on your institution's server</span>
          </div>
        </div>
      </main>
    </div>
  );
}
