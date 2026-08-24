import { useEffect, useState } from "react";
import gsap from "gsap";

export default function BuyerLoader({ onComplete, duration = 1.8 }) {
  const [progress, setProgress] = useState(0);
  const [tickerText, setTickerText] = useState("INITIALIZING SNITCH MESH");

  const phrases = [
    "INITIALIZING SNITCH MESH",
    "CURATING ARCHITECTURAL UNITS",
    "CALIBRATING KEYLESS SMART ACCESS",
    "VERIFYING RESIDENT PROTOCOL",
    "WELCOME TO SNITCH"
  ];

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      if (currentProgress > 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setProgress(currentProgress);

      const phraseIdx = Math.min(
        Math.floor((currentProgress / 100) * phrases.length),
        phrases.length - 1
      );
      setTickerText(phrases[phraseIdx]);
    }, (duration * 1000) / 50);

    const tl = gsap.timeline({
      delay: duration,
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Awwwards multi-colored curtain slide-up reveal
    tl.to(".buyer-loader-content", {
      y: -40,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in"
    })
      .to(".curtain-1", { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.1")
      .to(".curtain-2", { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.45")
      .to(".curtain-3", { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.45")
      .to(".curtain-main", { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, "-=0.45");

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden">
      
      {/* Layered Multi-Colored Sliding Curtains */}
      <div className="curtain-1 absolute inset-0 bg-[#FF5500] z-10" />
      <div className="curtain-2 absolute inset-0 bg-[#FFD600] z-20" />
      <div className="curtain-3 absolute inset-0 bg-[#1677FF] z-30" />
      <div className="curtain-main absolute inset-0 bg-[#F5EBE6] z-40 flex flex-col justify-between p-6 sm:p-12">
        
        {/* Top Header */}
        <div className="buyer-loader-content flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="font-heading font-black text-3xl sm:text-4xl text-black">
              snitch<span className="text-[#FF5500]">.</span>
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-black/70 ml-2 uppercase">
              STOREFRONT SYSTEM
            </span>
          </div>

          <div className="bg-black text-[#00E676] px-3.5 py-1.5 rounded-full font-mono text-xs font-bold border border-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            <span>ONLINE</span>
          </div>
        </div>

        {/* Center Pixel Art & Counter Animation */}
        <div className="buyer-loader-content my-auto flex flex-col items-center text-center max-w-lg mx-auto">
          
          {/* Retro Pixel Smiley Icon */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 bg-[#C4A1FF] border-2 border-black rounded-[28px] shadow-[4px_4px_0px_#000000] p-4 flex items-center justify-center animate-bounce">
            <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2h10v2H7V2zM5 4h2v2H5V4zM17 4h2v2h-2V4zM3 6h2v4H3V6zM19 6h2v4h-2V6zM1 10h2v4H1v-4zM21 10h2v4h-2v-4zM3 14h2v4H3v-4zM19 14h2v4h-2v-4zM5 18h2v2H5v-2zM17 18h2v2h-2v-2zM7 20h10v2H7v-2zM7 8h2v2H7V8zM15 8h2v2h-2V8zM7 14h2v2H7v-2zM9 16h6v2H9v-2zM15 14h2v2h-2v-2z" />
            </svg>
          </div>

          {/* Chunky Counter */}
          <div className="font-heading font-black text-6xl sm:text-8xl text-black tracking-tighter mb-2">
            {progress < 10 ? `0${progress}` : progress}
            <span className="text-[#FF5500] text-4xl sm:text-6xl font-black">%</span>
          </div>

          {/* Progress Bar Bento */}
          <div className="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden p-0.5 shadow-[2px_2px_0px_#000000] mb-4">
            <div
              className="h-full bg-[#FF5500] rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtext Ticker */}
          <div className="px-4 py-1.5 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_#000000] font-mono font-bold text-xs text-black uppercase tracking-wider">
            {tickerText}
          </div>
        </div>

        {/* Footer */}
        <div className="buyer-loader-content flex items-center justify-between text-xs font-mono font-bold text-black/70">
          <span>CURATED ARCHITECTURAL LIVING</span>
          <span>© 2026 SNITCH PROTOCOL</span>
        </div>

      </div>
    </div>
  );
}
