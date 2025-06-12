
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVideoCall: boolean;
  contactName: string;
  contactAvatar?: string;
  isIncoming?: boolean;
}

export function CallModal({ 
  isOpen, 
  onClose, 
  isVideoCall, 
  contactName, 
  contactAvatar, 
  isIncoming = false 
}: CallModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(!isIncoming);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setCallDuration(0);
    setIsCallActive(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={contactAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {contactName?.split(' ').map(n => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{contactName}</h3>
            <p className="text-muted-foreground">
              {isIncoming && !isCallActive 
                ? `Incoming ${isVideoCall ? 'video' : 'voice'} call...` 
                : isCallActive 
                ? formatDuration(callDuration)
                : `${isVideoCall ? 'Video' : 'Voice'} calling...`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isIncoming && !isCallActive && (
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                onClick={handleAnswer}
              >
                {isVideoCall ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </Button>
            )}
            
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full w-16 h-16"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          {isVideoCall && isCallActive && (
            <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Video call simulation</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
