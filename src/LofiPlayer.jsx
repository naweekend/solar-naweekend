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
  const discRef = useRef(null);

  const tracks = [1, 2, 3].map((n) => `${musicType}-${n}`);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;

    // Prevent NaN values from breaking progress
    if (!duration || isNaN(duration)) {
      setProgress(0);
      setTimeLeft("0:00");
      return;
    }

    setProgress(current / duration);

    const remaining = duration - current;
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60)
      .toString()
      .padStart(2, "0");
    setTimeLeft(`${minutes}:${seconds}`);
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current) return;
    const newProgress = parseFloat(e.target.value);
    audioRef.current.currentTime = newProgress * audioRef.current.duration;
    setProgress(newProgress);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleMusicTypeChange = (e) => {
    setMusicType(e.target.value);
    setCurrentTrack(0);
    setIsPlaying(true);
  };

  // Spin disc effect (optional)
  useEffect(() => {
    let animationFrame;
    const spin = () => {
      if (discRef.current && isPlaying) {
        const currentRotation = parseFloat(discRef.current.dataset.rotation || "0");
        const newRotation = currentRotation + 0.3;
        discRef.current.style.transform = `rotate(${newRotation}deg)`;
        discRef.current.dataset.rotation = newRotation;
      }
      animationFrame = requestAnimationFrame(spin);
    };
    spin();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  // Handle playback and track changes properly
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = volume;

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(() => { });
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.load();

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [musicType, currentTrack, isPlaying, volume]);

  return (
    <div className="fixed bottom-5 left-5 sm:w-96 w-[calc(100vw-2.5rem)] backdrop-blur-md rounded-xl p-4 flex flex-col gap-3 shadow-lg bg-base-200 text-base-content">
      {/* Audio */}
      <audio
        className="hidden"
        ref={audioRef}
        src={`/music/${tracks[currentTrack]}.mp3`}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      {/* Top bar: Type + Timer */}
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
        value={progress || 0}
        onChange={handleProgressChange}
        className="range range-xs range-primary w-full"
      />

      {/* Bottom Controls */}
      <div className="flex justify-between items-center w-full">
        {/* Left: Controls */}
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

        {/* Right: Volume */}
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
