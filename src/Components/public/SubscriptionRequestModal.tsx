import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Plan, SubscriptionRequest } from '../../types/subscription.types';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { subscriptionService } from '../../services/subscriptionService';
import {
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  ShieldCheck,
  Lock,
  QrCode,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Check,
  Copy,
  RotateCw,
  Send,
  Zap,
  Fingerprint,
  ExternalLink,
  Info,
} from 'lucide-react';
import { isValidEmail, isValidPhone } from '../../utils/validationUtils';

interface SubscriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
}

type PaymentMethodType = 'Credit Card' | 'Apple Pay / Google Pay' | 'InstaPay / Wallet' | 'Bank Transfer' | 'Cash';

interface CardInfo {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  saveCard: boolean;
}

export const SubscriptionRequestModal: React.FC<SubscriptionRequestModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
}) => {
  // Wizard steps: 'details' -> 'payment' -> 'otp' -> 'processing' -> 'success'
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'otp' | 'processing' | 'success'>('details');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    requestedStartDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card' as PaymentMethodType,
    notes: '',
  });

  // Credit Card states
  const [cardData, setCardData] = useState<CardInfo>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    saveCard: true,
  });

  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // InstaPay & Mobile Wallet states
  const [instapayData, setInstapayData] = useState({
    walletNumber: '',
    referenceCode: '',
  });

  // Bank wire states
  const [bankData, setBankData] = useState({
    transferRef: '',
    senderBank: '',
  });

  // Apple / Google Pay states
  const [digitalWalletType, setDigitalWalletType] = useState<'apple' | 'google'>('apple');

  // 3D Secure OTP challenge states
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(45);
  const [otpError, setOtpError] = useState<string>('');

  // UI helpers
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [emailSentToast, setEmailSentToast] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(10);
  const [processingStatus, setProcessingStatus] = useState<string>('Initializing secure connection...');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [submittedRequest, setSubmittedRequest] = useState<SubscriptionRequest | null>(null);

  // OTP Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  // Detect card network brand
  const getCardBrand = (numberStr: string) => {
    const clean = numberStr.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^(34|37)/.test(clean)) return 'amex';
    if (/^(6011|65)/.test(clean)) return 'discover';
    return 'generic';
  };

  const cardBrand = getCardBrand(cardData.cardNumber);

  // Format Card Number (4-4-4-4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardData((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: raw }));
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: '' }));
  };

  // Demo card autofills
  const handleFillDemoCard = (type: 'visa' | 'mastercard' | 'amex') => {
    if (type === 'visa') {
      setCardData({
        cardNumber: '4532 8492 1048 9201',
        cardHolder: (formData.fullName || 'ALEX MORGAN').toUpperCase(),
        expiry: '09/29',
        cvv: '849',
        saveCard: true,
      });
    } else if (type === 'mastercard') {
      setCardData({
        cardNumber: '5424 1892 4920 7710',
        cardHolder: (formData.fullName || 'ALEX MORGAN').toUpperCase(),
        expiry: '11/28',
        cvv: '321',
        saveCard: true,
      });
    } else {
      setCardData({
        cardNumber: '3782 8224 9102 3004',
        cardHolder: (formData.fullName || 'ALEX MORGAN').toUpperCase(),
        expiry: '06/30',
        cvv: '9102',
        saveCard: true,
      });
    }
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Validate Step 1 (Applicant Information)
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      errs.phone = 'Valid phone number is required';
    }
    if (!formData.requestedStartDate) {
      errs.requestedStartDate = 'Start date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validate Step 2 (Payment Form Details)
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (formData.paymentMethod === 'Credit Card') {
      const cleanNum = cardData.cardNumber.replace(/\s/g, '');
      if (!cleanNum || cleanNum.length < 15) {
        errs.cardNumber = 'Enter a valid 16-digit card number';
      }
      if (!cardData.cardHolder.trim()) {
        errs.cardHolder = 'Cardholder name is required';
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        errs.expiry = 'Valid MM/YY required';
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        errs.cvv = '3 or 4-digit CVV required';
      }
    } else if (formData.paymentMethod === 'InstaPay / Wallet') {
      if (!instapayData.walletNumber.trim()) {
        errs.walletNumber = 'InstaPay address or phone wallet number is required';
      }
    } else if (formData.paymentMethod === 'Bank Transfer') {
      if (!bankData.transferRef.trim()) {
        errs.transferRef = 'Wire transfer receipt or reference ID required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Move from Step 1 to Step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    if (!cardData.cardHolder) {
      setCardData((prev) => ({ ...prev, cardHolder: formData.fullName.toUpperCase() }));
    }
    setCurrentStep('payment');
  };

  // Handle Initial Payment Submission (triggers 3D Secure OTP for card, or gateway for others)
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2() || !selectedPlan) return;

    if (formData.paymentMethod === 'Credit Card') {
      // Show 3D Secure OTP Challenge
      setOtpCode(['', '', '', '', '', '']);
      setOtpTimer(45);
      setOtpError('');
      setCurrentStep('otp');
    } else {
      // Direct gateway processing for Apple Pay, InstaPay, Bank Wire, Cash
      triggerGatewayProcessing();
    }
  };

  // Handle OTP Inputs
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutofillOtp = () => {
    setOtpCode(['9', '4', '8', '2', '0', '1']);
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      setOtpError('Please enter the full 6-digit security code');
      return;
    }
    triggerGatewayProcessing();
  };

  // Real Multi-Stage Gateway Execution
  const triggerGatewayProcessing = async () => {
    setCurrentStep('processing');
    const randomTxn = `TXN-2026-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomAuth = `AUTH-${Math.floor(10000 + Math.random() * 90000)}`;
    setTransactionRef(randomTxn);
    setAuthCode(randomAuth);

    // Stage 1: TLS 1.3 Handshake
    setProcessingProgress(20);
    setProcessingStatus('Establishing 256-bit TLS 1.3 encrypted connection...');
    await new Promise((r) => setTimeout(r, 600));

    // Stage 2: Clearing Network
    setProcessingProgress(50);
    if (formData.paymentMethod === 'Credit Card') {
      const brandName = cardBrand === 'visa' ? 'Visa' : cardBrand === 'mastercard' ? 'Mastercard' : 'Amex';
      setProcessingStatus(`Routing token through ${brandName} 3D-Secure 2.0 Network...`);
    } else if (formData.paymentMethod === 'Apple Pay / Google Pay') {
      setProcessingStatus(`Authenticating biometric token via ${digitalWalletType === 'apple' ? 'Apple Pay Touch/Face ID' : 'Google Wallet'}...`);
    } else if (formData.paymentMethod === 'InstaPay / Wallet') {
      setProcessingStatus(`Querying Instant Payment Network (IPN) for wallet ${instapayData.walletNumber}...`);
    } else if (formData.paymentMethod === 'Bank Transfer') {
      setProcessingStatus(`Validating SWIFT / IBAN settlement ref: ${bankData.transferRef}...`);
    } else {
      setProcessingStatus('Securing front desk reservation & locking guaranteed pricing...');
    }
    await new Promise((r) => setTimeout(r, 700));

    // Stage 3: Bank Settlement
    setProcessingProgress(80);
    setProcessingStatus('Settling funds with issuing bank & minting membership credentials...');
    await new Promise((r) => setTimeout(r, 600));

    // Stage 4: Success Completion
    setProcessingProgress(100);
    setProcessingStatus('Payment Authorized! Generating official digital tax invoice...');
    await new Promise((r) => setTimeout(r, 400));

    // Determine descriptive payment method label for database & inbox
    let paymentDetailLabel: string = formData.paymentMethod;
    if (formData.paymentMethod === 'Credit Card') {
      const brandUpper = cardBrand.toUpperCase();
      paymentDetailLabel = `${brandUpper} •••• ${cardData.cardNumber.slice(-4) || '4242'}`;
    } else if (formData.paymentMethod === 'Apple Pay / Google Pay') {
      paymentDetailLabel = digitalWalletType === 'apple' ? 'Apple Pay (Device Card)' : 'Google Pay (Device Card)';
    } else if (formData.paymentMethod === 'InstaPay / Wallet') {
      paymentDetailLabel = `InstaPay (${instapayData.walletNumber})`;
    } else if (formData.paymentMethod === 'Bank Transfer') {
      paymentDetailLabel = `Bank Wire (Ref: ${bankData.transferRef})`;
    } else {
      paymentDetailLabel = 'Cash Voucher (Front Desk)';
    }

    const fullNotes = [
      formData.notes ? `Goals: ${formData.notes}` : '',
      `Ref: ${randomTxn}`,
      `Auth: ${randomAuth}`,
      `Paid via: ${paymentDetailLabel}`,
    ]
      .filter(Boolean)
      .join(' • ');

    if (selectedPlan) {
      const created = subscriptionService.submitRequest({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        duration: selectedPlan.durationMonths,
        paidAmount: selectedPlan.price,
        paymentMethod: paymentDetailLabel,
        requestType: 'new',
        branchId: 1,
        requestedStartDate: formData.requestedStartDate,
        notes: fullNotes,
      });
      setSubmittedRequest(created);
    }

    setCurrentStep('success');
  };

  const handleSendEmailReceipt = () => {
    setEmailSentToast(true);
    setTimeout(() => setEmailSentToast(false), 3000);
  };

  const handleResetAndClose = () => {
    setCurrentStep('details');
    setSubmittedRequest(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      requestedStartDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      notes: '',
    });
    setCardData({
      cardNumber: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
      saveCard: true,
    });
    setIsCardFlipped(false);
    setInstapayData({ walletNumber: '', referenceCode: '' });
    setBankData({ transferRef: '', senderBank: '' });
    setErrors({});
    setEmailSentToast(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={
        currentStep === 'success'
          ? 'Payment Confirmed & Membership Pass Ready!'
          : currentStep === 'otp'
          ? 'Bank Identity Check (3D Secure)'
          : currentStep === 'payment'
          ? 'Secure Checkout & Payment Gateway'
          : currentStep === 'processing'
          ? 'Authorizing Transaction...'
          : `Subscribe to GEM — ${selectedPlan?.name || 'Plan'}`
      }
      subtitle={
        currentStep === 'success'
          ? 'Your transaction was settled successfully. Official digital invoice generated.'
          : currentStep === 'otp'
          ? 'Please enter the verification code sent by your bank to authorize payment.'
          : currentStep === 'payment'
          ? 'Complete your billing information to activate your gym enrollment.'
          : currentStep === 'processing'
          ? 'Communicating with banking network over 256-bit encrypted SSL...'
          : 'Fill in your details below to join GEM Fitness.'
      }
      maxWidth={currentStep === 'success' ? 'lg' : 'md'}
    >
      {/* ========================================================= */}
      {/* STEP 3: 3D SECURE BANK OTP CHALLENGE */}
      {/* ========================================================= */}
      {currentStep === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5 py-2">
          {/* Bank Security Header */}
          <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center border border-brand-primary/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                    Verified by {cardBrand === 'mastercard' ? 'Mastercard' : 'Visa'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-bold">
                    SECURE 2.0
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">Central Banking Authorization Challenge</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted block">Amount:</span>
              <span className="text-sm font-extrabold text-brand-primary font-heading">${selectedPlan?.price} USD</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-text-muted">
              We sent a 6-digit authentication code via SMS to your mobile ending in{' '}
              <strong className="text-text-main">•••• {formData.phone.slice(-4) || '8492'}</strong>
            </p>

            {/* Quick test chip */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAutofillOtp}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-fill Demo Code (948201)</span>
              </button>
            </div>
          </div>

          {/* 6 Digit OTP Input Boxes */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 pt-1">
            {otpCode.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl bg-surface-card border-2 border-border-subtle focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 text-text-main focus:outline-none transition-all"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-xs text-center text-rose-400 font-medium">{otpError}</p>
          )}

          {/* Timer & Resend */}
          <div className="flex items-center justify-between text-xs px-2 text-text-muted">
            <span>
              Code expires in:{' '}
              <strong className="font-mono text-brand-primary">
                00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setOtpTimer(45);
                setOtpError('');
              }}
              disabled={otpTimer > 0}
              className={`font-semibold transition-colors cursor-pointer ${
                otpTimer > 0 ? 'opacity-40 cursor-not-allowed' : 'text-brand-primary hover:underline'
              }`}
            >
              Resend SMS Code
            </button>
          </div>

          {/* Verification Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentStep('payment')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 font-bold shadow-lg shadow-brand-primary/25"
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Confirm & Pay ${selectedPlan?.price}
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* STEP: PROCESSING GATEWAY SIMULATION */}
      {/* ========================================================= */}
      {currentStep === 'processing' && (
        <div className="py-10 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            {/* Spinning glowing ring */}
            <div className="w-24 h-24 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-9 h-9 text-brand-primary animate-pulse" />
            </div>
          </div>

          {/* Live Progress Bar */}
          <div className="max-w-xs mx-auto space-y-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Security Clearance</span>
              <span className="font-mono font-bold text-brand-primary">{processingProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-card overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-text-main font-heading">
              Contacting Financial Network
            </h4>
            <p className="text-xs text-brand-primary font-medium min-h-[20px] transition-all">
              {processingStatus}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-card border border-border-subtle inline-flex items-center gap-2.5 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PCI-DSS Level 1 Certified • End-to-End Encrypted</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP: SUCCESS & OFFICIAL TAX INVOICE RECEIPT */}
      {/* ========================================================= */}
      {currentStep === 'success' && submittedRequest && (
        <div className="space-y-5 py-1">
          {/* Header Banner */}
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-text-main font-heading">
              Payment Confirmed! Welcome, {submittedRequest.fullName}
            </h4>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Your membership for <strong>{submittedRequest.planName}</strong> is authorized and activated on{' '}
              {submittedRequest.requestedStartDate}.
            </p>
          </div>

          {/* Official Printable Tax Invoice Card */}
          <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle relative overflow-hidden shadow-xl space-y-4">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-text-main font-heading tracking-wider">
                    GEM FITNESS CLUB LLC
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">Official Tax Invoice • VAT #EG300-849-102</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {submittedRequest.paymentMethod?.includes('Cash') ? 'VOUCHER ACTIVE' : 'PAID & SETTLED'}
                </span>
              </div>
            </div>

            {/* Grid Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border-subtle">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Transaction ID</span>
                <span className="font-mono font-bold text-brand-primary text-xs mt-0.5 block truncate">
                  {transactionRef || 'TXN-2026-918204'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border-subtle">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Auth Code</span>
                <span className="font-mono font-bold text-text-main text-xs mt-0.5 block">
                  {authCode || 'AUTH-94810'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border-subtle">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Tracking ID</span>
                <span className="font-mono font-bold text-text-main text-xs mt-0.5 block truncate">
                  {submittedRequest.id}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border-subtle">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Payment Method</span>
                <span className="font-semibold text-text-main text-xs mt-0.5 block truncate">
                  {submittedRequest.paymentMethod}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="rounded-xl border border-border-subtle overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-surface-elevated text-text-muted text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3 text-left">Item Description</th>
                    <th className="py-2 px-3 text-center">Duration</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="py-2 px-3 text-text-main font-semibold">
                      {submittedRequest.planName} Membership
                    </td>
                    <td className="py-2 px-3 text-center text-text-muted">
                      {submittedRequest.duration || 1} Month{submittedRequest.duration && submittedRequest.duration > 1 ? 's' : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-text-main">
                      ${submittedRequest.paidAmount} USD
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-text-muted">
                      Full Facility & Locker Keycard Access
                    </td>
                    <td className="py-2 px-3 text-center text-text-muted">Included</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-semibold">$0.00</td>
                  </tr>
                </tbody>
                <tfoot className="bg-surface-elevated/70 font-bold">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-text-main text-right">
                      Total Paid:
                    </td>
                    <td className="py-2.5 px-3 text-right text-brand-primary text-sm font-black">
                      ${submittedRequest.paidAmount} USD
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Digital Gym Keycard QR Pickup Pass */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white">
                  <QrCode className="w-8 h-8 text-black flex-shrink-0" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-text-main">Digital Gym Entry Pass</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-primary/10 text-brand-primary font-mono font-bold">
                      KEY-{submittedRequest.id.replace('req-', '')}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    Scan this QR at the turnstile or show to front desk reception.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                PASS READY
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print / Save PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSendEmailReceipt}
            >
              {emailSentToast ? 'Receipt Sent! ✓' : 'Email Invoice'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="flex-1 font-bold"
              onClick={handleResetAndClose}
            >
              Done & Return
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: APPLICANT DETAILS FORM */}
      {/* ========================================================= */}
      {currentStep === 'details' && (
        <form onSubmit={handleProceedToPayment} className="space-y-4">
          {/* Plan Header Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-primary/15 via-surface-card to-surface-card border border-brand-primary/30 flex justify-between items-center text-xs">
            <div>
              <span className="text-text-muted text-[11px] block">Selected Membership Package:</span>
              <span className="font-extrabold text-brand-primary font-heading text-sm sm:text-base">
                {selectedPlan?.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-text-main font-heading">
                ${selectedPlan?.price}
              </span>
              <span className="text-[10px] text-text-muted block">
                / {selectedPlan?.durationMonths === 1 ? 'month' : `${selectedPlan?.durationMonths} months`}
              </span>
            </div>
          </div>

          <FormInput
            label="Full Name"
            name="fullName"
            placeholder="Alex Morgan"
            value={formData.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="+1 (555) 000-1234"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <FormInput
            label="Preferred Start Date"
            name="requestedStartDate"
            type="date"
            value={formData.requestedStartDate}
            onChange={handleInputChange}
            error={errors.requestedStartDate}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Fitness Goals / Staff Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g., Strength training, weight loss, interested in personal trainer..."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-surface-card border border-border-subtle focus:border-brand-primary focus:ring-brand-primary/40 text-text-main placeholder-text-subtle px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-brand-primary/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Payment (${selectedPlan?.price})
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* STEP 2: REALISTIC PAYMENT METHOD & CHECKOUT DETAILS */}
      {/* ========================================================= */}
      {currentStep === 'payment' && (
        <form onSubmit={handleInitiatePayment} className="space-y-4">
          {/* Back Navigation & Summary Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <button
              type="button"
              onClick={() => setCurrentStep('details')}
              className="text-xs text-text-muted hover:text-brand-primary flex items-center gap-1 font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit Applicant Profile
            </button>
            <span className="text-xs font-mono font-bold text-brand-primary">
              Total Due: ${selectedPlan?.price} USD
            </span>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'Credit Card', label: 'Card', icon: CreditCard, subtitle: 'Visa/MC/Amex' },
                { id: 'Apple Pay / Google Pay', label: '1-Click Pay', icon: Fingerprint, subtitle: 'Apple/Google' },
                { id: 'InstaPay / Wallet', label: 'InstaPay', icon: Smartphone, subtitle: 'Instant Transfer' },
                { id: 'Bank Transfer', label: 'Bank Wire', icon: Building2, subtitle: 'CIB Swift' },
                { id: 'Cash', label: 'Cash', icon: Banknote, subtitle: 'Front Desk' },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, paymentMethod: method.id as PaymentMethodType }));
                      setErrors({});
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/50'
                        : 'border-border-subtle bg-surface-card hover:border-brand-primary/40 text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-primary' : 'text-text-muted'}`} />
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-brand-primary' : 'text-text-main'}`}>
                        {method.label}
                      </div>
                      <div className="text-[9px] text-text-muted mt-0.5 leading-tight truncate">
                        {method.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC PAYMENT METHOD VIEW */}

          {/* ========================================================= */}
          {/* OPTION 1: CREDIT / DEBIT CARD (WITH 3D FLIP) */}
          {/* ========================================================= */}
          {formData.paymentMethod === 'Credit Card' && (
            <div className="space-y-4 pt-1">
              {/* Interactive 3D Realistic Credit Card */}
              <div
                className="relative w-full h-48 cursor-pointer select-none"
                style={{ perspective: '1000px' }}
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                title="Click to flip card"
              >
                <div
                  className="w-full h-full duration-500 transition-transform rounded-2xl relative shadow-2xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* FRONT OF CARD */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-zinc-950 via-slate-900 to-cyan-950 border border-brand-primary/40 text-white flex flex-col justify-between overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Background glow decoration */}
                    <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand-primary/20 blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-2">
                        {/* EMV Chip */}
                        <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/60 flex items-center justify-center relative overflow-hidden shadow-inner">
                          <div className="w-full h-[1px] bg-amber-800/40 absolute top-2" />
                          <div className="w-full h-[1px] bg-amber-800/40 absolute bottom-2" />
                          <div className="h-full w-[1px] bg-amber-800/40 absolute left-3" />
                          <div className="h-full w-[1px] bg-amber-800/40 absolute right-3" />
                        </div>
                        {/* Wireless Contactless Icon */}
                        <svg className="w-4 h-4 text-cyan-300/80 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 8.5C5.5 5 10.5 5 14 8.5" />
                          <path d="M5 12C7.5 9.5 11.5 9.5 14 12" />
                          <path d="M8 15.5C9.5 14 11.5 14 13 15.5" />
                        </svg>
                      </div>

                      {/* Brand Logo Badge */}
                      <div className="flex items-center gap-1.5">
                        {cardBrand === 'visa' && (
                          <span className="font-extrabold text-base italic tracking-widest text-cyan-300 drop-shadow">
                            VISA
                          </span>
                        )}
                        {cardBrand === 'mastercard' && (
                          <div className="flex items-center -space-x-2">
                            <span className="w-6 h-6 rounded-full bg-rose-500/90 drop-shadow" />
                            <span className="w-6 h-6 rounded-full bg-amber-400/90 drop-shadow" />
                          </div>
                        )}
                        {cardBrand === 'amex' && (
                          <span className="font-black text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-serif">
                            AMEX
                          </span>
                        )}
                        {cardBrand === 'generic' && (
                          <span className="text-[10px] tracking-widest font-mono text-cyan-300 font-bold border border-cyan-400/40 px-2 py-0.5 rounded">
                            GEM SECURE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="font-mono text-base sm:text-lg tracking-[0.2em] font-bold text-white/95 drop-shadow relative z-10">
                      {cardData.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    {/* Cardholder & Expiry */}
                    <div className="flex justify-between items-end text-xs relative z-10">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-cyan-300/70 block font-semibold">
                          Cardholder Name
                        </span>
                        <span className="font-bold text-white uppercase tracking-wider text-xs truncate max-w-[180px] block">
                          {cardData.cardHolder || formData.fullName || 'ALEX MORGAN'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase tracking-wider text-cyan-300/70 block font-semibold">
                          Expires
                        </span>
                        <span className="font-mono font-bold text-white text-xs">
                          {cardData.expiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK OF CARD */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-4 bg-gradient-to-tr from-zinc-950 via-slate-900 to-zinc-900 border border-brand-primary/40 text-white flex flex-col justify-between overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {/* Magnetic Stripe */}
                    <div className="-mx-4 h-9 bg-zinc-950 border-y border-zinc-800" />

                    {/* Signature strip & CVV */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-7 bg-white/90 rounded flex items-center px-2">
                          <span className="font-serif italic text-zinc-600 text-xs truncate select-none">
                            {cardData.cardHolder || formData.fullName || 'Authorized Signature'}
                          </span>
                        </div>
                        <div className="w-14 h-7 bg-amber-100 rounded border border-amber-300 flex items-center justify-center font-mono font-bold text-xs text-zinc-900">
                          {cardData.cvv ? '•••' : 'CVV'}
                        </div>
                      </div>
                      <p className="text-[8px] text-zinc-400 text-right">3 or 4-digit security code on back</p>
                    </div>

                    {/* Fine print & hologram */}
                    <div className="flex items-center justify-between text-[7px] text-zinc-400">
                      <span>Customer Support: 1-800-GEM-FIT</span>
                      <div className="w-5 h-4 rounded bg-cyan-400/30 border border-cyan-400/50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Fill Chips */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-text-muted text-[11px] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Quick Demo Cards:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemoCard('visa')}
                    className="px-2 py-0.5 rounded bg-surface-card hover:bg-surface-elevated border border-border-subtle text-[10px] font-bold text-cyan-400 cursor-pointer transition-colors"
                  >
                    Visa 4242
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCard('mastercard')}
                    className="px-2 py-0.5 rounded bg-surface-card hover:bg-surface-elevated border border-border-subtle text-[10px] font-bold text-amber-400 cursor-pointer transition-colors"
                  >
                    Mastercard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCard('amex')}
                    className="px-2 py-0.5 rounded bg-surface-card hover:bg-surface-elevated border border-border-subtle text-[10px] font-bold text-purple-400 cursor-pointer transition-colors"
                  >
                    Amex
                  </button>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                <FormInput
                  label="Card Number"
                  placeholder="4532 8492 1048 9201"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  error={errors.cardNumber}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                />

                <FormInput
                  label="Cardholder Name"
                  placeholder="ALEX MORGAN"
                  value={cardData.cardHolder}
                  onChange={(e) => {
                    setCardData((prev) => ({ ...prev, cardHolder: e.target.value.toUpperCase() }));
                    if (errors.cardHolder) setErrors((prev) => ({ ...prev, cardHolder: '' }));
                  }}
                  error={errors.cardHolder}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Expiration Date"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={handleExpiryChange}
                    error={errors.expiry}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                  <div
                    onFocus={() => setIsCardFlipped(true)}
                    onBlur={() => setIsCardFlipped(false)}
                  >
                    <FormInput
                      label="Security Code (CVV)"
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardData((prev) => ({ ...prev, cvv: val }));
                        if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: '' }));
                      }}
                      error={errors.cvv}
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Save card checkbox */}
                <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={cardData.saveCard}
                    onChange={(e) => setCardData((prev) => ({ ...prev, saveCard: e.target.checked }))}
                    className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary/40 w-4 h-4"
                  />
                  <span>Save card securely for 1-click renewal (PCI-DSS tokenized)</span>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 2: APPLE PAY / GOOGLE PAY (1-CLICK BIOMETRIC) */}
          {/* ========================================================= */}
          {formData.paymentMethod === 'Apple Pay / Google Pay' && (
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDigitalWalletType('apple')}
                  className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    digitalWalletType === 'apple'
                      ? 'bg-black text-white border-zinc-700 shadow-md ring-2 ring-brand-primary/40'
                      : 'bg-surface-elevated text-text-muted border-border-subtle hover:text-text-main'
                  }`}
                >
                  <span className="text-base leading-none"></span> Pay with Apple Pay
                </button>

                <button
                  type="button"
                  onClick={() => setDigitalWalletType('google')}
                  className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    digitalWalletType === 'google'
                      ? 'bg-white text-zinc-900 border-zinc-300 shadow-md ring-2 ring-brand-primary/40'
                      : 'bg-surface-elevated text-text-muted border-border-subtle hover:text-text-main'
                  }`}
                >
                  <span className="text-blue-500 font-extrabold text-sm">G</span>
                  <span>Pay with Google</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Authorized Device:</span>
                  <span className="font-semibold text-text-main">
                    {digitalWalletType === 'apple' ? 'iPhone / MacBook (Touch ID/Face ID)' : 'Android / Chrome Passkey'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Linked Pass Card:</span>
                  <span className="font-mono font-bold text-brand-primary">
                    Default Card (•••• 9182)
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Billing Name:</span>
                  <span className="font-semibold text-text-main">{formData.fullName || 'Alex Morgan'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted justify-center">
                <Fingerprint className="w-4 h-4 text-brand-primary" />
                <span>One-touch instant authorization via on-device biometrics</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 3: INSTAPAY / MOBILE WALLET */}
          {/* ========================================================= */}
          {formData.paymentMethod === 'InstaPay / Wallet' && (
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-text-main">InstaPay & Instant Mobile Wallet</h5>
                  <p className="text-[11px] text-text-muted">
                    Pay instantly via InstaPay IPN, Vodafone Cash, Orange Money, or Meeza.
                  </p>
                </div>
              </div>

              {/* Official Handle Card with Copy */}
              <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted block font-semibold">
                    Official GEM InstaPay Handle:
                  </span>
                  <code className="text-sm font-bold text-brand-primary font-mono">
                    gem.gym@instapay
                  </code>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyText('gem.gym@instapay', 'instapay')}
                  leftIcon={copiedKey === 'instapay' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedKey === 'instapay' ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <FormInput
                label="Your InstaPay Address or Mobile Wallet Number"
                placeholder="e.g., yourname@instapay or 01012345678"
                value={instapayData.walletNumber}
                onChange={(e) => {
                  setInstapayData((prev) => ({ ...prev, walletNumber: e.target.value }));
                  if (errors.walletNumber) setErrors((prev) => ({ ...prev, walletNumber: '' }));
                }}
                error={errors.walletNumber}
                leftIcon={<Smartphone className="w-4 h-4" />}
              />

              <FormInput
                label="Transaction Reference Number (Optional)"
                placeholder="e.g., IPN-9482014"
                value={instapayData.referenceCode}
                onChange={(e) => setInstapayData((prev) => ({ ...prev, referenceCode: e.target.value }))}
                leftIcon={<Receipt className="w-4 h-4" />}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 4: BANK WIRE TRANSFER (CIB) */}
          {/* ========================================================= */}
          {formData.paymentMethod === 'Bank Transfer' && (
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
              <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle space-y-2 text-xs text-text-muted">
                <div className="font-bold text-text-main text-xs pb-1.5 border-b border-border-subtle flex justify-between items-center">
                  <span>Beneficiary: GEM Fitness Center LLC</span>
                  <span className="text-[10px] font-bold text-brand-primary px-2 py-0.5 rounded bg-brand-primary/10">
                    Official CIB Wire
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bank Name:</span>
                  <span className="font-medium text-text-main">Commercial International Bank (CIB)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-text-main">1000 4829 0184 92</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('10004829018492', 'acct')}
                      className="text-text-muted hover:text-brand-primary cursor-pointer"
                    >
                      {copiedKey === 'acct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>IBAN:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-brand-primary">EG820010004829018492000</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('EG820010004829018492000', 'iban')}
                      className="text-text-muted hover:text-brand-primary cursor-pointer"
                    >
                      {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Swift / BIC:</span>
                  <span className="font-mono font-semibold text-text-main">CIBEEGCX</span>
                </div>
              </div>

              <FormInput
                label="Wire Transfer Reference ID / Slip Number"
                placeholder="e.g., WIRE-84920149"
                value={bankData.transferRef}
                onChange={(e) => {
                  setBankData((prev) => ({ ...prev, transferRef: e.target.value }));
                  if (errors.transferRef) setErrors((prev) => ({ ...prev, transferRef: '' }));
                }}
                error={errors.transferRef}
                leftIcon={<Building2 className="w-4 h-4" />}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 5: CASH ON ARRIVAL */}
          {/* ========================================================= */}
          {formData.paymentMethod === 'Cash' && (
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-text-main">Pay Cash at Front Desk</h5>
                  <p className="text-[11px] text-text-muted">
                    Instant guaranteed spot reservation. Pay upon arrival on {formData.requestedStartDate}.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle text-xs text-text-muted flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Price locked: <strong>${selectedPlan?.price} USD</strong> with zero upfront booking fees.</span>
              </div>
            </div>
          )}

          {/* Order Total Breakdown */}
          <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs space-y-1.5 text-text-muted">
            <div className="flex justify-between">
              <span>{selectedPlan?.name} ({selectedPlan?.durationMonths || 1} Mo)</span>
              <span className="font-medium text-text-main">${selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Gym Access & Locker Key Provisioning</span>
              <span className="text-emerald-400 font-semibold">FREE ($0.00)</span>
            </div>
            <div className="flex justify-between">
              <span>VAT / Service Charges</span>
              <span className="text-text-main">Included</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-subtle text-sm font-bold text-text-main">
              <span>Total Amount:</span>
              <span className="text-brand-primary text-base">${selectedPlan?.price} USD</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-brand-primary/20"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              {formData.paymentMethod === 'Cash'
                ? `Confirm Reservation ($${selectedPlan?.price} Cash)`
                : formData.paymentMethod === 'Apple Pay / Google Pay'
                ? `Authorize with ${digitalWalletType === 'apple' ? 'Apple Pay' : 'Google Pay'} ($${selectedPlan?.price})`
                : `Authorize & Pay $${selectedPlan?.price} USD`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
