import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { MODELS, type ModelInfo } from "~/lib/ask/config";
import { detectDevice, formatBytes, modelsForTier, type DeviceInfo } from "~/lib/ask/device";
import { ERROR_MESSAGE, REFUSAL_MESSAGE, strings } from "~/lib/ask/strings";
import {
  cleanupPartialDownloads,
  downloadModel,
  DownloadError,
  getCachedModel,
  getStorageUsed,
  removeAllModels,
} from "~/lib/ask/storage";

type Phase = "detecting" | "consent" | "downloading" | "initializing" | "ready" | "error" | "unsupported";
type Assistant = import("~/lib/ask/engine").Assistant;

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  status: "checking" | "streaming" | "done" | "stopped" | "refused" | "error";
  question?: string;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], select, [tabindex]:not([tabindex="-1"])';

export default function AskAssistant() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("detecting");
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0, speed: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [storageUsed, setStorageUsed] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [input, setInput] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const assistantRef = useRef<Assistant | null>(null);
  const downloadAbort = useRef<AbortController | null>(null);
  const askAbort = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  const started = useRef(false);

  const unsupported = phase === "unsupported";

  // Device detection and partial-download cleanup: no network requests for model weights.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await cleanupPartialDownloads().catch(() => {});
      const info = await detectDevice();
      if (cancelled) return;
      setDevice(info);
      if (!info.supported) {
        setError(info.reason ?? "");
        setPhase("unsupported");
        return;
      }
      setModel(info.recommended!);
      setPhase("consent");
    })();
    return () => {
      cancelled = true;
      downloadAbort.current?.abort();
      askAbort.current?.abort();
      assistantRef.current?.dispose();
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    fabRef.current?.focus();
  }, []);

  const initialize = useCallback(async (target: ModelInfo) => {
    setPhase("initializing");
    let candidate: ModelInfo | undefined = target;
    // Try the chosen model, then fall back to smaller ones if it can't start (OOM / device lost).
    while (candidate) {
      try {
        let file = await getCachedModel(candidate);
        if (!file) {
          setPhase("downloading");
          setProgress({ loaded: 0, total: candidate.sizeBytes, speed: 0 });
          const controller = new AbortController();
          downloadAbort.current = controller;
          const startedAt = performance.now();
          file = await downloadModel(
            candidate,
            (loaded, total) => setProgress({ loaded, total, speed: loaded / ((performance.now() - startedAt) / 1000) }),
            controller.signal
          );
          downloadAbort.current = null;
          setPhase("initializing");
        }
        const { Assistant } = await import("~/lib/ask/engine");
        assistantRef.current = await Assistant.create(file);
        setModel(candidate);
        setStorageUsed(await getStorageUsed());
        setPhase("ready");
        return;
      } catch (err) {
        downloadAbort.current = null;
        if (err instanceof DownloadError) {
          if (err.kind === "aborted") {
            setPhase("consent");
          } else {
            setError(err.message);
            setPhase("error");
          }
          return;
        }
        console.error(err);
        const smaller: ModelInfo | undefined = MODELS[MODELS.indexOf(candidate) - 1];
        if (!smaller) {
          setError(strings.initError);
          setPhase("error");
          return;
        }
        setNotice(strings.fallbackNotice(smaller.label));
        setPhase("initializing");
        candidate = smaller;
      }
    }
  }, []);

  // Open: if the model is already cached, go straight to initializing (no download).
  const openPanel = async () => {
    setOpen(true);
    if (started.current || phase !== "consent" || !model) return;
    for (const m of [...MODELS].reverse()) {
      if (await getCachedModel(m)) {
        started.current = true;
        setModel(m);
        initialize(m);
        return;
      }
    }
  };

  // Escape closes; Tab is trapped inside the panel; focus moves into the panel on open.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [open, phase]);

  const onPanelKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab") return;
    const items = [...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
  };

  const accept = () => {
    if (!model) return;
    started.current = true;
    setError("");
    setNotice("");
    initialize(model);
  };

  const removeModel = async () => {
    askAbort.current?.abort();
    await assistantRef.current?.dispose();
    assistantRef.current = null;
    await removeAllModels();
    started.current = false;
    setMessages([]);
    setStorageUsed(0);
    setNotice(strings.removeModelConfirm);
    setPhase("consent");
  };

  const patch = (id: number, update: Partial<ChatMessage>) =>
    setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...update } : m)));

  const ask = async (question: string, replaceId?: number) => {
    const assistant = assistantRef.current;
    if (!assistant || busy) return;
    const id = nextId.current++;
    setBusy(true);
    stickToBottom.current = true;
    setMessages((all) => [
      ...all.filter((m) => m.id !== replaceId),
      ...(replaceId ? [] : [{ id: nextId.current++, role: "user" as const, text: question, status: "done" as const }]),
      { id, role: "assistant", text: "", status: "checking", question },
    ]);
    const controller = new AbortController();
    askAbort.current = controller;
    let text = "";
    let finalStatus: ChatMessage["status"] = "done";
    try {
      for await (const event of assistant.ask(question, controller.signal)) {
        if (event.type === "refused") {
          text = REFUSAL_MESSAGE;
          finalStatus = "refused";
        } else if (event.type === "text") {
          text += event.text;
          patch(id, { text, status: "streaming" });
        }
      }
      if (controller.signal.aborted) finalStatus = text ? "stopped" : "refused";
      if (finalStatus === "refused" && !text) text = REFUSAL_MESSAGE;
    } catch (err) {
      console.error(err);
      text = ERROR_MESSAGE;
      finalStatus = "error";
    }
    patch(id, { text, status: finalStatus });
    setAnnouncement(text); // announced once, at the end
    askAbort.current = null;
    setBusy(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    ask(question);
  };

  // Auto-scroll follows the stream unless the visitor scrolled up.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  const options = device ? modelsForTier(device.tier) : [];
  const alternative = model && options.length > 1 ? options.find((m) => m.id !== model.id) : undefined;
  const pct = progress.total ? Math.min(100, Math.round((progress.loaded / progress.total) * 100)) : 0;

  const buttonClass = "px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer";
  const primaryButton = { backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" };
  const secondaryButton = { border: "1px solid var(--color-border)", color: "var(--color-foreground)" };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        onClick={unsupported ? undefined : openPanel}
        aria-label={unsupported ? `${strings.fabLabel}: ${strings.fabUnsupported}` : strings.fabLabel}
        aria-disabled={unsupported}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={unsupported ? `${strings.fabUnsupported}. ${error}` : strings.fabLabel}
        className={`fixed z-40 rounded-full shadow-lg px-4 py-3 text-sm font-medium flex items-center gap-2 ${unsupported ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        style={{
          ...primaryButton,
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <span aria-hidden="true">💬</span>
        {strings.fabLabel}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={strings.panelTitle}
          onKeyDown={onPanelKeyDown}
          className="fixed z-50 flex flex-col rounded-xl shadow-2xl w-[min(24rem,calc(100vw-2rem))] h-[min(32rem,calc(100dvh-6rem))]"
          style={{
            right: "max(1rem, env(safe-area-inset-right))",
            bottom: "max(4.5rem, calc(env(safe-area-inset-bottom) + 3.5rem))",
            backgroundColor: "var(--color-card)",
            color: "var(--color-card-foreground)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <h2 className="font-semibold">{strings.panelTitle}</h2>
            <button type="button" onClick={close} aria-label={strings.close} className="cursor-pointer px-2">
              ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col p-4 gap-3 text-sm">
            {phase === "detecting" && <p>{strings.checkingDevice}</p>}

            {phase === "consent" && model && (
              <div className="space-y-3 overflow-y-auto">
                <h3 className="font-semibold">{strings.consentTitle}</h3>
                <p>{strings.consentBody(formatBytes(model.sizeBytes))}</p>
                <p style={{ color: "var(--color-muted-foreground)" }}>
                  {strings.consentModel(model.label, formatBytes(model.sizeBytes))}
                </p>
                {alternative && (
                  <button type="button" className="underline cursor-pointer" onClick={() => setModel(alternative)}>
                    {MODELS.indexOf(alternative) < MODELS.indexOf(model)
                      ? strings.switchToSmaller(alternative.label)
                      : strings.switchToLarger(alternative.label)}
                  </button>
                )}
                {device?.metered && <p role="alert">{strings.meteredWarning}</p>}
                {notice && <p role="status">{notice}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={accept} className={buttonClass} style={primaryButton}>
                    {strings.accept}
                  </button>
                  <button type="button" onClick={close} className={buttonClass} style={secondaryButton}>
                    {strings.decline}
                  </button>
                </div>
                <p style={{ color: "var(--color-muted-foreground)" }}>{strings.privacyNote}</p>
              </div>
            )}

            {phase === "downloading" && (
              <div className="space-y-3">
                <p>{strings.downloading}</p>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={strings.downloading}
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--color-muted)" }}
                >
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: "var(--color-primary)" }} />
                </div>
                <p style={{ color: "var(--color-muted-foreground)" }}>
                  {pct}% · {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
                  {progress.speed > 0 && ` · ${(progress.speed / 1024 ** 2).toFixed(1)} MB/s`}
                </p>
                {notice && <p role="status">{notice}</p>}
                <button type="button" onClick={() => downloadAbort.current?.abort()} className={buttonClass} style={secondaryButton}>
                  {strings.cancel}
                </button>
              </div>
            )}

            {phase === "initializing" && (
              <div className="flex flex-col gap-3" role="status">
                <span
                  className="inline-block h-6 w-6 rounded-full border-2 animate-spin"
                  style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
                  aria-hidden="true"
                />
                <p>{strings.initializing}</p>
                {notice && <p>{notice}</p>}
              </div>
            )}

            {(phase === "error" || phase === "unsupported") && (
              <div className="space-y-3" role="alert">
                <p>{error}</p>
                {phase === "error" && model && (
                  <button type="button" onClick={accept} className={buttonClass} style={primaryButton}>
                    {strings.retry}
                  </button>
                )}
              </div>
            )}

            {phase === "ready" && (
              <>
                <div ref={listRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto space-y-2">
                  {messages.length === 0 && <p style={{ color: "var(--color-muted-foreground)" }}>{strings.privacyNote}</p>}
                  {messages.map((m) => (
                    <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className="rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words"
                        style={
                          m.role === "user"
                            ? primaryButton
                            : { backgroundColor: "var(--color-muted)", color: "var(--color-foreground)" }
                        }
                        aria-live="off"
                      >
                        {m.status === "checking" ? <em>{strings.checking}</em> : m.text}
                        {m.status === "stopped" && <em className="block text-xs opacity-70">({strings.stopped})</em>}
                        {m.status === "error" && m.question && (
                          <button type="button" className="block underline cursor-pointer mt-1" onClick={() => ask(m.question!, m.id)} disabled={busy}>
                            {strings.retry}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Finished answers are announced once, not token by token. */}
                <div className="sr-only" aria-live="polite" role="status">
                  {announcement}
                </div>
                <form onSubmit={submit} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={busy}
                    aria-label={strings.inputLabel}
                    placeholder={strings.inputPlaceholder}
                    className="flex-1 min-w-0 rounded-md px-3 py-1.5"
                    style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
                  />
                  {busy ? (
                    <button type="button" onClick={() => askAbort.current?.abort()} className={buttonClass} style={secondaryButton}>
                      {strings.stop}
                    </button>
                  ) : (
                    <button type="submit" className={buttonClass} style={primaryButton}>
                      {strings.send}
                    </button>
                  )}
                </form>
                <div className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  <span>{strings.storageUsed(formatBytes(storageUsed))}</span>
                  <button type="button" onClick={removeModel} className="underline cursor-pointer">
                    {strings.removeModel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
