"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { signIn, signUp, getCurrentUser } from '@/app/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push('/dashboard');
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.log(err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signUp(email, password, name);
      if (result.error) {
        setError('Failed to create account. Email may be in use.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.log(err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black">
        <div className="animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <header className="px-6 py-4 border-b bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">MED E-KART</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col lg:flex-row container mx-auto py-12 px-4">
        <div className="w-full lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Automated Medicine Dispenser</h2>
          <p className="text-zinc-600 mb-6">
            MED E-KART combines digital prescription management with an automated medicine dispensing system. 
            Like a vending machine for medications, it ensures accurate and timely dispensing of prescribed 
            medicines based on verified digital prescriptions.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-zinc-100 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M15 2v2" />
                  <path d="M15 20v2" />
                  <path d="M2 15h2" />
                  <path d="M20 15h2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Automated Dispensing</h3>
                <p className="text-zinc-600">Secure vending machine-style dispensing of prescribed medications.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-zinc-100 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Digital Prescriptions</h3>
                <p className="text-zinc-600">Generate and verify digital prescriptions for seamless dispensing.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-zinc-100 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Verification</h3>
                <p className="text-zinc-600">QR code scanning ensures only authorized medications are dispensed.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-zinc-100 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Error Prevention</h3>
                <p className="text-zinc-600">Automated dispensing eliminates human errors in medication delivery.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2">
          <Card className="max-w-md mx-auto">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Welcome</CardTitle>
                  <TabsList>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  Manage prescriptions and access the medicine dispenser
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="doctor@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Dr. John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="doctor@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
              
              <CardFooter className="flex justify-center text-sm text-zinc-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      </main>
      
      <footer className="py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} MED E-KART. All rights reserved.
        </div>
      </footer>
    </div>
  );
}