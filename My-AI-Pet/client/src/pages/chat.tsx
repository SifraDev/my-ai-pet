import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPetById, type Pet } from "@/data/pets";
import PetCompanion from "@/components/pet-companion";

type PetMood = "idle" | "talking" | "excited" | "thinking";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  petId: number;
  onBack: () => void;
}

export default function ChatInterface({ petId, onBack }: ChatInterfaceProps) {
  const pet = getPetById(petId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [petMood, setPetMood] = useState<PetMood>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pet && !hasGreeted) {
      setMessages([{ role: "assistant", content: pet.greeting }]);
      setHasGreeted(true);
    }
  }, [pet, hasGreeted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!pet) return null;

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    setPetMood("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet!.id,
          message: userMsg,
          history: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantMsg = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setPetMood("talking");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                assistantMsg += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMsg,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      if (buffer.trim().startsWith("data: ")) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          if (data.content) {
            assistantMsg += data.content;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantMsg,
              };
              return updated;
            });
          }
        } catch {}
      }
      setPetMood("excited");
      setTimeout(() => setPetMood("idle"), 3000);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hmm, something went wrong. Try again, ser.",
        },
      ]);
      setPetMood("idle");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {!videoError ? (
        <video
          src={pet.video}
          poster={pet.image}
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 object-cover w-full h-full"
          data-testid={`video-pet-${pet.id}`}
          onError={() => setVideoError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${pet.image})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col h-full">
        <header className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              data-testid="button-back-to-dashboard"
              onClick={onBack}
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white no-default-hover-elevate"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm overflow-hidden border border-[#F0B90B]/30">
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2
                  className="text-[#F0B90B] font-bold text-sm tracking-wide"
                  data-testid="text-chat-pet-name"
                >
                  {pet.name}
                </h2>
                <p className="text-white/30 font-mono text-[9px] tracking-wider uppercase">
                  {pet.species} &middot; Token #{pet.id}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-sm px-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400/80 font-mono text-[9px] tracking-wider">
              ONLINE
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" data-testid="chat-messages">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-sm overflow-hidden border border-[#F0B90B]/20 mt-1">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-[60%] rounded-sm px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-[#F0B90B]/15 border border-[#F0B90B]/20 text-white"
                      : "bg-white/5 border border-white/5 text-white/90"
                  }`}
                  data-testid={`chat-message-${i}`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center mt-1">
                    <User className="w-3.5 h-3.5 text-[#F0B90B]/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.content === "" && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-sm overflow-hidden border border-[#F0B90B]/20 mt-1">
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-[#F0B90B]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#F0B90B]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#F0B90B]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex justify-end px-4 pb-1 pointer-events-none">
          <div className="pointer-events-auto">
            <PetCompanion
              petId={pet.id}
              petImage={pet.image}
              mood={petMood}
              companionVideo={
                { 1: "/dog-companion.mp4", 2: "/ferret-companion.mp4", 3: "/goat-companion.mp4", 4: "/fox-companion.mp4", 5: "/cat-companion.mp4" }[pet.id]
              }
            />
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-2 bg-[#1E2026]/80 backdrop-blur-md border border-white/10 rounded-sm p-2">
            <input
              ref={inputRef}
              data-testid="input-chat-message"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Talk to ${pet.name}...`}
              disabled={isLoading}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 outline-none font-mono px-2"
            />
            <Button
              data-testid="button-send-message"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-[#F0B90B] text-black rounded-sm no-default-hover-elevate no-default-active-elevate disabled:opacity-30"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-white/15 font-mono text-[9px] text-center mt-2 tracking-wider">
            AI-POWERED BY GEMINI ON BNB CHAIN
          </p>
        </div>
      </div>
    </div>
  );
}
