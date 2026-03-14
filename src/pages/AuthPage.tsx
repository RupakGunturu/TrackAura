import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Chrome } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: string } | null)?.from || "/dashboard/projects";

  const [mode, setMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard/projects`,
      },
    });

    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    }
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("not found")) {
        toast({ title: "No account found", description: "Please sign up first.", variant: "destructive" });
        setMode("signup");
      } else {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Welcome back" });
    navigate(from, { replace: true });
  };

  const onSignup = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    setBusy(false);

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Account created", description: "Check your email for verification if required." });
    setMode("login");
  };

  const onForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setBusy(false);

    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Reset link sent", description: "Check your email inbox." });
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-gray-50 grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[460px]">
          {mode === "login" && (
            <>
              <h1 className="text-5xl font-black text-green-700 tracking-tight">Welcome Back</h1>
              <p className="mt-3 text-lg text-gray-500">Please enter your details to sign in</p>
            </>
          )}

          {mode === "signup" && (
            <>
              <h1 className="text-5xl font-black text-green-700 tracking-tight">Create Account</h1>
              <p className="mt-3 text-lg text-gray-500">Start tracking your project analytics in minutes</p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h1 className="text-5xl font-black text-green-700 tracking-tight">Forgot Password?</h1>
              <p className="mt-3 text-lg text-gray-500">Enter your email and we will send a reset link</p>
            </>
          )}

          {mode !== "forgot" && (
            <Button type="button" onClick={onGoogleLogin} className="mt-8 h-12 w-full rounded-xl bg-green-700 hover:bg-green-800 text-white text-lg font-semibold">
              <Chrome className="h-5 w-5 mr-2" /> Continue with Google
            </Button>
          )}

          <div className="my-6 flex items-center gap-4 text-gray-400">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm">Or continue with email</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {mode === "login" && (
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-green-700">Email</label>
                <div className="relative mt-1">
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl pl-9 text-base" placeholder="studios@example.com" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-green-700">Password</label>
                <div className="relative mt-1">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl pl-9 pr-10 text-base" placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <button type="button" className="font-semibold text-gray-800 hover:text-green-700" onClick={() => setMode("forgot")}>Forgot password?</button>
              </div>

              <Button disabled={busy} className="h-12 w-full rounded-xl bg-green-700 hover:bg-green-800 text-white text-xl font-semibold">
                {busy ? "Signing In..." : "Sign In"}
              </Button>

              <p className="text-center text-base text-gray-500">Don't have an account? <button type="button" className="font-bold text-gray-900" onClick={() => setMode("signup")}>Sign up</button></p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={onSignup} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-green-700">Name</label>
                <div className="relative mt-1">
                  <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl pl-9 text-base" placeholder="Your name" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-green-700">Email</label>
                <div className="relative mt-1">
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl pl-9 text-base" placeholder="studios@example.com" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-green-700">Password</label>
                <div className="relative mt-1">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl pl-9 pr-10 text-base" placeholder="Create password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button disabled={busy} className="h-12 w-full rounded-xl bg-green-700 hover:bg-green-800 text-white text-xl font-semibold">
                {busy ? "Creating..." : "Sign Up"}
              </Button>

              <p className="text-center text-base text-gray-500">Already have an account? <button type="button" className="font-bold text-gray-900" onClick={() => setMode("login")}>Sign in</button></p>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={onForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-green-700">Email</label>
                <div className="relative mt-1">
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl pl-9 text-base" placeholder="studios@example.com" />
                </div>
              </div>

              <Button disabled={busy} className="h-12 w-full rounded-xl bg-green-700 hover:bg-green-800 text-white text-xl font-semibold">
                {busy ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-base text-gray-500">Remember your password? <button type="button" className="font-bold text-gray-900" onClick={() => setMode("login")}>Sign in</button></p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900">Back to Home</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden border-l border-white/40 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700">
        <div className="absolute inset-0 p-12 text-white">
          <h2 className="text-7xl font-black leading-[1.05] tracking-tight">
            Manage Less.<br />
            <span className="text-green-100">Create More.</span>
          </h2>
          <p className="mt-5 text-2xl max-w-2xl text-white/90">Your all in one AI studio management platform helps to boost efficiency and productivity</p>

          <div className="mt-16 mx-auto max-w-5xl rounded-[36px] border-[12px] border-black/80 bg-white shadow-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1551281044-8b0d0f3b8f3b?q=80&w=1800&auto=format&fit=crop" alt="Dashboard preview" className="h-[520px] w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
