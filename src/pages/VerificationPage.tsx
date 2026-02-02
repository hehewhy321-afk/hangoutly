import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Camera, Upload, Check, AlertCircle, Clock,
  ChevronLeft, FileText, User, Loader2, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Tables } from '@/integrations/supabase/types';

const VerificationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [existingVerification, setExistingVerification] = useState<Tables<'verifications'> | null>(null);
  const [files, setFiles] = useState({
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfie: null as File | null,
  });
  const [previews, setPreviews] = useState({
    documentFront: '',
    documentBack: '',
    selfie: '',
  });
  const [fullName, setFullName] = useState('');

  const docFrontRef = useRef<HTMLInputElement>(null);
  const docBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch existing verification status
  useEffect(() => {
    const fetchVerification = async () => {
      if (!profile?.id) {
        setIsFetching(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('verifications')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setExistingVerification(data);

        // Pre-fill name
        setFullName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      } catch (error) {
        console.error('Error fetching verification:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchVerification();
  }, [profile]);

  const handleFileChange = (key: keyof typeof files, file: File | null) => {
    setFiles({ ...files, [key]: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [key]: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews({ ...previews, [key]: '' });
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return path; // Return path, not full URL
  };

  const canSubmit = files.documentFront && files.selfie && fullName.trim();

  const handleSubmit = async () => {
    if (!user || !profile || !canSubmit) return;

    setIsLoading(true);

    try {
      // Upload documents
      const timestamp = Date.now();
      const docFrontPath = await uploadFile(
        files.documentFront!,
        'verifications',
        `${user.id}/doc-front-${timestamp}.${files.documentFront!.name.split('.').pop()}`
      );

      let docBackPath = null;
      if (files.documentBack) {
        docBackPath = await uploadFile(
          files.documentBack,
          'verifications',
          `${user.id}/doc-back-${timestamp}.${files.documentBack.name.split('.').pop()}`
        );
      }

      const selfiePath = await uploadFile(
        files.selfie!,
        'verifications',
        `${user.id}/selfie-${timestamp}.${files.selfie!.name.split('.').pop()}`
      );

      // Create verification record
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert({
          profile_id: profile.id,
          full_name: fullName.trim(),
          document_type: 'NID',
          document_front_url: docFrontPath,
          document_back_url: docBackPath,
          selfie_url: selfiePath,
          status: 'pending',
        });

      if (verificationError) throw verificationError;

      await refreshProfile();
      toast({
        title: 'Verification submitted!',
        description: 'Your documents are being reviewed. You will be notified once processed.',
      });
      navigate('/settings');
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit verification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Common Header Content
  const HeaderSection = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="text-center mb-12 relative z-10">
      <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/10">
        <Shield className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
        {title}
      </h1>
      <p className="text-muted-foreground font-medium max-w-md mx-auto">
        {subtitle}
      </p>
    </div>
  );

  // Already Verified View
  if (profile?.is_identity_verified) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-8 hover:bg-secondary/50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6 animate-pulse">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Verified Identity</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                You have successfully completed the verification process. Your trustworthy status is now visible to all users.
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // Pending View
  if (existingVerification?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-8 hover:bg-secondary/50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass p-12 text-center relative overflow-hidden"
            >
              {/* Ambient Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="w-24 h-24 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-6 relative z-10">
                <Clock className="w-12 h-12 text-amber-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3 relative z-10">Verification Pending</h1>
              <p className="text-muted-foreground font-medium mb-6 relative z-10">
                Your documents are fully encrypted and currently under review by our safety team. This usually takes 24-48 hours.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/20 relative z-10">
                Submitted: {new Date(existingVerification.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  const canResubmit = !existingVerification || existingVerification.status === 'rejected';

  // Main Submission Form
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 hover:bg-secondary/50 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass p-8 md:p-12 relative overflow-hidden"
          >
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -ml-32 -mt-32 pointer-events-none" />

            <HeaderSection
              title={existingVerification?.status === 'rejected' ? 'Re-submit Verification' : 'Identity Verification'}
              subtitle="To ensure the safety of our community, we require all companions to verify their identity. Your data is encrypted and secure."
            />

            {/* Rejection Notice */}
            {existingVerification?.status === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 relative z-10"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-full shadow-sm">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-bold text-destructive">Submission Rejected</p>
                    {existingVerification.reviewer_notes && (
                      <p className="text-sm text-destructive/80 mt-1 font-medium">
                        Reason: {existingVerification.reviewer_notes}
                      </p>
                    )}
                    <p className="text-sm text-destructive/70 mt-2">
                      Please upload clear, valid documents and try again.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {canResubmit ? (
              <div className="space-y-8 relative z-10">
                {/* Full Name */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground ml-1">Full Legal Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="As it appears on your ID"
                      className="pl-12 h-14 bg-secondary/60 border-border focus:border-primary/30 focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Document Uploads Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Front */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground ml-1">Document Front</Label>
                    <div
                      onClick={() => docFrontRef.current?.click()}
                      className={`
                        relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                        ${previews.documentFront ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                      `}
                    >
                      {previews.documentFront ? (
                        <img
                          src={previews.documentFront}
                          alt="Document front"
                          className="w-full h-full object-contain rounded-xl p-2"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-secondary rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">Upload Front</p>
                          <p className="text-xs text-muted-foreground mt-1">NID / Passport / License</p>
                        </div>
                      )}

                      {previews.documentFront && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      <input
                        ref={docFrontRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange('documentFront', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  {/* Document Back */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground ml-1">Document Back (Optional)</Label>
                    <div
                      onClick={() => docBackRef.current?.click()}
                      className={`
                        relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                        ${previews.documentBack ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                      `}
                    >
                      {previews.documentBack ? (
                        <img
                          src={previews.documentBack}
                          alt="Document back"
                          className="w-full h-full object-contain rounded-xl p-2"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-secondary rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">Upload Back</p>
                          <p className="text-xs text-muted-foreground mt-1">If applicable</p>
                        </div>
                      )}
                      <input
                        ref={docBackRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange('documentBack', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                {/* Selfie Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground ml-1">Live Selfie Verification</Label>
                  <div
                    onClick={() => selfieRef.current?.click()}
                    className={`
                      relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group
                      ${previews.selfie ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                    `}
                  >
                    {previews.selfie ? (
                      <img
                        src={previews.selfie}
                        alt="Selfie"
                        className="w-full h-full object-contain rounded-xl p-4"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-secondary rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-bold text-foreground mb-1">Take a Selfie</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                          Please hold your ID document near your face to confirm ownership.
                        </p>
                      </div>
                    )}
                    <input
                      ref={selfieRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isLoading}
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:to-primary/70 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Encrypting & Uploading...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Submit Secure Verification
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground font-medium max-w-sm mx-auto">
                  By submitting, you agree to our Terms of Service regarding identity verification and data processing.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-medium">
                  You already have a verification in progress.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VerificationPage;
