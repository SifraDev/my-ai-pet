import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ChatInterface from "@/pages/chat";
import { PETS } from "@/data/pets";
import { useState, useEffect, createContext, useContext } from "react";
import { connectWallet, checkOwnedPets, mintPet } from "@/lib/contract";
import type { BrowserProvider } from "ethers";

interface AppState {
  ownedPets: number[];
  setOwnedPets: React.Dispatch<React.SetStateAction<number[]>>;
  isDemoMode: boolean;
  walletAddress: string | null;
  walletProvider: BrowserProvider | null;
}

const AppContext = createContext<AppState>({
  ownedPets: [],
  setOwnedPets: () => {},
  isDemoMode: true,
  walletAddress: null,
  walletProvider: null,
});

export function useAppState() {
  return useContext(AppContext);
}

function LandingWrapper() {
  const [, navigate] = useLocation();
  const { setOwnedPets } = useAppState();
  const app = useContext(AppContext);
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  async function handleConnectWallet() {
    setConnecting(true);
    try {
      const { address, provider } = await connectWallet();
      (app as any)._setWalletAddress(address);
      (app as any)._setWalletProvider(provider);
      (app as any)._setDemoMode(false);

      const owned = await checkOwnedPets(provider, address);
      setOwnedPets(owned);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err.message || "Could not connect wallet.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  }

  function handleDemoMode() {
    (app as any)._setDemoMode(true);
    (app as any)._setWalletAddress(null);
    (app as any)._setWalletProvider(null);
    setOwnedPets(PETS.map((p) => p.id));
    navigate("/dashboard");
  }

  return (
    <LandingPage
      onConnectWallet={handleConnectWallet}
      onDemoMode={handleDemoMode}
      connecting={connecting}
    />
  );
}

function DashboardWrapper() {
  const [, navigate] = useLocation();
  const app = useContext(AppContext);
  const { ownedPets, setOwnedPets, isDemoMode, walletAddress, walletProvider } = useAppState();
  const { toast } = useToast();

  function handleWakeUp(petId: number) {
    navigate(`/chat/${petId}`);
  }

  async function handleMint(petId: number) {
    if (isDemoMode) {
      setOwnedPets((prev) =>
        prev.includes(petId) ? prev : [...prev, petId]
      );
      return;
    }

    if (!walletProvider) {
      toast({
        title: "Wallet not connected",
        description: "Please reconnect your wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({ title: "Minting...", description: `Sending transaction for Pet #${petId}. Please confirm in MetaMask.` });
      await mintPet(walletProvider, petId);
      setOwnedPets((prev) =>
        prev.includes(petId) ? prev : [...prev, petId]
      );
      toast({ title: "Minted!", description: `Pet #${petId} is now yours!` });
    } catch (err: any) {
      toast({
        title: "Mint Failed",
        description: err.reason || err.message || "Transaction failed.",
        variant: "destructive",
      });
    }
  }

  function handleDisconnect() {
    setOwnedPets([]);
    (app as any)._setDemoMode(true);
    (app as any)._setWalletAddress(null);
    (app as any)._setWalletProvider(null);
    sessionStorage.removeItem("walletAddress");
    sessionStorage.removeItem("isDemoMode");
    sessionStorage.removeItem("ownedPets");
    navigate("/");
  }

  return (
    <Dashboard
      ownedPets={ownedPets}
      onWakeUp={handleWakeUp}
      onMint={handleMint}
      onDisconnect={handleDisconnect}
      isDemoMode={isDemoMode}
      walletAddress={walletAddress}
    />
  );
}

function ChatWrapper({ petId }: { petId: string }) {
  const [, navigate] = useLocation();
  const id = parseInt(petId, 10);

  function handleBack() {
    navigate("/dashboard");
  }

  if (isNaN(id)) {
    navigate("/dashboard");
    return null;
  }

  return <ChatInterface petId={id} onBack={handleBack} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingWrapper} />
      <Route path="/dashboard" component={DashboardWrapper} />
      <Route path="/chat/:petId">
        {(params) => <ChatWrapper petId={params.petId} />}
      </Route>
      <Route>
        <LandingWrapper />
      </Route>
    </Switch>
  );
}

function App() {
  const [ownedPets, setOwnedPets] = useState<number[]>(() => {
    try {
      const saved = sessionStorage.getItem("ownedPets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDemoMode, setDemoMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("isDemoMode") === "true";
    } catch {
      return true;
    }
  });

  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("walletAddress") || null;
    } catch {
      return null;
    }
  });

  const [walletProvider, setWalletProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    sessionStorage.setItem("ownedPets", JSON.stringify(ownedPets));
  }, [ownedPets]);

  useEffect(() => {
    sessionStorage.setItem("isDemoMode", String(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    if (walletAddress) {
      sessionStorage.setItem("walletAddress", walletAddress);
    } else {
      sessionStorage.removeItem("walletAddress");
    }
  }, [walletAddress]);

  const contextValue: any = {
    ownedPets,
    setOwnedPets,
    isDemoMode,
    walletAddress,
    walletProvider,
    _setDemoMode: setDemoMode,
    _setWalletAddress: setWalletAddress,
    _setWalletProvider: setWalletProvider,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContext.Provider value={contextValue}>
          <Router />
        </AppContext.Provider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
