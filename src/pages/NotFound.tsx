import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <LayoutDashboard className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
