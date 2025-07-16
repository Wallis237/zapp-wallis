
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Eye, EyeOff, Upload } from 'lucide-react';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is coming from password reset email
  useEffect(() => {
    const checkForPasswordReset = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check if this is a password recovery session
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('type') === 'recovery') {
          // Redirect to reset password page
          window.location.href = '/reset-password' + window.location.search;
        }
      }
    };
    
    checkForPasswordReset();
  }, []);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePhoto = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Logged in successfully!"
        });
        onAuthSuccess();
      } else {
        // Sign up without email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || email.split('@')[0],
              display_name: displayName || email.split('@')[0]
            }
          }
        });
        
        if (error) throw error;

        // Since email confirmation is disabled, the user should be automatically signed in
        if (data.user && !data.session) {
          // If for some reason there's no session, try to sign in immediately
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) throw signInError;
        }

        // Upload profile photo if provided
        if (data.user && profilePhoto) {
          try {
            const avatarUrl = await uploadProfilePhoto(data.user.id, profilePhoto);
            
            // Update profile with avatar URL
            await supabase
              .from('profiles')
              .update({ avatar_url: avatarUrl })
              .eq('id', data.user.id);
          } catch (uploadError) {
            console.error('Error uploading profile photo:', uploadError);
            // Don't fail the signup for photo upload issues
          }
        }
        
        toast({
          title: "Success",
          description: "Account created successfully! You are now logged in."
        });
        
        onAuthSuccess();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectPasswordReset = () => {
    navigate('/direct-reset-password');
  };

  const getTitle = () => {
    if (showForgotPassword) return 'Reset Password';
    return isLogin ? 'Welcome Back' : 'Join Chat App';
  };

  const getDescription = () => {
    if (showForgotPassword) return 'Enter your email to receive reset instructions';
    return isLogin ? 'Sign in to continue chatting' : 'Create an account to start chatting';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                {isLogin && (
                  <div className="text-right space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline block"
                      disabled={isLoading}
                    >
                      Forgot Password?
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectPasswordReset}
                      className="text-sm text-blue-600 hover:underline block"
                      disabled={isLoading}
                    >
                      Reset Password Directly
                    </button>
                  </div>
                )}
                
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        {profilePhotoPreview && (
                          <img 
                            src={profilePhotoPreview} 
                            alt="Profile preview" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md hover:bg-accent">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Upload Photo</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
