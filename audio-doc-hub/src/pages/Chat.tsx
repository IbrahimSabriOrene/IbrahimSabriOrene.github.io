import { useState, useRef, useEffect, useCallback } from "react";
import { Download, Database } from "lucide-react";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { mockSessions, getMockResponse } from "@/lib/chat-mock-data";
import type { ChatMessage, ChatSession } from "@/lib/chat-mock-data";
import { useToast } from "@/hooks/use-toast";

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <p className="text-text-dim text-[13px] font-mono">◈ INTELLIGENCE CONSOLE READY</p>
      <p className="text-text-dim text-[11px] font-mono">247 CALL RECORDS INDEXED — ASK ANYTHING</p>
    </div>
  );
}

export default function Chat() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions);
  const [activeSessionId, setActiveSessionId] = useState(mockSessions[0].id);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = messagesBySession[activeSessionId] || [];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleSend = (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), userMsg],
    }));

    setIsTyping(true);

    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const response = getMockResponse(content);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessagesBySession((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), aiMsg],
      }));
      setIsTyping(false);
    }, delay);
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `s-${Date.now()}`,
      title: `New query — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      timestamp: "Just now",
      messageCount: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleExport = () => {
    toast({ title: "Transcript exported", description: "Session downloaded as text file." });
  };

  const handleTitleChange = (newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, title: newTitle } : s))
    );
    setEditingTitle(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <ConversationSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={handleNewSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top strip */}
        <div className="flex items-center justify-between px-5 h-8 border-b border-border-dim bg-bg-base flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                defaultValue={activeSession?.title || ""}
                onBlur={(e) => handleTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleChange(e.currentTarget.value);
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                className="bg-transparent border-b border-electric/40 text-text-primary text-xs font-mono focus:outline-none py-0.5 min-w-[200px]"
              />
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                className="text-text-primary text-xs font-mono truncate cursor-pointer hover:text-electric transition-colors"
              >
                {activeSession?.title || "New Query"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[10px] font-mono text-text-dim">
              ▮ 247 RECORDS IN CONTEXT
            </span>
            <button
              onClick={handleExport}
              className="p-1 text-text-dim hover:text-text-secondary transition-colors"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 bg-bg-base">
          {messages.length === 0 && !isTyping ? (
            <EmptyState />
          ) : (
            <>
              <ChatMessages messages={messages} isTyping={isTyping} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
