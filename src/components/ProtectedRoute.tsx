import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { ROLES } from '@/constants/roles';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!authLoading) {
      // If no specific roles required, just check authentication
      if (allowedRoles.length === 0) {
        setIsAuthorized(isAuthenticated);
      } else {
        // Check if user has any of the required roles
        const hasRequiredRole = user?.role && allowedRoles.includes(user.role);
        setIsAuthorized(!!(isAuthenticated && hasRequiredRole));
      }
    }
  }, [isAuthenticated, authLoading, user, allowedRoles]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // If authenticated but not authorized for this route
  if (isAuthorized === false) {
    // Option 1: Redirect to a not-authorized page
    // return <Navigate to="/not-authorized" state={{ from: location }} replace />;
    
    // Option 2: Show an unauthorized message
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-6 max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // If authorized, render the children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;