"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { connectWallet } from "@/lib/stellar";

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if previously connected in this session
    const savedAddress = localStorage.getItem("workcounter_address");
    if (savedAddress) {
      setAddress(savedAddress);
    }
    setLoading(false);
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const pubKey = await connectWallet();
      if (pubKey) {
        setAddress(pubKey);
        localStorage.setItem("workcounter_address", pubKey);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("workcounter_address");
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect, loading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
