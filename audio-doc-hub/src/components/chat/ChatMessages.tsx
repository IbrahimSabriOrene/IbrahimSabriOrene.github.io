import { useMemo, useState, useEffect } from "react";
import type { ChatMessage } from "@/lib/chat-mock-data";

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-:|]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MonoTable key={`tbl-${i}`} lines={tableLines} />);
      continue;
    }

    // List items with "  ·" prefix
    if (line.match(/^\s+·\s/)) {
      elements.push(
        <div key={i} className="flex gap-2 text-[13px] font-mono text-[#8A95A0] my-0.5 pl-2">
          <span className="text-text-dim">·</span>
          <span>{renderInline(line.replace(/^\s+·\s/, ""))}</span>
        </div>
      );
      i++; continue;
    }

    // Regular list "- " items
    if (line.match(/^- /)) {
      elements.push(
        <div key={i} className="flex gap-2 text-[13px] font-mono text-[#8A95A0] my-0.5 pl-2">
          <span className="text-text-dim">·</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
      i++; continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-[13px] font-mono text-[#8A95A0] leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)|(`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const m = match[0];
    if (m.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-medium text-text-primary">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("`")) {
      parts.push(
        <code key={match.index} className="font-mono text-[11px] bg-bg-raised text-electric px-1 py-0.5 border border-border-dim">
          {m.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function MonoTable({ lines }: { lines: string[] }) {
  const headers = lines[0].split("|").filter(Boolean).map((h) => h.trim());
  const rows = lines.slice(2).map((l) => l.split("|").filter(Boolean).map((c) => c.trim()));

  return (
    <div className="my-3 overflow-x-auto border border-border-dim">
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="bg-bg-surface border-b border-border-dim">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-1.5 text-text-dim font-medium tracking-[0.06em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border-dim last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-text-secondary">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setFrame((f) => (f + 1) % 3), 300);
    return () => clearInterval(i);
  }, []);
  const chars = ["░░░", "▒▒▒", "▓▓▓"];
  return (
    <div className="msg-animate my-3">
      <span className="text-text-dim text-[13px] font-mono">◈ PROCESSING... {chars[frame]}</span>
    </div>
  );
}

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: Props) {
  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className="msg-animate mb-4 group">
          {msg.role === "user" ? (
            <div className="flex items-start gap-0">
              <span className="text-electric text-[13px] font-mono flex-shrink-0 select-none">&gt; </span>
              <p className="text-text-primary text-[13px] font-mono leading-relaxed flex-1">{msg.content}</p>
              <span className="text-text-dim text-[10px] font-mono ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : (
            <div className="mt-1">
              <div className="text-border-mid text-[13px] font-mono mb-1 select-none">
                ◈ MEDISCRIPT ——————————————————
              </div>
              <div className="pl-0">{renderContent(msg.content)}</div>
            </div>
          )}
        </div>
      ))}
      {isTyping && <TypingIndicator />}
    </>
  );
}
