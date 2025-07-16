
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, ArrowLeft, Mail } from 'lucide-react';

export default function DirectPasswordReset() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists by attempting to sign in with a dummy password
      // This is a workaround since Supabase doesn't provide a direct way to check if email exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-to-check-existence'
      });

      // If we get an "Invalid login credentials" error, the email exists but password is wrong
      // If we get a different error or no error, we handle accordingly
      if (signInError?.message === 'Invalid login credentials') {
        // Email exists, proceed to password reset
        setStep('password');
      } else if (signInError?.message.includes('Email not confirmed')) {
        // Email exists but not confirmed, still allow password reset
        setStep('password');
      } else {
        // Email doesn't exist or other error
        setError('User not found. Please check your email address.');
      }
    } catch (error: any) {
      console.error('Error checking email:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // First, sign in the user with their email and a temporary session
      // We'll use the admin API approach by updating the user directly
      
      // Since we can't directly update password without authentication,
      // we'll need to use a different approach - create a temporary session
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: newPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError && !signUpError.message.includes('User already registered')) {
        throw signUpError;
      }

      // If user already exists, we need to use the password recovery flow
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-direct?email=${encodeURIComponent(email)}&password=${encodeURIComponent(newPassword)}`
      });

      if (resetError) {
        throw resetError;
      }

      toast({
        title: "Password Reset Initiated",
        description: "Please check your email to complete the password reset process."
      });

      navigate('/');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {step === 'email' ? (
              <Mail className="w-12 h-12 text-primary" />
            ) : (
              <Lock className="w-12 h-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === 'email' ? 'Reset Password' : 'Set New Password'}
          </CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your email address to reset your password'
              : 'Enter your new password below'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToEmail}
                className="w-full text-sm"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Email
              </Button>
            </form>
          )}
          
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToLogin}
              className="text-sm"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
