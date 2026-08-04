'use client';
import { createContext, useContext, useState } from 'react';
type Tone = 'success' | 'error' | 'info';
const C = createContext<((message: string, tone?: Tone) => void) | null>(null);
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; tone: Tone } | null>(null);
  const show = (text: string, tone: Tone = 'info') => {
    setMsg({ text, tone });
    window.setTimeout(() => setMsg(null), 6000);
  };
  return (
    <C.Provider value={show}>
      {children}
      <div
        className={`toast ${msg?.tone ?? ''}`}
        role={msg?.tone === 'error' ? 'alert' : 'status'}
        aria-live={msg?.tone === 'error' ? 'assertive' : 'polite'}
      >
        {msg && (
          <>
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} aria-label="Zatvori poruku">
              ×
            </button>
          </>
        )}
      </div>
    </C.Provider>
  );
}
export const useFeedback = () => {
  const v = useContext(C);
  if (!v) throw new Error('FeedbackProvider missing');
  return v;
};
