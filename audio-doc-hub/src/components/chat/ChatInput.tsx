import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Mic, Search } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const suggestions = [
  "SUMMARIZE ALL DEMO CALLS THIS WEEK",
  "WHICH REPS HAVE LOWEST CONFIDENCE SCORES",
  "FLAG ALL CALLS MENTIONING COMPETITOR NAMES",
  "SHOW CALLS WHERE CLIENT REQUESTED FOLLOW-UP",
  "EXTRACT ALL PRICING OBJECTIONS FROM OCTOBER",
];

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCmdK = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <div className="border-t border-border-dim bg-[#090B0E]">
      {/* Input row */}
      <div className="flex items-end gap-2 px-5 py-3">
        <span className="text-electric text-[13px] font-mono font-semibold flex-shrink-0 pb-1 select-none">&gt;</span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="QUERY CALL DATABASE..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[13px] font-mono text-text-primary placeholder:text-text-dim focus:outline-none resize-none scroll-thin"
          style={{ maxHeight: 160 }}
        />
        <div className="flex items-center gap-1.5 flex-shrink-0 pb-1">
          <button
            onClick={handleCmdK}
            className="px-1.5 py-1 text-[9px] font-mono text-text-dim border border-border-dim hover:border-border-mid transition-colors"
          >
            ⌘K
          </button>
          <button className="p-1 text-text-dim hover:text-text-secondary transition-colors">
            <Mic size={13} />
          </button>
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="px-2.5 py-1 text-[10px] font-mono tracking-[0.06em] text-text-secondary border border-border-mid hover:border-electric hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            SEND ↵
          </button>
        </div>
      </div>

      {/* Suggested queries */}
      <div className="px-5 pb-3 space-y-0">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => { setValue(s); textareaRef.current?.focus(); }}
            className="w-full text-left py-1 text-[11px] font-mono text-text-dim hover:text-text-secondary hover:bg-bg-raised transition-colors px-2 -mx-2"
          >
            <span className="text-electric mr-2">&gt;</span>{s}
          </button>
        ))}
      </div>
    </div>
  );
}
