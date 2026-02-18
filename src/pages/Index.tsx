import { Navigate } from "react-router-dom";

// Redirect root to the dashboard layout's root route
const Index = () => <Navigate to="/" replace />;

export default Index;
