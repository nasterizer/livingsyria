import { EventEmitter } from "node:events";

/**
 * In-process pub/sub bus for server-sent events.
 * Single-replica only — for multi-replica, replace with Redis pub/sub.
 */
class AppEvents extends EventEmitter {}
export const appEvents = new AppEvents();
appEvents.setMaxListeners(500);

export const EVENT_NEW_MESSAGE = "new_message";

/** Emitted when a message is created; payload is the recipient user ID. */
export function emitNewMessage(toUserId: string): void {
  appEvents.emit(EVENT_NEW_MESSAGE, toUserId);
}
