import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

type PetMood = "idle" | "talking" | "excited" | "thinking";

interface PetCompanionProps {
  petId: number;
  petImage: string;
  mood?: PetMood;
  companionVideo?: string;
}

export default function PetCompanion({
  petId,
  petImage,
  mood = "idle",
  companionVideo,
}: PetCompanionProps) {
  const controls = useAnimation();
  const [showSpeechPulse, setShowSpeechPulse] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mood === "talking") {
      setShowSpeechPulse(true);
      controls.start({
        y: [0, -6, 0, -3, 0],
        rotate: [0, -3, 3, -2, 0],
        scale: [1, 1.05, 1, 1.03, 1],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
      });
    } else if (mood === "thinking") {
      setShowSpeechPulse(false);
      controls.start({
        y: [0, -4, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 0.97, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      });
    } else if (mood === "excited") {
      setShowSpeechPulse(true);
      controls.start({
        y: [0, -14, 0, -10, 0, -6, 0],
        rotate: [0, -6, 6, -4, 4, -2, 0],
        scale: [1, 1.1, 0.95, 1.08, 0.97, 1.04, 1],
        transition: { duration: 0.8, repeat: 2, ease: "easeOut" },
      });
      setTimeout(() => {
        setShowSpeechPulse(false);
        controls.start({
          y: [0, -3, 0],
          rotate: [0, 1, -1, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        });
      }, 2400);
    } else if (mood === "idle") {
      setShowSpeechPulse(false);
      controls.start({
        y: [0, -5, 0],
        rotate: [0, 1, -1, 0],
        scale: [1, 1.01, 1],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      });
    }
  }, [mood, controls]);

  const hasVideo = !!companionVideo;


  return (
    <div className="relative" data-testid={`pet-companion-${petId}`}>
      <div className="absolute -inset-3 rounded-full bg-[#F0B90B]/10 blur-xl animate-pulse pointer-events-none" />

      {showSpeechPulse && (
        <>
          <div className="absolute -inset-2 rounded-full border border-[#F0B90B]/30 animate-ping pointer-events-none" />
          <div className="absolute -inset-4 rounded-full border border-[#F0B90B]/15 animate-ping pointer-events-none" style={{ animationDelay: "300ms" }} />
        </>
      )}

      <motion.div
        animate={controls}
        className="relative w-28 h-28 sm:w-32 sm:h-32 cursor-pointer"
        whileTap={{ scale: 0.9, rotate: -10 }}
        drag
        dragConstraints={{ top: -50, bottom: 50, left: -50, right: 50 }}
        dragElastic={0.3}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 15 }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#F0B90B]/40 shadow-lg shadow-[#F0B90B]/20 relative">
          {hasVideo ? (
            <video
              ref={videoRef}
              src={companionVideo}
              poster={petImage}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover scale-125"
              data-testid="video-pet-companion"
            />
          ) : (
            <img
              src={petImage}
              alt="Pet companion"
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" style={{ zIndex: 3 }} />
        </div>

        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black/50 flex items-center justify-center"
          style={{
            zIndex: 4,
            backgroundColor:
              mood === "talking"
                ? "#22c55e"
                : mood === "thinking"
                  ? "#F0B90B"
                  : mood === "excited"
                    ? "#ef4444"
                    : "#22c55e",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor:
                mood === "talking"
                  ? "#4ade80"
                  : mood === "thinking"
                    ? "#fcd34d"
                    : mood === "excited"
                      ? "#f87171"
                      : "#4ade80",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
