import { useState } from 'react';
import { AlertTriangle, Ban, Flag, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BlockReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  bookingId?: string;
  mode: 'block' | 'report';
}

const COMPLAINT_TYPES = [
  { value: 'misbehavior', label: 'Misbehavior' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'no_show', label: 'No Show' },
  { value: 'payment_not_received', label: 'Payment Not Received' },
  { value: 'rule_violation', label: 'Rule Violation' },
  { value: 'other', label: 'Other' },
] as const;

export const BlockReportModal = ({ 
  isOpen, 
  onClose, 
  targetUserId, 
  targetUserName, 
  bookingId,
  mode 
}: BlockReportModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [complaintType, setComplaintType] = useState<string>('misbehavior');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlock = async () => {
    if (!user || !profile) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: targetUserId,
          reason: reason.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already blocked',
            description: 'You have already blocked this user.',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'User blocked',
          description: `${targetUserName} has been blocked. They won't be able to contact you.`,
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to block user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!user || !profile || !reason.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide details about the issue.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          reporter_id: user.id,
          reported_user_id: targetUserId,
          booking_id: bookingId || null,
          complaint_type: complaintType as any,
          description: reason.trim(),
          status: 'open',
        });

      if (error) throw error;

      toast({
        title: 'Report submitted',
        description: 'Our team will review your complaint and take appropriate action.',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'block' ? (
              <>
                <Ban className="w-5 h-5 text-red-500" />
                Block {targetUserName}
              </>
            ) : (
              <>
                <Flag className="w-5 h-5 text-orange-500" />
                Report {targetUserName}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'block' 
              ? 'Once blocked, this user will not be able to see your profile or contact you.'
              : 'Please provide details so our team can investigate.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {mode === 'report' && (
            <div className="space-y-3">
              <Label>Type of Issue</Label>
              <RadioGroup value={complaintType} onValueChange={setComplaintType}>
                {COMPLAINT_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>
              {mode === 'block' ? 'Reason (optional)' : 'Description *'}
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={mode === 'block' 
                ? 'Why are you blocking this user?' 
                : 'Please describe what happened in detail...'}
              rows={4}
            />
          </div>

          {mode === 'report' && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                False reports may result in action against your account. Please only report genuine issues.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={mode === 'block' ? 'destructive' : 'warm'}
              className="flex-1"
              onClick={mode === 'block' ? handleBlock : handleReport}
              disabled={isSubmitting || (mode === 'report' && !reason.trim())}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : mode === 'block' ? (
                <Ban className="w-4 h-4 mr-2" />
              ) : (
                <Flag className="w-4 h-4 mr-2" />
              )}
              {mode === 'block' ? 'Block User' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
