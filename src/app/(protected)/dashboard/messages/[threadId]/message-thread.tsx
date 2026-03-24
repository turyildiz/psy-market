"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { sendMessage } from "@/lib/actions/messages";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  content: string;
  sender_profile_id: string;
  created_at: string;
  read: boolean;
  images?: string[];
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

// Auto-linkify URLs in message text
function renderContent(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline opacity-90 hover:opacity-100 break-all"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
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
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingIds = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Skip if we already added this optimistically
          if (pendingIds.current.has(newMsg.id)) {
            pendingIds.current.delete(newMsg.id);
            return;
          }
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  async function uploadImages(files: File[]): Promise<string[]> {
    const supabase = createClient();
    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${threadId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("messages")
        .upload(path, file, { contentType: file.type });

      if (!error) {
        const { data: urlData } = supabase.storage.from("messages").getPublicUrl(path);
        if (urlData?.publicUrl) urls.push(urlData.publicUrl);
      }
    }

    return urls;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const images = files.filter((f) => f.type.startsWith("image/")).slice(0, 4);
    setPendingImages((prev) => [...prev, ...images].slice(0, 4));
    e.target.value = "";
  }

  function removeImage(index: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSend() {
    const trimmed = text.trim();
    if ((!trimmed && pendingImages.length === 0) || isPending || isUploading) return;

    setError(null);
    const optimisticId = `optimistic-${Date.now()}`;
    const localImageUrls = pendingImages.map((f) => URL.createObjectURL(f));

    const optimistic: Message = {
      id: optimisticId,
      content: trimmed,
      sender_profile_id: myProfileId,
      created_at: new Date().toISOString(),
      read: false,
      images: localImageUrls.length > 0 ? localImageUrls : undefined,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    const filesToUpload = [...pendingImages];
    setPendingImages([]);

    startTransition(async () => {
      let imageUrls: string[] = [];

      if (filesToUpload.length > 0) {
        setIsUploading(true);
        imageUrls = await uploadImages(filesToUpload);
        setIsUploading(false);
      }

      const result = await sendMessage(
        threadId,
        receiverProfileId,
        listingId,
        trimmed,
        imageUrls.length > 0 ? imageUrls : undefined
      );

      if (result?.error) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setText(trimmed);
      } else if (result?.messageId) {
        // Replace optimistic with real id so realtime dedup works
        pendingIds.current.add(result.messageId);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId
              ? { ...m, id: result.messageId!, images: imageUrls.length > 0 ? imageUrls : undefined }
              : m
          )
        );
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
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--text-grey)]">No messages yet. Say hello!</p>
          </div>
        )}
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
                      className={`max-w-[75%] rounded-2xl text-sm overflow-hidden ${
                        isMe
                          ? "bg-[var(--brand)] text-white rounded-br-sm"
                          : "bg-gray-100 text-[var(--text-dark)] rounded-bl-sm"
                      }`}
                    >
                      {msg.images && msg.images.length > 0 && (
                        <div className={`grid gap-1 p-1 ${msg.images.length > 1 ? "grid-cols-2" : ""}`}>
                          {msg.images.map((src, i) => (
                            <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={src}
                                alt=""
                                className="rounded-xl object-cover w-full max-h-48"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      {msg.content && (
                        <div className="px-4 py-2.5">
                          <p className="leading-relaxed whitespace-pre-wrap break-words">
                            {renderContent(msg.content)}
                          </p>
                        </div>
                      )}
                      <p className={`text-[10px] pb-1.5 px-4 ${isMe ? "text-white/60 text-right" : "text-gray-400"}`}>
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

        {/* Image previews */}
        {pendingImages.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {pendingImages.map((file, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Image attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pendingImages.length >= 4}
            className="w-10 h-10 rounded-xl border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-50 hover:text-gray-600 transition disabled:opacity-40 flex-shrink-0"
            title="Attach image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

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
            disabled={(!text.trim() && pendingImages.length === 0) || isPending || isUploading}
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 flex-shrink-0"
          >
            {isUploading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </>
  );
}
