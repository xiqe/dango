import { useState, useEffect, useCallback } from "react";

export default function useSpeech() {
  const [japaneseVoice, setJapaneseVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const jaVoice =
        voices.find((voice) => voice.name === "Kyoko") ||
        voices.find(
          (voice) =>
            (voice.lang.toLowerCase().includes("ja") ||
              voice.name.toLowerCase().includes("japanese")) &&
            voice.name.toLowerCase().includes("female")
        ) ||
        voices.find(
          (voice) =>
            voice.lang.toLowerCase().includes("ja") ||
            voice.name.toLowerCase().includes("japanese")
        );
      setJapaneseVoice(jaVoice || null);
    };

    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = useCallback(
    (text: string, e?: React.MouseEvent) => {
      e?.stopPropagation();

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";

      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }

      window.speechSynthesis.speak(utterance);
    },
    [japaneseVoice]
  );

  return handleSpeak;
}
