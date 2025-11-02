import { Maximize, Minimize } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function FullScreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Failed to enter fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  return (
    <button
      onClick={toggleFullscreen}
      className="active:scale-95 cursor-pointer transition-all duration-250"
    >
      {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
    </button>
  );
}
