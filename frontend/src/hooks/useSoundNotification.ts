import { useCallback, useRef, useEffect, useState } from 'react';

type SoundType = 'critical' | 'warning' | 'info';

// Generate simple beep sounds using Web Audio API
const createBeepSound = (
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): Promise<void> => {
  return new Promise((resolve) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    oscillator.onended = () => resolve();
  });
};

const playCriticalSound = async (audioContext: AudioContext) => {
  // Urgent triple beep - high pitch
  for (let i = 0; i < 3; i++) {
    await createBeepSound(audioContext, 880, 0.15, 'square', 0.25);
    await new Promise(r => setTimeout(r, 100));
  }
};

const playWarningSound = async (audioContext: AudioContext) => {
  // Double beep - medium pitch
  for (let i = 0; i < 2; i++) {
    await createBeepSound(audioContext, 660, 0.2, 'sine', 0.2);
    await new Promise(r => setTimeout(r, 150));
  }
};

const playInfoSound = async (audioContext: AudioContext) => {
  // Single beep - lower pitch
  await createBeepSound(audioContext, 440, 0.25, 'sine', 0.15);
};

export function useSoundNotification() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('sound-notifications-muted');
    return stored === 'true';
  });
  const lastPlayedRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Save mute preference
    localStorage.setItem('sound-notifications-muted', String(isMuted));
  }, [isMuted]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(async (type: SoundType, id?: string) => {
    if (isMuted) return;

    // Prevent playing same sound too frequently (5 second cooldown per ID)
    if (id) {
      const lastPlayed = lastPlayedRef.current.get(id);
      if (lastPlayed && Date.now() - lastPlayed < 5000) return;
      lastPlayedRef.current.set(id, Date.now());
    }

    try {
      const audioContext = getAudioContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      switch (type) {
        case 'critical':
          await playCriticalSound(audioContext);
          break;
        case 'warning':
          await playWarningSound(audioContext);
          break;
        case 'info':
          await playInfoSound(audioContext);
          break;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [isMuted, getAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
  };
}
