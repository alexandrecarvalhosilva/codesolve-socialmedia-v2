import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup após cada teste
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock AudioContext for sound notifications
class AudioContextMock {
  state: AudioContextState = 'running';
  currentTime = 0;
  destination = {};

  createOscillator() {
    const osc: any = {
      connect: () => {},
      start: () => {},
      stop: () => {
        // Ensure promises awaiting `onended` resolve in tests
        if (typeof osc.onended === 'function') {
          setTimeout(() => osc.onended?.(), 0);
        }
      },
      frequency: { value: 0 },
      type: 'sine',
      onended: null as null | (() => void),
    };

    return osc;
  }

  createGain() {
    return {
      connect: () => {},
      gain: {
        value: 0,
        exponentialRampToValueAtTime: () => {},
      },
    };
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

// Set on both window and globalThis for safety in jsdom
(window as any).AudioContext = AudioContextMock;
(globalThis as any).AudioContext = AudioContextMock;
