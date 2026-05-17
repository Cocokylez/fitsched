"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchFitTokenBalance } from "@/services/fitTokens";

/**
 * Formats a FitToken amount for compact display.
 *
 * @param value - Numeric token balance.
 * @returns A fixed two-decimal token string.
 */
function formatTokenBalance(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Displays the current user's FitToken balance and refreshes it on navigation/focus.
 *
 * @returns The FitToken balance pill UI.
 */
export function FitTokenBalancePill() {
  const pathname = usePathname();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBalance = useCallback(async () => {
    const nextBalance = await fetchFitTokenBalance();
    setBalance(nextBalance);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance, pathname]);

  useEffect(() => {
    const handleRefresh = () => loadBalance();

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("fitsched:tokens-updated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("fitsched:tokens-updated", handleRefresh);
    };
  }, [loadBalance]);

  const displayBalance = loading ? "--" : formatTokenBalance(balance);

  return (
    <div
      aria-label={`${displayBalance} FitTokens`}
      className="motion-lift inline-flex h-9 min-w-[94px] shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--accent-soft)] px-3 text-[var(--accent-strong)] shadow-[var(--shadow)]"
    >
      <span className="brand-wordmark grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--panel)] text-[8px] font-black leading-none tracking-normal">
        FT
      </span>
      <span className="number-text min-w-0 whitespace-nowrap text-center text-xs font-extrabold leading-none tabular-nums">
        {displayBalance}
      </span>
    </div>
  );
}
