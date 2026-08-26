'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { useLanguage } from '@/lib/language-context';

interface ReadAloudButtonProps {
  textToRead: string;
  label?: string;
  className?: string;
}

export function ReadAloudButton({ textToRead, label, className }: ReadAloudButtonProps) {
  const { isSpeaking, speak, stopSpeaking } = useVoiceAssistant();
  const { t } = useLanguage();

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(textToRead);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`gap-1.5 border-trust-200 text-trust-700 hover:bg-trust-50 ${className || ''}`}
      title={isSpeaking ? t('Stop Reading', 'पढ़ना बंद करें') : t('Read Aloud', 'पढ़कर सुनाएं')}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="h-4 w-4 text-rose-600 animate-pulse" />
          <span className="text-xs font-semibold text-rose-700">{t('Stop Reading', 'पढ़ना बंद करें')}</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 text-trust-600" />
          <span className="text-xs font-semibold">{label || t('Read Aloud', 'पढ़कर सुनाएं')}</span>
        </>
      )}
    </Button>
  );
}
