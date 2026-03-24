"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/actions/messages";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  content: string;
  sender_profile_id: string;
  created_at: string;
  read: boolean;
};

type Props = {
  threadId: string;
  receiverProfileId: string;
  listingId: string;
  myProfileId: string;
  initialMessages: Message[];
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function MessageThread({
  threadId,
  receiverProfileId,
  listingId,
  myProfileId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setError(null);
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      content: trimmed,
      sender_profile_id: myProfileId,
      created_at: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");

    startTransition(async () => {
      const result = await sendMessage(threadId, receiverProfileId, listingId, trimmed);
      if (result?.error) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setText(trimmed);
      } else {
        router.refresh();
      }
    });
  }

  // Group messages by day
  const grouped: { day: string; messages: Message[] }[] = [];
  let currentDay = "";
  for (const msg of messages) {
    const day = formatDay(msg.created_at);
    if (day !== currentDay) {
      grouped.push({ day, messages: [msg] });
      currentDay = day;
    } else {
      grouped[grouped.length - 1].messages.push(msg);
    }
  }

  return (
    <>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {grouped.map(({ day, messages: dayMsgs }) => (
          <div key={day}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-[var(--text-grey)] font-medium">{day}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="space-y-2">
              {dayMsgs.map((msg) => {
                const isMe = msg.sender_profile_id === myProfileId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-[var(--brand)] text-white rounded-br-sm"
                          : "bg-gray-100 text-[var(--text-dark)] rounded-bl-sm"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-white/60 text-right" : "text-gray-400"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 px-4 py-3">
        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)] focus:bg-white transition-colors max-h-32"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="button"
            disabled={!text.trim() || isPending}
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 flex-shrink-0"
          >
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </>
  );
}
