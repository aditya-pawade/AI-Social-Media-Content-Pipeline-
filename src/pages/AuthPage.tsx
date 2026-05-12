import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Sparkles, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8 text-neutral-100">
          <div className="h-12 w-12 bg-neutral-100 text-neutral-900 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">SocialPipeline AI</h1>
          <p className="text-neutral-400 text-sm mt-2">End-to-end content generation studio</p>
        </div>

        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-neutral-100">Welcome back</CardTitle>
            <CardDescription className="text-neutral-400">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 h-11" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mr-2" />
              ) : null}
              Continue with Google
            </Button>
            <p className="text-center text-xs text-neutral-500 mt-4">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
