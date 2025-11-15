import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, NotebookPen } from "lucide-react";

const MUSIC_TYPES = ["🎧 lofi", "🎷 classical", "🎙️ urdu", "🎻 english"];
const MUSIC_TRACK_COUNTS = {
  lofi: 3,
  classical: 3,
  urdu: 4,
  english: 3,
};

export function AudioVisualizer({ audioRef, isPlaying }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audio = audioRef.current;
    const ctx = audioCtxRef.current;

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 128;
    }

    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    }

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      const barCount = 12;
      const barWidth = width / barCount;
      const gradient = c.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#605DFF");
      gradient.addColorStop(1, "#FB322B");

      c.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight = (dataArray[dataIndex] / 255) * height * 0.9;

        const x = i * barWidth;
        const blockHeight = 4;
        const blockGap = 1;
        const numBlocks = Math.floor(barHeight / (blockHeight + blockGap));

        for (let j = 0; j < numBlocks; j++) {
          const blockY = height - (j + 1) * (blockHeight + blockGap);
          c.fillStyle = gradient;
          c.fillRect(x + 1, blockY, barWidth - 2, blockHeight);
        }
      }
    };

    if (isPlaying) ctx.resume();
    draw();
  }, [audioRef, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={60}
      className="opacity-90"
    />
  );
}

// ------------------------------
// Pomodoro Timer Component 🍅
// ------------------------------
export function PomodoroTimer() {
  const DURATIONS = {
    "25 mins": 25 * 60,
    "50 mins": 50 * 60,
    "90 mins": 90 * 60,
  };

  const [selectedDuration, setSelectedDuration] = useState("50 mins");
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS["50 mins"]);
  const [isRunning, setIsRunning] = useState(false);

  // Countdown logicPomodor
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Save progress
  useEffect(() => {
    localStorage.setItem("pomodoro_secondsLeft", secondsLeft);
    localStorage.setItem("pomodoro_selectedDuration", selectedDuration);
  }, [secondsLeft, selectedDuration]);

  // Load saved values
  useEffect(() => {
    const savedSeconds = localStorage.getItem("pomodoro_secondsLeft");
    const savedDuration = localStorage.getItem("pomodoro_selectedDuration");
    if (savedSeconds && savedDuration) {
      setSecondsLeft(Number(savedSeconds));
      setSelectedDuration(savedDuration);
    }
  }, []);


  // Convert seconds to mm:ss
  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const totalTime = DURATIONS[selectedDuration];
  const progress = (secondsLeft / totalTime) * 100;

  useEffect(() => {
    console.log(progress)
  }, [progress])

  // Handle duration change
  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    setSelectedDuration(newDuration);
    setIsRunning(false);
    setSecondsLeft(DURATIONS[newDuration]);
  };

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      // Stop the timer
      setIsRunning(false);

      // Show alert
      alert("⏰ Time's up!");

      // Optionally, you can play a sound or do other actions here
    }
  }, [secondsLeft, isRunning]);


  return (
    <div className="flex items-center w-full justify-center gap-5 mt-1">
      {/* Circular progress */}
      <div className="relative">
        <div
          className="radial-progress text-primary transition-all duration-500"
          style={{
            "--value": progress,
            "--size": "5rem",
            "--thickness": "6px",
          }}
          role="progressbar"
        >
          <span className="text-lg font-semibold tabular-nums">
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        {/* Duration Selector */}
        <select
          className="select select-bordered select-sm w-37 mb-1"
          value={selectedDuration}
          onChange={handleDurationChange}
          disabled={isRunning} // prevent changing mid-session
        >
          {Object.keys(DURATIONS).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
        {/* Controls */}
        <div className="flex gap-1">
          <button
            className="btn bg-[#FF2A23] text-white btn-sm w-18"
            onClick={() => setIsRunning((r) => !r)}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            className="btn bg-base-300 w-18 btn-sm"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(totalTime);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------
// Main Lofi Player Component 🎧
// ------------------------------
export default function LofiPlayer() {
  const [tab, setTab] = useState("music");
  const [musicType, setMusicType] = useState("urdu");
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [timeLeft, setTimeLeft] = useState("0:00");

  const audioRef = useRef(null);
  const isSeeking = useRef(false);
  const wasPlayingBeforeSeek = useRef(false);

  const tracks = Array.from(
    { length: MUSIC_TRACK_COUNTS[musicType] || 3 }, // fallback to 3 if type is not defined
    (_, i) => `${musicType}-${i + 1}`
  );

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

  const nextTrack = () => setCurrentTrack((p) => (p + 1) % tracks.length);
  const prevTrack = () => setCurrentTrack((p) => (p - 1 + tracks.length) % tracks.length);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isSeeking.current) return;
    const current = audio.currentTime;
    const duration = audio.duration;
    if (!duration || isNaN(duration)) return;

    setProgress(current / duration);
    const remaining = Math.max(duration - current, 0);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60).toString().padStart(2, "0");
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
  const handleSeekChange = (e) => setProgress(parseFloat(e.target.value));
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };
  const handleMusicTypeChange = (e) => {
    setMusicType(e.target.value);
    setCurrentTrack(0);
  };

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
    return () => audio.removeEventListener("canplaythrough", handleCanPlay);
  }, [musicType, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => { });
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="fixed bottom-5 left-5 sm:w-96 w-[calc(100vw-2.5rem)] backdrop-blur-md rounded-xl p-3 flex flex-col gap-3 shadow-lg bg-base-200 text-base-content h-40">
      {/* Tabs */}
      <div role="tablist" className="tabs tabs-box tabs-xs w-full">
        <a
          role="tab"
          className={`tab ${tab === "music" ? "tab-active" : ""} flex gap-1`}
          onClick={() => setTab("music")}
        >
          <Music size={13} /> <span>Music</span>
        </a>
        <a
          role="tab"
          className={`tab ${tab === "timer" ? "tab-active" : ""}`}
          onClick={() => setTab("timer")}
        >
          🍅 Timer
        </a>
        <a
          role="tab"
          className={`tab ${tab === "notes" ? "tab-active" : ""} flex gap-1`}
          onClick={() => setTab("notes")}
        >
          <NotebookPen size={13} /> <span>Notes</span>
        </a>
      </div>

      <div className="relative w-full h-full">
        {/* Music tab — hidden when not active */}
        <div className={`${tab === "music" ? "block" : "hidden"} w-full flex px-2 flex-col gap-2.5`}>
          <audio
            ref={audioRef}
            src={`/music/${tracks[currentTrack]}.mp3`}
            onTimeUpdate={handleTimeUpdate}
            onEnded={nextTrack}
          />

          {/* Top bar */}
          <div className="flex justify-between items-center w-full relative">
            <select
              className="select bg-base-200 select-xs max-w-24 px-0 border-0 outline-0 font-medium"
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
            <div className="fixed -right-6 top-3 overflow-x-hidden">
              <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center w-full gap-3.5">
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
              className="range range-xs range-primary"
            />
            <span className="text-xs opacity-80 w-6 text-right">{timeLeft}</span>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-1">
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

        {/* Timer tab — hidden when not active */}
        <div className={`${tab === "timer" ? "flex" : "hidden"} justify-center`}>
          <PomodoroTimer />
        </div>


        {/* Todo List tab — hidden when not active */}
        <div className={`${tab === "notes" ? "flex" : "hidden"} justify-center`}>
          <NotesSection />
        </div>
      </div>
    </div>
  );
}

export function NotesSection() {
  // Load from localStorage or start empty
  const [content, setContent] = useState(() => {
    return localStorage.getItem("notesContent") || "";
  });

  // Auto-save to localStorage on change
  useEffect(() => {
    localStorage.setItem("notesContent", content);
  }, [content]);

  return (
    <div className="w-full h-22">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes here..."
        className="w-full h-full p-2 text-sm text-base-content resize-none wrap-break-word whitespace-pre-wrap outline-none"
      />
    </div>
  );
}


