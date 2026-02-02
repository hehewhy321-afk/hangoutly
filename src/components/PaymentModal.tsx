import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, QrCode, Check, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentRequest {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  payment_qr_url: string | null;
  payment_method: string | null;
  requested_at: string;
  companion: {
    first_name: string;
  } | null;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onPaymentComplete?: () => void;
}

export const PaymentModal = ({ isOpen, onClose, bookingId, onPaymentComplete }: PaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchPaymentRequest();
    }
  }, [isOpen, bookingId]);

  const fetchPaymentRequest = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          companion:companion_id(first_name)
        `)
        .eq('booking_id', bookingId)
        .order('requested_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPaymentRequest(data);
    } catch (error) {
      console.error('Error fetching payment request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentRequest || !user) return;
    
    setIsMarking(true);
    try {
      // Update payment request status
      const { error: prError } = await supabase
        .from('payment_requests')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', paymentRequest.id);

      if (prError) throw prError;

      // Update booking payment status
      const { error: bError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId);

      if (bError) throw bError;

      // Notify companion
      const { data: booking } = await supabase
        .from('bookings')
        .select('companion_id')
        .eq('id', bookingId)
        .single();

      if (booking) {
        // Get companion's user_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', booking.companion_id)
          .single();

        if (profile) {
          await supabase.from('notifications').insert({
            user_id: profile.user_id,
            type: 'payment_marked_paid',
            title: 'Payment Marked as Paid',
            message: `User has marked their payment of Rs. ${paymentRequest.amount} as paid. Please verify and confirm.`,
            data: { booking_id: bookingId, amount: paymentRequest.amount },
          });
        }
      }

      toast({
        title: 'Payment marked as paid',
        description: 'The companion will verify and confirm your payment.',
      });

      onPaymentComplete?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark payment as paid',
        variant: 'destructive',
      });
    } finally {
      setIsMarking(false);
    }
  };

  const handleDispute = async () => {
    if (!paymentRequest || !user) return;
    
    setIsDisputing(true);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ status: 'disputed' })
        .eq('id', paymentRequest.id);

      if (error) throw error;

      await supabase
        .from('bookings')
        .update({ payment_status: 'disputed' })
        .eq('id', bookingId);

      toast({
        title: 'Payment disputed',
        description: 'An admin will review your dispute.',
      });

      onPaymentComplete?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to raise dispute',
        variant: 'destructive',
      });
    } finally {
      setIsDisputing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Request
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !paymentRequest ? (
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment request yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              The companion will send a payment request after accepting your booking.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-3xl font-bold text-gradient-primary">Rs. {paymentRequest.amount}</p>
              {paymentRequest.payment_method && (
                <p className="text-sm text-muted-foreground mt-1">
                  via {paymentRequest.payment_method}
                </p>
              )}
            </div>

            {/* QR Code */}
            {paymentRequest.payment_qr_url ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-3">Scan QR to pay</p>
                <div className="p-4 bg-white rounded-xl">
                  <img
                    src={paymentRequest.payment_qr_url}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted rounded-xl">
                <QrCode className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">QR code not available</p>
              </div>
            )}

            {/* Status */}
            <div className={`text-center py-2 rounded-lg ${
              paymentRequest.status === 'paid' ? 'bg-green-100 text-green-700' :
              paymentRequest.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
              paymentRequest.status === 'disputed' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              Status: <span className="font-medium capitalize">{paymentRequest.status}</span>
            </div>

            {/* Actions */}
            {paymentRequest.status === 'requested' && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDispute}
                  disabled={isDisputing}
                >
                  {isDisputing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  Dispute
                </Button>
                <Button
                  variant="warm"
                  className="flex-1"
                  onClick={handleMarkAsPaid}
                  disabled={isMarking}
                >
                  {isMarking ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Mark as Paid
                </Button>
              </div>
            )}

            {paymentRequest.status === 'paid' && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for companion to confirm payment...
              </p>
            )}

            {paymentRequest.status === 'confirmed' && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">Payment confirmed!</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
