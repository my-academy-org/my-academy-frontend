"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const RATES = [1, 1.25, 1.5, 2, 0.75];
const HIDE_AFTER_MS = 2500;

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const glyphs = {
  play: <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" stroke="none" />,
  volume: (
    <>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  muted: (
    <>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="m16 9.5 5 5m0-5-5 5" />
    </>
  ),
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  shrink: <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />,
} satisfies Record<string, ReactNode>;

function Glyph({ name, className }: { name: keyof typeof glyphs; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {glyphs[name]}
    </svg>
  );
}

const control = "grid size-9 shrink-0 place-items-center rounded-lg text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:bg-white/15 focus-visible:outline-none";

/**
 * Lesson video with its own controls, in the academy's colour (the `brand`
 * palette follows each academy's theme, so it matches every template).
 *
 * The browser's own controls and context menu are left out, so there is no
 * "save video" entry and no download button. That keeps the file out of easy
 * reach, not out of reach: whoever may watch a video can still capture it.
 */
export function VideoPlayer({
  src,
  title,
  autoPlay,
  className,
  onError,
}: {
  src: string;
  /** Read by screen readers as the player's name. */
  title?: string;
  autoPlay?: boolean;
  className?: string;
  onError?: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(!!autoPlay);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      clearTimeout(hideTimer.current);
    };
  }, []);

  /** Shows the controls, then lets them fade once the viewer stops moving. */
  const wake = () => {
    setActive(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setActive(false), HIDE_AFTER_MS);
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    wake();
  };

  const seek = (to: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.duration, to));
    setTime(video.currentTime);
    wake();
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, value));
    video.muted = video.volume === 0;
    wake();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.5;
    wake();
  };

  const nextRate = () => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    wake();
  };

  const toggleFullscreen = () => {
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frameRef.current?.requestFullscreen) frameRef.current.requestFullscreen().catch(() => {});
    // iPhone Safari can only make the video element itself fullscreen.
    else video?.webkitEnterFullscreen?.();
    wake();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Sliders and buttons keep their own keys.
    if (e.target !== e.currentTarget || e.altKey || e.ctrlKey || e.metaKey) return;
    const actions: Record<string, () => void> = {
      " ": toggle,
      k: toggle,
      ArrowRight: () => seek(time + 5),
      ArrowLeft: () => seek(time - 5),
      ArrowUp: () => changeVolume(volume + 0.1),
      ArrowDown: () => changeVolume(volume - 0.1),
      m: toggleMute,
      f: toggleFullscreen,
    };
    const action = actions[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const shown = !playing || active;
  const percent = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={frameRef}
      // Time runs left to right whatever the page's direction.
      dir="ltr"
      role="group"
      aria-label={title ? `فيديو: ${title}` : "فيديو الدرس"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      onPointerLeave={() => playing && setActive(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "group/player relative isolate aspect-video w-full overflow-hidden bg-ink-950 outline-none select-none focus-visible:ring-4 focus-visible:ring-brand-500/40",
        !shown && "cursor-none",
        fullscreen && "aspect-auto rounded-none",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        className="size-full bg-black object-contain"
        onClick={toggle}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length && v.duration) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
        onError={onError}
      >
        <track kind="captions" />
      </video>

      {/* Centre: buffering, or a large play button while paused */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        {waiting ? (
          <span className="size-12 animate-spin rounded-full border-4 border-white/20 border-t-brand-400" role="status" aria-label="جارٍ التحميل" />
        ) : (
          !playing && (
            <button
              type="button"
              onClick={toggle}
              aria-label="تشغيل"
              className="pointer-events-auto grid size-18 place-items-center rounded-full bg-white/95 text-brand-700 shadow-float transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              <Glyph name="play" className="size-8 translate-x-0.5" />
            </button>
          )
        )}
      </div>

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pt-12 pb-2 transition-opacity duration-300 sm:px-4 sm:pb-3",
          shown ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="group/seek relative flex h-4 items-center">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5">
            <div className="absolute h-full rounded-full bg-white/35" style={{ width: `${buffered}%` }} />
            <div className="relative h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
          </div>
          <span
            className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lift ring-2 ring-brand-500 transition-transform group-hover/seek:scale-110"
            style={{ left: `${percent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="any"
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="موضع التشغيل"
            aria-valuetext={`${clock(time)} من ${clock(duration)}`}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="mt-1 flex items-center gap-1 text-white">
          <button type="button" onClick={toggle} aria-label={playing ? "إيقاف مؤقت" : "تشغيل"} className={control}>
            <Glyph name={playing ? "pause" : "play"} />
          </button>
          <button type="button" onClick={toggleMute} aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} className={control}>
            <Glyph name={muted || volume === 0 ? "muted" : "volume"} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="مستوى الصوت"
            className="hidden h-1 w-20 cursor-pointer accent-brand-500 sm:block"
          />
          <span className="ms-2 text-xs font-semibold text-white/90 tabular-nums">
            {clock(time)} <span className="text-white/50">/ {clock(duration)}</span>
          </span>

          <button type="button" onClick={nextRate} aria-label={`سرعة التشغيل ${rate}×`} className={cn(control, "ms-auto w-auto px-2.5 text-xs font-bold tabular-nums")}>
            {rate}×
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"} className={control}>
            <Glyph name={fullscreen ? "shrink" : "expand"} />
          </button>
        </div>
      </div>
    </div>
  );
}
