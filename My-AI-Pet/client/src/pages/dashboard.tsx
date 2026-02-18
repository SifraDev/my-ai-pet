import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PETS, type Pet } from "@/data/pets";

interface DashboardProps {
  ownedPets: number[];
  onWakeUp: (petId: number) => void;
  onMint: (petId: number) => void;
  onDisconnect: () => void;
  isDemoMode: boolean;
  walletAddress: string | null;
}

function PetCard({
  pet,
  owned,
  onWakeUp,
  onMint,
  index,
}: {
  pet: Pet;
  owned: boolean;
  onWakeUp: () => void;
  onMint: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative group rounded-sm overflow-visible border ${
        owned
          ? "border-[#F0B90B]/40"
          : "border-white/5"
      } bg-[#1E2026] flex flex-col`}
      style={
        owned
          ? { boxShadow: "0 0 20px rgba(240,185,11,0.15), 0 0 60px rgba(240,185,11,0.05)" }
          : {}
      }
    >
      <div className="relative aspect-square overflow-hidden bg-black">
        <img
          src={pet.image}
          alt={pet.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            owned ? "opacity-100 scale-100" : "opacity-40 grayscale scale-105"
          }`}
          data-testid={`img-pet-${pet.id}`}
        />

        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="w-8 h-8 text-white/20" />
          </div>
        )}

        {owned && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 bg-[#F0B90B]/20 backdrop-blur-sm border border-[#F0B90B]/30 rounded-sm px-2 py-1">
              <Sparkles className="w-3 h-3 text-[#F0B90B]" />
              <span className="text-[#F0B90B] font-mono text-[10px] font-bold tracking-wider">
                OWNED
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="text-white/20 font-mono text-[10px] bg-black/50 px-2 py-1 rounded-sm">
            #{pet.id}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3
            className={`font-bold text-sm tracking-wide ${
              owned ? "text-[#F0B90B]" : "text-white/40"
            }`}
            data-testid={`text-pet-name-${pet.id}`}
          >
            {pet.name}
          </h3>
          <p className="text-white/30 font-mono text-[10px] mt-1 uppercase tracking-wider">
            {pet.species}
          </p>
        </div>

        <p className="text-white/25 text-xs leading-relaxed line-clamp-2 flex-1">
          {pet.uiDescription}
        </p>

        <div className="mt-auto">
          {owned ? (
            <Button
              data-testid={`button-wakeup-${pet.id}`}
              onClick={onWakeUp}
              className="w-full bg-[#F0B90B] text-black font-bold text-xs rounded-sm border border-[#F0B90B] no-default-hover-elevate no-default-active-elevate relative group/btn"
            >
              <span className="absolute inset-0 rounded-sm opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 20px rgba(240,185,11,0.3)" }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                WAKE UP
              </span>
            </Button>
          ) : (
            <Button
              data-testid={`button-mint-${pet.id}`}
              onClick={onMint}
              variant="outline"
              className="w-full text-white/40 border-white/10 rounded-sm font-mono text-xs no-default-hover-elevate no-default-active-elevate hover:border-[#F0B90B]/30 hover:text-[#F0B90B]/60 transition-colors"
            >
              <Lock className="w-3 h-3 mr-2" />
              MINT (Buy)
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard({
  ownedPets,
  onWakeUp,
  onMint,
  onDisconnect,
  isDemoMode,
  walletAddress,
}: DashboardProps) {
  const CONTRACT_SHORT = "0x80...FAf";
  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F0B90B]/20 to-transparent" />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#F0B90B] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            MY AI PET
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#F0B90B]/50 font-mono text-[10px] tracking-wider hidden sm:block">
            {isDemoMode ? "DEMO MODE" : `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`}
          </span>
          <Button
            data-testid="button-disconnect"
            onClick={onDisconnect}
            variant="outline"
            className="text-white/40 border-white/10 rounded-sm font-mono text-[10px] no-default-hover-elevate no-default-active-elevate hover:border-[#F0B90B]/30 hover:text-[#F0B90B]/60 transition-colors"
            size="sm"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            DISCONNECT
          </Button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
            Your <span className="text-[#F0B90B]">Pets</span>
          </h2>
          <p className="text-white/30 font-mono text-xs tracking-wide">
            {ownedPets.length} / {PETS.length} COLLECTED
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PETS.map((pet, index) => (
            <PetCard
              key={pet.id}
              pet={pet}
              owned={ownedPets.includes(pet.id)}
              onWakeUp={() => onWakeUp(pet.id)}
              onMint={() => onMint(pet.id)}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Series <span className="text-[#F0B90B]">2</span>
            </h2>
            <span className="text-[10px] font-mono tracking-widest text-[#F0B90B]/50 border border-[#F0B90B]/20 px-2 py-0.5 rounded-sm">
              COMING SOON
            </span>
          </div>
          <p className="text-white/30 font-mono text-xs tracking-wide">
            NEW CHARACTERS DROPPING SOON
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { id: 6, image: "/lion_bull.jpg" },
            { id: 7, image: "/lioness_cow.jpg" },
            { id: 8, image: "/raccoon_bear.jpg" },
            { id: 9, image: "/alpaca_condor.jpg" },
            { id: 10, image: "/wolf_raven.jpg" },
          ].map((mystery, index) => (
            <motion.div
              key={mystery.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="relative group rounded-sm overflow-hidden border border-white/5 bg-[#1E2026] flex flex-col"
              data-testid={`card-mystery-${mystery.id}`}
            >
              <div className="relative aspect-square overflow-hidden bg-black">
                <img
                  src={mystery.image}
                  alt="Mystery Pet"
                  className="w-full h-full object-cover opacity-60 scale-110"
                  style={{ filter: "blur(8px)" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                  <Lock className="w-6 h-6 text-white/30" />
                  <span className="text-white/40 font-mono text-[10px] tracking-widest font-bold">
                    SERIES 2 SOON
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white/15">
                    ???
                  </h3>
                  <p className="text-white/10 font-mono text-[10px] mt-1 uppercase tracking-wider">
                    UNKNOWN
                  </p>
                </div>
                <p className="text-white/10 text-xs leading-relaxed line-clamp-2 flex-1">
                  A mysterious new companion awaits. Stay tuned for the reveal.
                </p>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    disabled
                    className="w-full text-white/15 border-white/5 rounded-sm font-mono text-xs"
                    data-testid={`button-locked-${mystery.id}`}
                  >
                    <Lock className="w-3 h-3 mr-2" />
                    LOCKED
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 pb-8 flex justify-center"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider" data-testid="text-chain-status">
            {isDemoMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-white/30">Demo Mode | Simulated Data</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white/30">Live on BNB Chain | Contract: {CONTRACT_SHORT}</span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
