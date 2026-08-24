import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, RefreshCw, Eye, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// 16x16 Matrix Patterns (1 = colored pixel, 0 = transparent)
const PATTERNS = {
  // 1. Classic Units Smiley
  SMILE: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,1,1,0,0,0,0,1,1,0,0,1,0],
    [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
    [0,1,0,0,0,1,1,1,1,1,1,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  ],

  // 2. Playful Wink
  WINK: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,1,1,0,0,1,0],
    [1,0,0,1,1,1,1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
    [0,1,0,0,0,0,1,1,1,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  ],

  // 3. Cool 8-Bit Sunglasses
  COOL: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0],
    [1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1],
    [1,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
    [0,1,0,0,0,1,1,1,1,1,1,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  ],

  // 4. Snitch Architectural Starburst Monogram
  STAR: [
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0],
    [0,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0],
    [1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1],
    [1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1],
    [0,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0],
    [0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  ]
};

const PATTERN_KEYS = ["SMILE", "WINK", "COOL", "STAR"];

export default function PixelArtCanvas() {
  const [currentPatternKey, setCurrentPatternKey] = useState("SMILE");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const containerRef = useRef(null);

  // Auto Loop between Pixel Expressions
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => {
        setCurrentPatternKey((prev) => {
          const nextIdx = (PATTERN_KEYS.indexOf(prev) + 1) % PATTERN_KEYS.length;
          return PATTERN_KEYS[nextIdx];
        });
        setGlitchActive(false);
      }, 120);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Entrance Stagger Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pixel-box", {
        scale: 0,
        opacity: 0,
        stagger: {
          grid: [16, 16],
          from: "center",
          amount: 0.8
        },
        duration: 0.6,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });

      gsap.to(".floating-pixel", {
        y: -15,
        rotation: 12,
        stagger: 0.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Interactive Cursor Tracking
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    const xShift = Math.round(xRatio * 2);
    const yShift = Math.round(yRatio * 2);

    setCursorOffset({ x: xShift, y: yShift });
  };

  const handleMouseLeave = () => {
    setCursorOffset({ x: 0, y: 0 });
  };

  // Next Pattern on Click
  const handleFaceClick = () => {
    setGlitchActive(true);
    gsap.fromTo(
      ".pixel-grid",
      { scale: 0.88, rotate: -3 },
      { scale: 1, rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" }
    );

    setTimeout(() => {
      setCurrentPatternKey((prev) => {
        const nextIdx = (PATTERN_KEYS.indexOf(prev) + 1) % PATTERN_KEYS.length;
        return PATTERN_KEYS[nextIdx];
      });
      setGlitchActive(false);
    }, 80);
  };

  const currentPattern = PATTERNS[currentPatternKey];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-[#FFB800] p-4 sm:p-5 rounded-[32px] border-2 border-black shadow-[4px_4px_0px_#000000] relative select-none"
    >
      <div className="bg-[#FF3B30] rounded-[24px] border-2 border-black p-8 sm:p-14 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
        
        {/* Floating Ambient Retro Pixel Particles */}
        <div className="floating-pixel absolute top-6 left-8 text-white/40 font-mono text-xl font-black">✦</div>
        <div className="floating-pixel absolute bottom-8 left-12 text-[#C4A1FF]/50 font-mono text-2xl font-black">■</div>
        <div className="floating-pixel absolute top-10 right-10 text-[#FFD600]/40 font-mono text-lg font-black">▲</div>
        <div className="floating-pixel absolute bottom-12 right-14 text-white/50 font-mono text-xl font-black">✦</div>

        {/* Interactive Controls Pill Bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-full font-mono text-[10px] font-bold border-2 border-black shadow-[2px_2px_0px_#000000] transition-all flex items-center gap-1.5 ${
              isAutoPlaying ? "bg-[#00E676] text-black" : "bg-white text-black"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isAutoPlaying ? "LOOP: ON" : "LOOP: PAUSED"}</span>
          </button>

          <button
            onClick={handleFaceClick}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-black hover:text-white font-mono text-[10px] font-bold border-2 border-black shadow-[2px_2px_0px_#000000] transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>MORPH</span>
          </button>
        </div>

        {/* Dynamic 16x16 Pixel Matrix Grid */}
        <div
          onClick={handleFaceClick}
          className={`pixel-grid cursor-pointer my-2 p-3 rounded-2xl transition-all duration-150 relative group ${
            glitchActive ? "scale-95 opacity-80 filter blur-[0.5px]" : "scale-100"
          }`}
          title="Click to morph pixel expression!"
        >
          <div
            className="grid grid-cols-16 gap-[3px] sm:gap-[4px] w-48 h-48 sm:w-60 sm:h-60"
            style={{
              gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
              transform: `translate(${cursorOffset.x * 2}px, ${cursorOffset.y * 2}px)`
            }}
          >
            {currentPattern.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const isActive = val === 1;
                // Add eye pupils tracking offset
                const isEyeRegion =
                  (rIdx === 5 || rIdx === 6) && ((cIdx >= 4 && cIdx <= 5) || (cIdx >= 10 && cIdx <= 11));

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`pixel-box w-full h-full rounded-[1px] transition-all duration-75 ${
                      isActive
                        ? "bg-[#C4A1FF] border-[0.5px] border-black shadow-[1px_1px_0px_#000000]"
                        : "bg-transparent"
                    } ${isEyeRegion && isActive ? "group-hover:bg-[#FFD600]" : ""}`}
                    style={{
                      transform: isEyeRegion ? `translate(${cursorOffset.x}px, ${cursorOffset.y}px)` : "none"
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Click Hint Overlay */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold border border-white whitespace-nowrap shadow-md">
            CLICK TO MORPH [{currentPatternKey}]
          </div>
        </div>

        {/* Section Headline */}
        <h2 className="font-heading font-black text-4xl sm:text-7xl tracking-tighter text-black uppercase mt-4 hover:scale-[1.02] transition-transform">
          How we think
        </h2>

        {/* Subtext */}
        <p className="font-mono font-bold text-xs sm:text-base text-white mt-2 max-w-lg leading-relaxed">
          Creating radical spaces and authentic artifacts for independent student living and creators.
        </p>

      </div>
    </div>
  );
}
