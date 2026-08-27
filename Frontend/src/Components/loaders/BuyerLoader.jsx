import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Sparkles, Heart } from "lucide-react";

// 12x12 Cozy Pixel Art Matrices
// 0: transparent, 1: black outline/feature, 2: warm highlight/skin, 3: blush peach, 4: eye sparkle
const COZY_PIXEL_FRAMES = {
  SMILE: [
    [0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [1,2,2,1,1,2,2,1,1,2,2,1],
    [1,2,2,1,4,2,2,1,4,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,3,3,2,1,1,2,3,3,2,1],
    [1,2,3,3,1,2,2,1,3,3,2,1],
    [0,1,2,2,2,1,1,2,2,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [0,0,1,2,2,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0],
  ],
  WINK: [
    [0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [1,2,1,1,1,2,2,1,1,2,2,1],
    [1,2,2,2,2,2,2,1,4,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,3,3,2,1,1,2,3,3,2,1],
    [1,2,3,3,1,2,2,1,3,3,2,1],
    [0,1,2,2,2,1,1,2,2,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [0,0,1,2,2,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0],
  ],
  HAPPY_SLEEP: [
    [0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [1,2,1,2,1,2,2,1,2,1,2,1],
    [1,2,2,1,2,2,2,2,1,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,3,3,2,1,1,2,3,3,2,1],
    [1,2,3,3,1,2,2,1,3,3,2,1],
    [0,1,2,2,2,1,1,2,2,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [0,0,1,2,2,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0],
  ]
};

const COZY_PHRASES = [
  "warming up the loft...",
  "brewing fresh pixels...",
  "fluffing the pillows...",
  "welcome home."
];

export default function BuyerLoader({ onComplete, duration = 0.85 }) {
  // Enforce a snappy duration so it never feels lengthy
  const effectiveDuration = Math.min(Math.max(duration, 0.6), 1.0);
  const [progress, setProgress] = useState(0);
  const [frameKey, setFrameKey] = useState("SMILE");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isWinking, setIsWinking] = useState(false);
  const loaderRef = useRef(null);

  // Chunky 10-step progress calculation (0 to 10 blocks)
  const totalBlocks = 10;
  const activeBlocks = Math.min(totalBlocks, Math.ceil((progress / 100) * totalBlocks));

  useEffect(() => {
    let currentVal = 0;
    const stepTime = (effectiveDuration * 1000) / 20;

    const interval = setInterval(() => {
      currentVal += 5;
      if (currentVal >= 100) {
        currentVal = 100;
        clearInterval(interval);
      }
      setProgress(currentVal);

      // Rotate cozy phrase based on progress
      const pIdx = Math.min(
        Math.floor((currentVal / 100) * COZY_PHRASES.length),
        COZY_PHRASES.length - 1
      );
      setPhraseIdx(pIdx);

      // Cute expression transitions
      if (currentVal > 30 && currentVal < 70) {
        setFrameKey("WINK");
      } else if (currentVal >= 70) {
        setFrameKey("HAPPY_SLEEP");
      } else {
        setFrameKey("SMILE");
      }
    }, stepTime);

    // Fast, delightful GSAP exit animation
    const tl = gsap.timeline({
      delay: effectiveDuration,
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    tl.to(".cozy-loader-card", {
      scale: 1.04,
      duration: 0.12,
      ease: "power1.out"
    })
      .to(".cozy-loader-card", {
        scale: 0.88,
        opacity: 0,
        y: -20,
        duration: 0.22,
        ease: "power2.in"
      })
      .to(loaderRef.current, {
        opacity: 0,
        duration: 0.18,
        ease: "power1.inOut"
      }, "-=0.1");

    return () => clearInterval(interval);
  }, [effectiveDuration, onComplete]);

  const handleMascotClick = () => {
    setIsWinking(true);
    setFrameKey("WINK");
    setTimeout(() => {
      setIsWinking(false);
      setFrameKey("SMILE");
    }, 400);
  };

  const currentMatrix = COZY_PIXEL_FRAMES[frameKey] || COZY_PIXEL_FRAMES.SMILE;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center bg-[#F5EBE6]/90 backdrop-blur-md p-4 select-none overflow-hidden"
    >
      {/* Floating Cozy Ambient Pixel Confetti */}
      <div className="absolute top-12 left-12 text-[#FF5500]/30 font-mono text-2xl font-black animate-pulse">✦</div>
      <div className="absolute top-20 right-16 text-[#FFD600]/40 font-mono text-3xl font-black animate-bounce">■</div>
      <div className="absolute bottom-16 left-16 text-[#C4A1FF]/40 font-mono text-2xl font-black animate-bounce">▲</div>
      <div className="absolute bottom-12 right-12 text-[#00C853]/30 font-mono text-3xl font-black animate-pulse">✦</div>

      {/* Main Cozy Pixel Bento Box */}
      <div className="cozy-loader-card w-full max-w-sm bg-[#FAF5EE] border-3 border-black rounded-[32px] p-6 sm:p-7 shadow-[6px_6px_0px_#000000] flex flex-col items-center text-center relative">
        
        {/* Top Header Pill Row */}
        <div className="w-full flex items-center justify-between pb-3.5 mb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#FF5500] rounded-sm border border-black" />
            <span className="font-heading font-black text-base text-black tracking-tight">
              snitch<span className="text-[#FF5500]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFD600] border-2 border-black px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black shadow-[1.5px_1.5px_0px_#000000]">
            <Sparkles className="w-3 h-3 text-black" />
            <span>COZY RESIDENT</span>
          </div>
        </div>

        {/* Mascot Container with Pixel Art Grid */}
        <div
          onClick={handleMascotClick}
          className="relative group cursor-pointer my-2 p-3 bg-[#C4A1FF] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] hover:scale-105 active:scale-95 transition-transform"
          title="Click to say hello!"
        >
          {/* Animated Steam / Heart above */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-90 animate-bounce">
            <span className="text-[10px] text-[#FF5500] font-black">♥</span>
          </div>

          {/* 12x12 Pixel Grid Matrix */}
          <div
            className="grid grid-cols-12 gap-[2px] w-28 h-28 sm:w-32 sm:h-32"
            style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
          >
            {currentMatrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                let cellClass = "bg-transparent";
                if (val === 1) cellClass = "bg-black border-[0.5px] border-black/40";
                if (val === 2) cellClass = "bg-[#FFF9E6]";
                if (val === 3) cellClass = "bg-[#FF8A80]";
                if (val === 4) cellClass = "bg-white";

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-full h-full rounded-[1px] ${cellClass}`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Pixel Percentage Counter */}
        <div className="font-heading font-black text-4xl sm:text-5xl text-black tracking-tight mt-3 mb-1 flex items-baseline justify-center gap-0.5">
          <span>{progress < 10 ? `0${progress}` : progress}</span>
          <span className="text-[#FF5500] text-2xl font-black font-mono">%</span>
        </div>

        {/* Pixelated Stepped Progress Bar */}
        <div className="w-full mt-2 mb-3">
          <div className="flex gap-1.5 justify-between bg-white border-2 border-black rounded-xl p-1.5 shadow-[2px_2px_0px_#000000]">
            {Array.from({ length: totalBlocks }).map((_, idx) => {
              const isFilled = idx < activeBlocks;
              return (
                <div
                  key={idx}
                  className={`flex-1 h-3 rounded-[3px] border border-black/40 transition-all duration-100 ${
                    isFilled
                      ? "bg-[#00C853] shadow-[1px_1px_0px_#000000]"
                      : "bg-[#F0EBE1]"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Cozy Status Micro-Copy */}
        <div className="font-mono font-bold text-xs text-black/80 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-ping" />
          <span className="lowercase">{COZY_PHRASES[phraseIdx]}</span>
        </div>

      </div>
    </div>
  );
}
