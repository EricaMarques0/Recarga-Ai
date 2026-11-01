import { useEffect, useState } from "react";
import { syncWallet, WALLET_EVENT, type Wallet } from "@/lib/wallet";

/** Null até montar no navegador, para o servidor e a hidratação renderizarem a mesma coisa. */
export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const sync = () => setWallet(syncWallet());
    sync();
    window.addEventListener(WALLET_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WALLET_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return wallet;
}
