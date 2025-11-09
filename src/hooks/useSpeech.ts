// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// A custom hook to handle speech synthesis and generative audio feedback.
// It replaces the old file-based audio system with browser-native APIs.

import { useCallback, useRef } from 'react';

// We are replacing the file-based useAudio hook with a generative audio hook
export const useSpeech = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Lazy initialize AudioContext
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      // Handle vendor prefixes for older browsers
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Function to play a simple tone
  const playTone = (type: 'success' | 'failure') => {
    try {
      const context = getAudioContext();
      if (!context) return;

      // Ensure context is running (for autoplay policies)
      if (context.state === 'suspended') {
        context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      const frequency = type === 'success' ? 600 : 200;
      const detune = type === 'success' ? 1200 : 0;
      const duration = type === 'success' ? 0.2 : 0.3;

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      if (type === 'success') {
        oscillator.detune.setValueAtTime(detune, context.currentTime);
      }
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (e) {
      console.error('Error playing tone:', e);
    }
  };

  const playSuccess = useCallback(() => playTone('success'), []);
  const playFailure = useCallback(() => playTone('failure'), []);

  const speak = useCallback((text: string, rate: number) => {
    try {
      if ('speechSynthesis' in window) {
        // Cancel any previous speech to prevent overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error('Error in speech synthesis:', e);
    }
  }, []);

  return { speak, playSuccess, playFailure };
};
