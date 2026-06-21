"use client";

import { useEffect, useRef } from "react";

/**
 * Opens an EventSource to /api/messages/events and calls `onNewMessage`
 * whenever a `new_message` SSE event arrives. Reconnects automatically
 * with exponential back-off (up to 30 s).
 */
export function useMessagesSSE(onNewMessage: () => void) {
  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let retryDelay = 1000;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      es = new EventSource("/api/messages/events", { withCredentials: true });

      es.addEventListener("new_message", () => {
        retryDelay = 1000; // reset back-off on successful event
        onNewMessageRef.current();
      });

      es.onerror = () => {
        es?.close();
        es = null;
        if (!cancelled) {
          retryTimeout = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30_000);
            connect();
          }, retryDelay);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
  }, []);
}
