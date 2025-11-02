import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from "lucide-react";

const tracks = ["lofi-1", "lofi-2"]; // mp3 in /public/music

export default function LofiPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true); // autoplay
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true); // autoplay
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime / audioRef.current.duration);
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

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    if (isPlaying) {
      audioRef.current
        .play()
        .catch(() => { }); // suppress promise error if autoplay blocked
    }
  }, [currentTrack, isPlaying, volume]);

  return (
    <div className="fixed bottom-5 left-5 sm:w-100 w-[calc(100vw-2.5rem)] backdrop-blur-md rounded-xl p-4 flex items-center shadow-lg flex-col gap-4 bg-base-200 text-base-content">
      <div className="flex justify-between w-full gap-10 items-center">
        {/* Audio Element */}
        <audio
          className="hidden"
          ref={audioRef}
          src={`/music/${tracks[currentTrack]}.mp3`}
          onTimeUpdate={handleTimeUpdate}
          onEnded={nextTrack} // autoplay next track when finished
        />

        {/* Controls */}
        <div className="flex items-center space-x-2 text-gray-100">
          {/* PREVIOUS */}
          <button
            onClick={prevTrack}
            className="btn btn-primary btn-circle btn-sm"
          >
            <SkipBack fill="white" storke="white" size={16} />
          </button>

          {/* PLAY / PAUSE */}
          <button
            onClick={togglePlay}
            className="btn btn-primary btn-circle btn-sm"
          >
            {isPlaying ? (
              <Pause fill="white" stroke="white" size={16} />
            ) : (
              <Play fill="white" stroke="white" size={16} />
            )}
          </button>

          {/* NEXT */}
          <button
            onClick={nextTrack}
            className="btn btn-primary btn-circle btn-sm"
          >
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

      {/* Progress */}
      <div className="flex items-center w-full space-x-3">
        <Music />
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={handleProgressChange}
          className="range range-sm range-primary w-full"
        />
      </div>
    </div>
  );
}
