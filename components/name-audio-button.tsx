"use client";

import { Volume2 } from "lucide-react";

export function NameAudioButton({ name, pinyin }: { name: string; pinyin: string }) {
  function speakName() {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(name);
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-cn")) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("zh"));

    if (chineseVoice) {
      utterance.voice = chineseVoice;
      utterance.lang = chineseVoice.lang;
    } else {
      utterance.lang = "zh-CN";
    }

    utterance.rate = 0.78;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={speakName}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-[#f7f5ef] text-ink transition hover:border-cinnabar hover:text-cinnabar focus:outline-none focus:ring-2 focus:ring-cinnabar/30"
      aria-label={`Play Chinese pronunciation for ${name}, ${pinyin}`}
      title={`Play pronunciation: ${pinyin}`}
    >
      <Volume2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
