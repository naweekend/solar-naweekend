import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

const tracks = ["lofi-1", "lofi-2", "lofi-3"]; // mp3 in /public/music

export default function LofiPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [timeLeft, setTimeLeft] = useState("0:00");
  const audioRef = useRef(null);
  const discRef = useRef(null);

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
    const duration = audioRef.current.duration || 0;
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

  // Spin disc effect
  useEffect(() => {
    let animationFrame;
    const spin = () => {
      if (discRef.current && isPlaying) {
        const currentRotation = parseFloat(discRef.current.dataset.rotation || "0");
        const newRotation = currentRotation + 0.3; // adjust speed here
        discRef.current.style.transform = `rotate(${newRotation}deg)`;
        discRef.current.dataset.rotation = newRotation;
      }
      animationFrame = requestAnimationFrame(spin);
    };
    spin();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    if (isPlaying) {
      audioRef.current.play().catch(() => { }); // suppress autoplay errors
    }
  }, [currentTrack, isPlaying, volume]);

  return (
    <div className="fixed bottom-5 left-5 sm:w-100 w-[calc(100vw-2.5rem)] backdrop-blur-md rounded-xl p-4 flex items-center shadow-lg flex-col gap-4 bg-base-200 text-base-content">
      <div className="flex justify-between w-full gap-10 items-center">
        <audio
          className="hidden"
          ref={audioRef}
          src={`/music/${tracks[currentTrack]}.mp3`}
          onTimeUpdate={handleTimeUpdate}
          onEnded={nextTrack}
        />

        {/* Controls */}
        <div className="flex items-center space-x-2 text-gray-100">
          <button onClick={prevTrack} className="btn btn-primary btn-ghost btn-circle btn-sm">
            <SkipBack fill="white" stroke="white" size={16} />
          </button>

          <button onClick={togglePlay} className="btn btn-primary btn-ghost btn-circle btn-sm">
            {isPlaying ? <Pause fill="white" stroke="white" size={16} /> : <Play fill="white" stroke="white" size={16} />}
          </button>

          <button onClick={nextTrack} className="btn btn-primary btn-ghost btn-circle btn-sm">
            <SkipForward fill="white" stroke="white" size={16} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center space-x-3">
          <Volume2 size={18} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="range range-xs range-base-content w-20"
          />
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-center w-full gap-3">
        <div>
          <img
            ref={discRef}
            width={30}
            height={30}
            src="/disc.png"
            alt="disc"
            data-rotation="0"
            className="transition-transform duration-100 ease-linear"
          />
        </div>
        <div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={handleProgressChange}
            className="range range-xs range-primary w-full"
          />
        </div>
        <div>
          <span className="text-sm">{timeLeft}</span>
        </div>
      </div>
    </div>
  );
}
