import { motion } from "framer-motion";
import { Wallet, Zap, ChevronRight, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onConnectWallet: () => void;
  onDemoMode: () => void;
  connecting: boolean;
}

export default function LandingPage({ onConnectWallet, onDemoMode, connecting }: LandingPageProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/group.jpg)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-sm bg-[#F0B90B] flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <span className="text-[#F0B90B]/60 font-mono text-sm tracking-widest uppercase">
            BNB Chain
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white text-center mb-4 tracking-tight"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          MY AI{" "}
          <span className="text-[#F0B90B]">PET</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/50 font-mono text-sm md:text-base text-center max-w-md mb-2 tracking-wide"
        >
          Own. Awaken. Interact.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-white/30 font-mono text-xs text-center max-w-lg mb-12"
        >
          NFT pets powered by AI on BNB Chain. Each pet has a unique crypto
          personality. Connect your wallet to begin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col items-center gap-4"
        >
          <Button
            data-testid="button-connect-wallet"
            onClick={onConnectWallet}
            disabled={connecting}
            className="relative group bg-[#F0B90B] text-black font-bold text-lg px-10 py-6 rounded-sm border-2 border-[#F0B90B] no-default-hover-elevate no-default-active-elevate"
            style={{ minHeight: "auto" }}
          >
            <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: "0 0 30px rgba(240,185,11,0.4), inset 0 0 30px rgba(240,185,11,0.1)" }}
            />
            <span className="relative flex items-center gap-3">
              {connecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
              {connecting ? "CONNECTING..." : "CONNECT WALLET (BNB Chain)"}
              {!connecting && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
          </Button>

          <Button
            data-testid="button-demo-mode"
            onClick={onDemoMode}
            disabled={connecting}
            variant="outline"
            className="text-white/50 border-white/15 rounded-sm font-mono text-sm px-8 py-4 no-default-hover-elevate no-default-active-elevate hover:border-[#F0B90B]/30 hover:text-[#F0B90B]/60 transition-colors"
            style={{ minHeight: "auto" }}
          >
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              TRY DEMO MODE (No Gas)
            </span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <span className="text-white/20 font-mono text-[10px] tracking-widest uppercase">
            Contract
          </span>
          <span className="text-white/30 font-mono text-[10px]">
            0x8019919bAd00C6Fd5b98817f854e2C8824334FAf
          </span>
        </motion.div>
      </div>
    </div>
  );
}
