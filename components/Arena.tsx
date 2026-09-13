"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CheckoutButton from "@/app/CheckoutButton";
import { PROMPTS, getPrompt, promptText } from "@/lib/prompts";
import {
  canPractice,
  consumePractice,
  isPro,
  markPro,
  remainingFree,
  FREE_LIMIT,
} from "@/lib/paywall";
import { countWords, startTranscript } from "@/lib/speech";
import type { ClipMeta, DuoInvite } from "@/lib/types";

const MAX_MS = 60_000;

type Phase = "pick" | "ready" | "recording" | "saving" | "result" | "paywall";

export default function Arena({
  initialLang = "en",
  lockedPromptId,
  duoCode: initialDuoCode,
  duoRole = "host",
}: {
  initialLang?: "en" | "ar";
  lockedPromptId?: string;
  duoCode?: string;
  duoRole?: "host" | "guest";
}) {
  const [lang, setLang] = useState<"en" | "ar">(initialLang);
  const [promptId, setPromptId] = useState(
    lockedPromptId || PROMPTS[0]!.id
  );
  const [phase, setPhase] = useState<Phase>("pick");
  const [elapsed, setElapsed] = useState(0);
  const [clip, setClip] = useState<ClipMeta | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [duo, setDuo] = useState<DuoInvite | null>(null);
  const [duoLinkCopied, setDuoLinkCopied] = useState(false);
  const [pro, setPro] = useState(false);
  const [freeLeft, setFreeLeft] = useState(FREE_LIMIT);
  const [transcript, setTranscript] = useState("");

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const speechStopRef = useRef<(() => void) | null>(null);
  const transcriptRef = useRef("");

  const prompt = useMemo(
    () => getPrompt(promptId) || PROMPTS[0]!,
    [promptId]
  );
  const text = promptText(prompt, lang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    markProFromUrl();
    setPro(isPro());
    setFreeLeft(remainingFree() === Infinity ? 999 : remainingFree());
  }, []);

  useEffect(() => {
    if (lockedPromptId) {
      setPromptId(lockedPromptId);
      setPhase("ready");
    }
  }, [lockedPromptId]);

  const cleanupMedia = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    speechStopRef.current?.();
    speechStopRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRef.current = null;
  }, []);

  useEffect(() => () => cleanupMedia(), [cleanupMedia]);

  async function beginRecord() {
    setError(null);
    if (!canPractice()) {
      setPhase("paywall");
      return;
    }
    if (!consumePractice()) {
      setPhase("paywall");
      return;
    }
    setFreeLeft(remainingFree() === Infinity ? 999 : remainingFree());
    setPro(isPro());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      mediaRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void finalizeRecording();
      };

      transcriptRef.current = "";
      setTranscript("");
      const speech = startTranscript(lang, (t) => {
        transcriptRef.current = t;
        setTranscript(t);
      });
      speechStopRef.current = speech.stop;

      startRef.current = Date.now();
      setElapsed(0);
      setPhase("recording");
      recorder.start(250);

      timerRef.current = window.setInterval(() => {
        const ms = Date.now() - startRef.current;
        setElapsed(ms);
        if (ms >= MAX_MS) {
          stopRecord();
        }
      }, 100);
    } catch {
      setError(
        lang === "ar"
          ? "يلزم إذن الميكروفون للتسجيل."
          : "Microphone permission is required to record."
      );
      setPhase("ready");
    }
  }

  function stopRecord() {
    const rec = mediaRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    } else {
      void finalizeRecording();
    }
  }

  async function finalizeRecording() {
    speechStopRef.current?.();
    speechStopRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const durationMs = Math.min(MAX_MS, Date.now() - startRef.current);
    const blob = new Blob(chunksRef.current, {
      type: chunksRef.current[0]?.type || "audio/webm",
    });
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    setPhase("saving");
    const words = countWords(transcriptRef.current);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          lang,
          durationMs,
          wordCount: words || undefined,
          transcriptPreview: transcriptRef.current.slice(0, 280) || undefined,
          duoCode: initialDuoCode,
          role: duoRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clip) {
        throw new Error(data.error || "Save failed");
      }
      const saved = data.clip as ClipMeta;
      setClip(saved);

      if (initialDuoCode) {
        const completeRes = await fetch(
          `/api/duo/${initialDuoCode}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: duoRole,
              clipId: saved.id,
              score: saved.score,
            }),
          }
        );
        const completeData = await completeRes.json();
        if (completeRes.ok && completeData.duo) {
          setDuo(completeData.duo as DuoInvite);
        }
      }

      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setPhase("result");
    }
  }

  async function inviteDuo() {
    if (!clip) return;
    setError(null);
    try {
      const res = await fetch("/api/duo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: clip.promptId,
          lang: clip.lang,
          hostClipId: clip.id,
          hostScore: clip.score,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.duo) throw new Error(data.error || "Invite failed");
      setDuo(data.duo as DuoInvite);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invite failed");
    }
  }

  function copyShare() {
    if (!clip) return;
    const link = `${window.location.origin}/c/${clip.id}`;
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function copyDuo() {
    if (!duo) return;
    const link = `${window.location.origin}/duo/${duo.code}`;
    void navigator.clipboard.writeText(link).then(() => {
      setDuoLinkCopied(true);
      setTimeout(() => setDuoLinkCopied(false), 1800);
    });
  }

  function downloadAudio() {
    if (!audioUrl || !clip) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `speakclip-${clip.id}.webm`;
    a.click();
  }

  function resetPractice() {
    setClip(null);
    setDuo(null);
    setTranscript("");
    setError(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (lockedPromptId) setPhase("ready");
    else setPhase("pick");
  }

  const secs = (elapsed / 1000).toFixed(1);
  const shareUrl = clip ? `/c/${clip.id}` : null;

  return (
    <div className="arena" dir={dir}>
      <div className="arena-meta">
        <div className="pill-row">
          <button
            type="button"
            className={`pill ${lang === "en" ? "pill-on" : ""}`}
            onClick={() => setLang("en")}
            disabled={!!lockedPromptId || phase === "recording"}
          >
            EN
          </button>
          <button
            type="button"
            className={`pill ${lang === "ar" ? "pill-on" : ""}`}
            onClick={() => setLang("ar")}
            disabled={!!lockedPromptId || phase === "recording"}
          >
            عربي
          </button>
          <span className="pill muted-pill">
            {pro
              ? lang === "ar"
                ? "برو · بلا حدود"
                : "Pro · unlimited"
              : lang === "ar"
                ? `${freeLeft} مجانية اليوم`
                : `${freeLeft} free today`}
          </span>
        </div>
      </div>

      {phase === "paywall" && (
        <section className="card paywall-card">
          <div className="badge">
            {lang === "ar" ? "٣ محاولات مجانية/يوم" : "3 free practices / day"}
          </div>
          <h2>
            {lang === "ar"
              ? "لقد استخدمت محاولاتك المجانية اليوم"
              : "You’ve used today’s free practices"}
          </h2>
          <p className="lead">
            {lang === "ar"
              ? "افتح SpeakClip Pro لممارسة بلا حدود، بطاقات مشاركة، ودعوات ثنائية."
              : "Unlock SpeakClip Pro for unlimited practice, share cards, and duo invites."}
          </p>
          <div className="cta-row">
            <CheckoutButton
              label={lang === "ar" ? "افتح برو — ١٠$/أسبوع" : "Go Pro — $10/week"}
            />
            <button type="button" className="btn-ghost" onClick={resetPractice}>
              {lang === "ar" ? "رجوع" : "Back"}
            </button>
          </div>
        </section>
      )}

      {(phase === "pick" || phase === "ready") && (
        <section className="card">
          <h2>{lang === "ar" ? "اختر تمرينًا" : "Pick a prompt"}</h2>
          {!lockedPromptId && (
            <div className="prompt-grid">
              {PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`prompt-chip ${p.id === promptId ? "prompt-on" : ""}`}
                  onClick={() => {
                    setPromptId(p.id);
                    setPhase("ready");
                  }}
                >
                  <span className="prompt-theme">{p.theme}</span>
                  <span className="prompt-text">
                    {lang === "ar" ? p.ar : p.en}
                  </span>
                </button>
              ))}
            </div>
          )}
          {lockedPromptId && (
            <p className="duo-lock">
              {lang === "ar" ? "تحدي ثنائي — نفس التمرين" : "Duo challenge — same prompt"}
            </p>
          )}
          <div className="prompt-focus">
            <p className="prompt-big">{text}</p>
            <div className="cta-row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (!canPractice()) {
                    setPhase("paywall");
                    return;
                  }
                  void beginRecord();
                }}
              >
                {lang === "ar" ? "سجّل حتى ٦٠ ثانية" : "Record up to 60s"}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "recording" && (
        <section className="card record-card">
          <div className="rec-dot" aria-hidden />
          <h2>{lang === "ar" ? "جاري التسجيل…" : "Recording…"}</h2>
          <p className="timer">{secs}s / 60s</p>
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${Math.min(100, (elapsed / MAX_MS) * 100)}%` }}
            />
          </div>
          <p className="prompt-big soft">{text}</p>
          {transcript && (
            <p className="transcript live">{transcript}</p>
          )}
          <button type="button" className="btn btn-stop" onClick={stopRecord}>
            {lang === "ar" ? "إيقاف وحساب النتيجة" : "Stop & score"}
          </button>
        </section>
      )}

      {phase === "saving" && (
        <section className="card">
          <h2>{lang === "ar" ? "نحفظ البطاقة…" : "Saving your card…"}</h2>
          <p className="lead">{lang === "ar" ? "لحظة…" : "One moment…"}</p>
        </section>
      )}

      {phase === "result" && clip && (
        <section className="card result-card">
          <div className="badge">
            {lang === "ar" ? "بطاقة المشاركة" : "Share card"}
          </div>
          <div className="score-ring">
            <span className="score-num">{clip.score}</span>
            <span className="score-label">
              {lang === "ar" ? "طلاقة" : "fluency"}
            </span>
          </div>
          <p className="prompt-big soft">{clip.promptText}</p>
          <ul className="breakdown">
            <li>
              {lang === "ar" ? "المدة" : "Duration"}: {clip.scoreBreakdown.duration}
            </li>
            <li>
              {lang === "ar" ? "الاستمرارية" : "Continuity"}:{" "}
              {clip.scoreBreakdown.continuity}
            </li>
            <li>
              {lang === "ar" ? "الكلمات" : "Words"}: {clip.scoreBreakdown.words}
              {clip.wordCount != null ? ` · ${clip.wordCount} w` : ""}
            </li>
          </ul>
          {audioUrl && (
            <audio className="player" controls src={audioUrl} />
          )}
          {error && <p className="err">{error}</p>}
          <div className="cta-row wrap">
            <a className="btn" href={shareUrl || "#"}>
              {lang === "ar" ? "فتح البطاقة" : "Open card"}
            </a>
            <button type="button" className="btn-ghost" onClick={copyShare}>
              {copied
                ? lang === "ar"
                  ? "تم النسخ"
                  : "Copied"
                : lang === "ar"
                  ? "نسخ الرابط"
                  : "Copy link"}
            </button>
            {audioUrl && (
              <button type="button" className="btn-ghost" onClick={downloadAudio}>
                {lang === "ar" ? "تنزيل .webm" : "Download .webm"}
              </button>
            )}
          </div>

          {!initialDuoCode && (
            <div className="duo-box">
              <h3>{lang === "ar" ? "دعوة ثنائية" : "Invite a duo"}</h3>
              <p className="muted">
                {lang === "ar"
                  ? "صديقك يأخذ نفس التمرين — ثم تقارنان النتيجة."
                  : "A friend runs the same prompt — then you compare scores."}
              </p>
              {!duo ? (
                <button type="button" className="btn" onClick={() => void inviteDuo()}>
                  {lang === "ar" ? "إنشاء رمز دعوة" : "Create invite code"}
                </button>
              ) : (
                <div className="duo-ready">
                  <code className="duo-code">{duo.code}</code>
                  <button type="button" className="btn-ghost" onClick={copyDuo}>
                    {duoLinkCopied
                      ? lang === "ar"
                        ? "تم"
                        : "Copied"
                      : lang === "ar"
                        ? "نسخ رابط الثنائي"
                        : "Copy duo link"}
                  </button>
                  <a className="link" href={`/duo/${duo.code}`}>
                    /duo/{duo.code}
                  </a>
                </div>
              )}
            </div>
          )}

          {duo && duo.status === "complete" && (
            <div className="duo-compare">
              <h3>{lang === "ar" ? "مقارنة الثنائي" : "Duo comparison"}</h3>
              <div className="compare-grid">
                <div>
                  <div className="muted">{lang === "ar" ? "المضيف" : "Host"}</div>
                  <div className="score-num sm">{duo.hostScore ?? "—"}</div>
                </div>
                <div>
                  <div className="muted">{lang === "ar" ? "الضيف" : "Guest"}</div>
                  <div className="score-num sm">{duo.guestScore ?? "—"}</div>
                </div>
              </div>
            </div>
          )}

          <div className="cta-row" style={{ marginTop: "1.25rem" }}>
            <button type="button" className="btn-ghost" onClick={resetPractice}>
              {lang === "ar" ? "تمرين آخر" : "Practice again"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function markProFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) markPro();
  } catch {
    /* ignore */
  }
}
