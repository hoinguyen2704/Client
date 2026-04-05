import type { RealtimeEventEnvelope } from '@/types';

const REALTIME_EVENT_NAME = 'hozitech:realtime-event';

type RealtimeEventHandler = (event: RealtimeEventEnvelope) => void;

export function emitRealtimeEvent(event: RealtimeEventEnvelope) {
  window.dispatchEvent(new CustomEvent<RealtimeEventEnvelope>(REALTIME_EVENT_NAME, { detail: event }));
}

export function onRealtimeEvent(handler: RealtimeEventHandler) {
  const wrappedHandler = (event: Event) => {
    const customEvent = event as CustomEvent<RealtimeEventEnvelope>;
    if (!customEvent.detail) return;
    handler(customEvent.detail);
  };

  window.addEventListener(REALTIME_EVENT_NAME, wrappedHandler as EventListener);
  return () => window.removeEventListener(REALTIME_EVENT_NAME, wrappedHandler as EventListener);
}
