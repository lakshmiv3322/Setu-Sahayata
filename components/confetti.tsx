'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  active?: boolean;
}

export function Confetti({ active = true }: ConfettiProps) {
  useEffect(() => {
    if (!active) return;

    // Palette particles: Saffron (#F2994A), Deep Teal (#0F4C5C), Emerald Green (#10B981), Amber (#F59E0B)
    const colors = ['#F2994A', '#0F4C5C', '#10B981', '#F59E0B', '#1B6B7A', '#E8871E'];

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [active]);

  return null;
}
