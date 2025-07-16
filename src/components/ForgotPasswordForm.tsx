
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the direct reset password page instead of the problematic email flow
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions. If the email link doesn't work, use the 'Reset Password Directly' option instead."
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">Email Sent!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We've sent password reset instructions to <strong>{email}</strong>. 
            Click the link in the email to reset your password.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            If the email link doesn't work, you can use the "Reset Password Directly" option instead.
          </p>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Reset Your Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        <p className="text-xs text-muted-foreground mt-2 text-orange-600">
          Note: If the email link doesn't work, try the "Reset Password Directly" option from the login page.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handlePasswordReset} className="space-y-4">
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
          {isLoading ? 'Sending Reset Email...' : 'Send Reset Instructions'}
        </Button>
      </form>
      
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="w-full text-sm"
        disabled={isLoading}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Login
      </Button>
    </div>
  );
}
