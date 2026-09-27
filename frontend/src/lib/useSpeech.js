import { useCallback, useState } from 'react';

// Lightweight, dependency-free "read this out loud" helper for accessibility
// (low-literacy, low-vision, or anyone who'd rather listen than read a form).
// Uses the browser's built-in speech engine — no API key needed, unlike the
// Azure voice used on the Dashboard, so it works the same for every visitor.
export function useSpeech() {
  const [speakingId, setSpeakingId] = useState(null);

  const speak = useCallback((id, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-ZA';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
  }, [speakingId]);

  return { speak, speakingId };
}
