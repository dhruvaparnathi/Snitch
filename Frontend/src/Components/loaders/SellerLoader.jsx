import { useEffect, useState } from "react";
import gsap from "gsap";
import { ShieldCheck, Cpu, Terminal, Sparkles, CheckCircle2 } from "lucide-react";

export default function SellerLoader({ onComplete, duration = 1.6, subtitle = "SELLER TERMINAL GATEWAY" }) {
  const [step, setStep] = useState(0);

  const logs = [
    "INITIALIZING MERCHANT CORE...",
    "INDEXING REVENUE TELEMETRY...",
    "CALIBRATING MULTI-CURRENCY ENGINE...",
    "CONNECTING PRODUCT MESH NETWORK...",
    "MERCHANT STUDIO READY"
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep < logs.length) {
        setStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, (duration * 1000) / logs.length);

    const tl = gsap.timeline({
      delay: duration,
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    tl.to(".seller-loader-window", {
      scale: 0.95,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in"
    })
      .to(".seller-curtain-top", { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.1")
      .to(".seller-curtain-bot", { yPercent: 100, duration: 0.6, ease: "power4.inOut" }, "<");

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden">
      
      {/* Top and Bottom Splitting Industrial Shutters */}
      <div className="seller-curtain-top absolute top-0 left-0 right-0 h-1/2 bg-[#FF5500] border-b-4 border-black z-10 flex items-end justify-center pb-4">
        <div className="font-heading font-black text-black text-xs tracking-widest uppercase opacity-40">
          SNITCH MERCHANT PROTOCOL // TOP SHUTTER
        </div>
      </div>
      <div className="seller-curtain-bot absolute bottom-0 left-0 right-0 h-1/2 bg-[#FFD600] border-t-4 border-black z-10 flex items-start justify-center pt-4">
        <div className="font-heading font-black text-black text-xs tracking-widest uppercase opacity-40">
          SNITCH MERCHANT PROTOCOL // BOTTOM SHUTTER
        </div>
      </div>

      {/* Main Terminal Window Box */}
      <div className="seller-loader-window relative z-30 w-full max-w-lg mx-4 bg-black text-white border-4 border-black rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_#000000]">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-white/20 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF3B30] border border-black" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFD600] border border-black" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#00C853] border border-black" />
            <span className="font-mono text-xs font-bold text-white/70 ml-2 uppercase tracking-wider">
              {subtitle}
            </span>
          </div>

          <span className="font-mono text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded border border-[#00E676]/30">
            ROOT: ACTIVE
          </span>
        </div>

        {/* Brand Badge */}
        <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div>
            <h2 className="font-heading font-black text-2xl text-white flex items-baseline">
              snitch<span className="text-[#FF5500]">.</span> studio
            </h2>
            <p className="text-[10px] font-mono font-bold text-white/50 uppercase">
              HIGH VELOCITY COMMERCE ENGINE
            </p>
          </div>
          <Cpu className="w-8 h-8 text-[#FFD600] animate-pulse" />
        </div>

        {/* Step-by-Step Diagnostic Logs */}
        <div className="space-y-2.5 font-mono text-xs mb-6">
          {logs.map((log, idx) => {
            const isDone = idx < step;
            const isCurrent = idx === step;
            if (idx > step) return null;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-[#FF5500]/20 border-[#FF5500] text-[#FF5500] font-black"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#00E676]">&gt;</span>
                  <span>{log}</span>
                </div>
                {isDone && <CheckCircle2 className="w-4 h-4 text-[#00E676]" />}
                {isCurrent && <span className="w-2 h-4 bg-[#FF5500] animate-pulse" />}
              </div>
            );
          })}
        </div>

        {/* Matrix Strip Progress */}
        <div className="flex items-center justify-between text-xs font-mono font-bold text-white/60 mb-2">
          <span>SYSTEM READY</span>
          <span className="text-[#00E676] font-black">{Math.round(((step + 1) / logs.length) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/20 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#FF5500] via-[#FFD600] to-[#00C853] rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / logs.length) * 100}%` }}
          />
        </div>

      </div>

    </div>
  );
}
