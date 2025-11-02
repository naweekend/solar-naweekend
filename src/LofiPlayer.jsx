import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

const MUSIC_TYPES = ["🎧 lofi", "🎷 classical", "🎙️ urdu", "🎻 english"];

export default function LofiPlayer() {
  const [musicType, setMusicType] = useState("english");
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [timeLeft, setTimeLeft] = useState("0:00");

  const audioRef = useRef(null);
  const isSeeking = useRef(false);
  const wasPlayingBeforeSeek = useRef(false);

  const tracks = [1, 2, 3].map((n) => `${musicType}-${n}`);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.warn("Playback blocked:", err);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isSeeking.current) return;

    const current = audio.currentTime;
    const duration = audio.duration;
    if (!duration || isNaN(duration)) return;

    setProgress(current / duration);

    const remaining = Math.max(duration - current, 0);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60)
      .toString()
      .padStart(2, "0");
    setTimeLeft(`${minutes}:${seconds}`);
  };

  const handleSeekStart = () => {
    if (!audioRef.current) return;
    isSeeking.current = true;
    wasPlayingBeforeSeek.current = !audioRef.current.paused;
    audioRef.current.pause();
  };

  const handleSeekEnd = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newProgress = parseFloat(e.target.value);
    audio.currentTime = newProgress * audio.duration;
    setProgress(newProgress);
    isSeeking.current = false;
    if (wasPlayingBeforeSeek.current) audio.play().catch(() => { });
  };

  const handleSeekChange = (e) => {
    setProgress(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleMusicTypeChange = (e) => {
    setMusicType(e.target.value);
    setCurrentTrack(0);
  };

  // When track/type changes, load and play if already playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.load();
    setProgress(0);
    setTimeLeft("0:00");

    const handleCanPlay = async () => {
      if (isPlaying) {
        try {
          await audio.play();
        } catch (err) {
          console.warn("Autoplay blocked:", err);
        }
      }
    };

    audio.addEventListener("canplaythrough", handleCanPlay);
    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [musicType, currentTrack]);

  // Sync play/pause with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => { });
    else audio.pause();
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="fixed bottom-5 left-5 sm:w-96 w-[calc(100vw-2.5rem)] backdrop-blur-md rounded-xl p-4 flex flex-col gap-3 shadow-lg bg-base-200 text-base-content">
      <audio
        ref={audioRef}
        src={`/music/${tracks[currentTrack]}.mp3`}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      {/* Top Bar */}
      <div className="flex justify-between items-center w-full">
        <select
          className="select select-xs max-w-24 bg-base-200 px-0 border-0 outline-0 font-medium"
          value={musicType}
          onChange={handleMusicTypeChange}
        >
          {MUSIC_TYPES.map((type) => {
            const [emoji, name] = type.split(" ");
            return (
              <option key={type} value={name}>
                {emoji} {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            );
          })}
        </select>
        <span className="text-xs opacity-80">{timeLeft}</span>
      </div>

      {/* Progress Bar */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        onChange={handleSeekChange}
        onMouseDown={handleSeekStart}
        onMouseUp={handleSeekEnd}
        onTouchStart={handleSeekStart}
        onTouchEnd={handleSeekEnd}
        className="range range-xs range-primary w-full"
      />

      {/* Bottom Controls */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-2">
          <button onClick={prevTrack} className="btn btn-ghost btn-circle btn-sm">
            <SkipBack fill="currentColor" stroke="currentColor" size={16} />
          </button>

          <button onClick={togglePlay} className="btn btn-primary btn-circle btn-sm">
            {isPlaying ? (
              <Pause fill="currentColor" stroke="currentColor" size={16} />
            ) : (
              <Play fill="currentColor" stroke="currentColor" size={16} />
            )}
          </button>

          <button onClick={nextTrack} className="btn btn-ghost btn-circle btn-sm">
            <SkipForward fill="currentColor" stroke="currentColor" size={16} />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <Volume2 size={18} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="range range-xs range-base-content w-16"
          />
        </div>
      </div>
    </div>
  );
}
