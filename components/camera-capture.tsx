'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Check, X, FlipHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(t('Camera access denied or unavailable. Please use file upload.', 'कैमरा एक्सेस अस्वीकृत या अनुपलब्ध है। कृपया फ़ाइल अपलोड का उपयोग करें।'));
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);

      // Stop camera stream after capture
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    // Convert dataUrl to File
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `document_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      });
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-4 sm:p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-setu-400" />
          <h3 className="font-semibold text-sm sm:text-base">
            {t('Document Scanner', 'दस्तावेज़ स्कैनर')}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 text-neutral-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-neutral-900 rounded-2xl border border-neutral-800">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
          <p className="text-sm text-neutral-300 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={onCancel} className="bg-neutral-800 text-white border-neutral-700">
            {t('Back to File Upload', 'फ़ाइल अपलोड पर वापस जाएं')}
          </Button>
        </div>
      ) : (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              {/* Document Frame Guide Overlay */}
              <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-setu-400/70 rounded-xl flex items-center justify-center">
                <span className="bg-black/60 px-3 py-1 rounded-full text-[11px] font-medium text-setu-200 backdrop-blur-md">
                  {t('Position document inside frame', 'दस्तावेज़ को फ्रेम के अंदर रखें')}
                </span>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Captured Document" className="h-full w-full object-contain bg-black" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {!error && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {!capturedImage ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFacingMode}
                className="rounded-full bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white"
                title={t('Switch Camera', 'कैमरा बदलें')}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                onClick={handleCapture}
                className="h-14 w-14 rounded-full bg-saffron-500 hover:bg-saffron-600 text-white shadow-lg shadow-saffron-500/30 p-0"
              >
                <div className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-white" />
                </div>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="gap-2 rounded-xl bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800"
              >
                <RefreshCw className="h-4 w-4" />
                {t('Retake', 'फिर से लें')}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <Check className="h-4 w-4" />
                {t('Use Photo', 'फोटो का उपयोग करें')}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
