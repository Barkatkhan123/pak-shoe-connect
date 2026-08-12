import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Factory,
  Users,
  Video,
  Settings,
  PictureInPicture,
} from "lucide-react";
import type { ProductVideo } from "@/types/product";

interface ProductVideoPlayerProps {
  videos: ProductVideo[];
  initialActiveIndex?: number;
  onVideoChange?: (index: number) => void;
}

export function ProductVideoPlayer({
  videos,
  initialActiveIndex = 0,
  onVideoChange,
}: ProductVideoPlayerProps) {
  const [activeIdx, setActiveIdx] = useState(initialActiveIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeVideo = videos[activeIdx] || videos[0];

  useEffect(() => {
    setActiveIdx(initialActiveIndex);
  }, [initialActiveIndex]);

  // Load video when active changes
  useEffect(() => {
    setIsLoading(true);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      // Auto play muted
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
    if (onVideoChange) {
      onVideoChange(activeIdx);
    }
  }, [activeIdx]);

  // Handle controls hide on idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.8);
      videoRef.current.volume = 0.8;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    setVolume(newVol);
    videoRef.current.volume = newVol;
    setIsMuted(newVol === 0);
    videoRef.current.muted = newVol === 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = Number(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PIP error:", err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getVideoTypeBadge = (type: ProductVideo["type"]) => {
    switch (type) {
      case "demo":
        return { label: "Product Demo", icon: Sparkles, color: "bg-blue-600/90 text-white" };
      case "factory":
        return { label: "Factory Tour", icon: Factory, color: "bg-amber-600/90 text-white" };
      case "customer":
        return { label: "Customer Review", icon: Users, color: "bg-emerald-600/90 text-white" };
      default:
        return { label: "Showcase", icon: Video, color: "bg-neutral-800/90 text-white" };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main Video Display Area ── */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black shadow-lg"
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <span className="mt-3 text-xs font-semibold text-white/90">Loading HD Stream...</span>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={activeVideo.url}
          poster={activeVideo.thumbnail}
          playsInline
          muted={isMuted}
          onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setIsLoading(false);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="h-full w-full object-cover cursor-pointer"
        />

        {/* Video Badge Overlay */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md backdrop-blur-md transition-opacity">
          {(() => {
            const badge = getVideoTypeBadge(activeVideo.type);
            return (
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${badge.color}`}>
                <badge.icon className="h-3 w-3" />
                {badge.label}
              </span>
            );
          })()}
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-white/90 text-[10px] font-mono">
            ▶ {activeVideo.duration}
          </span>
        </div>

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && !isLoading && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 text-black shadow-2xl transition-all hover:bg-amber-400"
          >
            <Play className="h-7 w-7 fill-current translate-x-0.5" />
          </motion.button>
        )}

        {/* Custom Video Controls Bar */}
        <AnimatePresence>
          {(showControls || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6"
            >
              {/* Scrubber timeline */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/30 accent-amber-500 hover:h-2 transition-all"
                />
              </div>

              {/* Controls buttons row */}
              <div className="flex items-center justify-between text-white/90 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="hover:text-amber-400 transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleMute}
                      className="hover:text-amber-400 transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="h-1 w-14 cursor-pointer appearance-none rounded bg-white/30 accent-amber-500 hidden sm:inline-block"
                    />
                  </div>

                  {/* Timestamps */}
                  <span className="font-mono text-[11px] text-white/70">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 relative">
                  {/* Playback speed selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-8 right-0 z-30 flex flex-col rounded-lg border border-white/10 bg-neutral-900 p-1 text-white shadow-xl">
                        {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => {
                              setPlaybackSpeed(spd);
                              if (videoRef.current) videoRef.current.playbackRate = spd;
                              setShowSpeedMenu(false);
                            }}
                            className={`rounded px-2.5 py-1 text-left text-xs transition-colors ${
                              playbackSpeed === spd ? "bg-amber-500 font-bold text-black" : "hover:bg-white/10"
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Picture-in-picture */}
                  <button
                    onClick={togglePictureInPicture}
                    className="hover:text-amber-400 transition-colors p-1"
                    title="Picture-in-Picture"
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="hover:text-amber-400 transition-colors p-1"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Multi-Video Switcher Selector Strip ── */}
      {videos.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {videos.map((vid, i) => {
            const isSel = i === activeIdx;
            const badge = getVideoTypeBadge(vid.type);
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`relative flex items-center gap-2 overflow-hidden rounded-xl border p-1.5 text-left transition-all ${
                  isSel
                    ? "border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500"
                    : "border-border/60 bg-secondary/30 hover:border-border hover:bg-secondary/60"
                }`}
              >
                <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-black">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-3 w-3 fill-white text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-bold text-foreground">
                    {badge.label}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-mono">
                    {vid.duration}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
