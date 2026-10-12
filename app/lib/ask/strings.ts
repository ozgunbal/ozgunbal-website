// All user-facing copy for the "Ask about me" assistant lives here so it can be translated later.

export const REFUSAL_MESSAGE =
  "I can only answer questions about my background and experience shown on this page. Feel free to ask me about my work, skills, or projects! 🙂";

export const ERROR_MESSAGE = "Something went wrong, please try again.";

export const strings = {
  fabLabel: "Ask about me",
  fabUnsupported: "Not supported on this device/browser",
  panelTitle: "Ask about me",
  close: "Close",
  checkingDevice: "Checking your device…",
  consentTitle: "Run an AI model on your device?",
  consentBody: (sizeLabel: string) =>
    `A ~${sizeLabel} AI model will be downloaded and run locally on your device. Nothing you type is sent to a server, and the model is cached so you only download it once.`,
  consentModel: (label: string, sizeLabel: string) => `Model for your device: ${label} (${sizeLabel})`,
  meteredWarning: "Your connection looks metered or slow. Consider switching to the smaller model or waiting for Wi-Fi.",
  switchToSmaller: (label: string) => `Use the smaller model (${label})`,
  switchToLarger: (label: string) => `Use the larger model (${label})`,
  accept: "Download & start",
  decline: "Not now",
  downloading: "Downloading model…",
  cancel: "Cancel",
  initializing: "Preparing model…",
  fallbackNotice: (label: string) => `The larger model couldn't start on this device. Switching to ${label}…`,
  retry: "Retry",
  quotaError: (needed: string, available: string) =>
    `Not enough free storage: the model needs about ${needed} but only ${available} is available.`,
  networkError: "The download failed. Check your connection and try again.",
  initError: "The model couldn't start on this device.",
  inputPlaceholder: "Ask about my background…",
  inputLabel: "Your question",
  send: "Send",
  stop: "Stop",
  stopped: "stopped",
  checking: "Checking…",
  removeModel: "Remove downloaded model",
  removeModelConfirm: "Model removed.",
  storageUsed: (size: string) => `Using ${size} of storage`,
  privacyNote: "Runs fully on your device. Questions and answers never leave your browser.",
  unsupported: {
    noWebGpu: "This browser doesn't support WebGPU, which the on-device model needs.",
    noOpfs: "This browser can't store large files locally (OPFS), which the on-device model needs.",
    noQuota: "There isn't enough free storage on this device for the model.",
    noAdapter: "No compatible GPU was found.",
  },
};
