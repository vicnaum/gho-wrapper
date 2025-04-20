"use client";

import React, { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseEther, type BaseError } from "viem";
import { LENS_CHAIN_ID, WGHO_ADDRESS } from "@/lib/constants";
import { wghoAbi } from "@/lib/abis";

export default function Home() {
  const { address, isConnected, chainId } = useAccount();
  const [wrapAmount, setWrapAmount] = useState("");
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const [isClient, setIsClient] = useState(false);

  // --- Wagmi Hooks ---
  const {
    data: ghoBalance,
    isLoading: ghoLoading,
    error: ghoError,
    refetch: refetchGhoBalance,
  } = useBalance({
    address: address,
    chainId: LENS_CHAIN_ID,
    query: { enabled: isConnected && chainId === LENS_CHAIN_ID },
  });
  const {
    data: wghoBalance,
    isLoading: wghoLoading,
    error: wghoError,
    refetch: refetchWghoBalance,
  } = useBalance({
    address: address,
    token: WGHO_ADDRESS,
    chainId: LENS_CHAIN_ID,
    query: { enabled: isConnected && chainId === LENS_CHAIN_ID },
  });
  const {
    data: wrapHash,
    error: wrapError,
    isPending: isWrapping,
    writeContract: wrapGho,
  } = useWriteContract();
  const { isLoading: isWrapConfirming, isSuccess: isWrapConfirmed } =
    useWaitForTransactionReceipt({ hash: wrapHash });
  const {
    data: unwrapHash,
    error: unwrapError,
    isPending: isUnwrapping,
    writeContract: unwrapWgho,
  } = useWriteContract();
  const { isLoading: isUnwrapConfirming, isSuccess: isUnwrapConfirmed } =
    useWaitForTransactionReceipt({ hash: unwrapHash });

  // --- Client-side Mount Check ---
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Event Handlers ---
  const handleWrap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wrapAmount || Number(wrapAmount) <= 0 || !wrapGho) return;
    try {
      const amountBigInt = parseEther(wrapAmount);
      wrapGho({
        address: WGHO_ADDRESS,
        abi: wghoAbi,
        functionName: "deposit",
        value: amountBigInt,
        chainId: LENS_CHAIN_ID,
      });
    } catch (err) {
      console.error("Wrap Error:", err);
    }
  };
  const handleUnwrap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!unwrapAmount || Number(unwrapAmount) <= 0 || !unwrapWgho) return;
    try {
      const amountBigInt = parseEther(unwrapAmount);
      unwrapWgho({
        address: WGHO_ADDRESS,
        abi: wghoAbi,
        functionName: "withdraw",
        args: [amountBigInt],
        chainId: LENS_CHAIN_ID,
      });
    } catch (err) {
      console.error("Unwrap Error:", err);
    }
  };

  // --- Refetch Balances ---
  useEffect(() => {
    if (isWrapConfirmed || isUnwrapConfirmed) {
      console.log("Transaction confirmed, refetching balances...");
      setTimeout(() => {
        // Add a small delay to allow indexer to catch up
        refetchGhoBalance();
        refetchWghoBalance();
      }, 1500);
      if (isWrapConfirmed) setWrapAmount("");
      if (isUnwrapConfirmed) setUnwrapAmount("");
    }
  }, [
    isWrapConfirmed,
    isUnwrapConfirmed,
    refetchGhoBalance,
    refetchWghoBalance,
  ]);

  // --- Render Logic ---
  const isCorrectChain = chainId === LENS_CHAIN_ID;
  const showConnectMessage = isClient && !isConnected;
  const showSwitchChainMessage = isClient && isConnected && !isCorrectChain;
  const showInterface = isClient && isConnected && isCorrectChain;

  const formatBalance = (
    data: { value: bigint; symbol?: string } | undefined,
    decimals: number,
    defaultSymbol: string
  ) => {
    if (!data) return `0.0000 ${defaultSymbol}`;
    try {
      return `${Number(formatUnits(data.value, decimals)).toFixed(4)} ${
        data.symbol || defaultSymbol
      }`;
    } catch (e) {
      console.error("Error formatting balance:", e);
      return `Error ${defaultSymbol}`;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="absolute top-6 right-6 z-50">
        <ConnectKitButton theme="midnight" /> {/* Apply a dark theme */}
      </div>

      <div className="w-full max-w-lg space-y-8 rounded-xl bg-gray-800/70 p-8 shadow-2xl backdrop-blur-lg border border-gray-700/50">
        <h1 className="text-center text-3xl font-bold text-white">
          WGHO Wrapper
        </h1>

        {showConnectMessage && (
          <p className="text-center text-gray-400">
            Please connect your wallet to continue.
          </p>
        )}
        {showSwitchChainMessage && (
          <p className="text-center text-red-400">
            Please switch to the Lens Chain (ID: {LENS_CHAIN_ID}) in your
            wallet.
          </p>
        )}

        {showInterface && (
          <div className="space-y-8">
            {/* Balances */}
            <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900/50 p-6">
              <h2 className="text-xl font-semibold text-gray-300">
                Your Balances
              </h2>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-400">GHO:</span>
                <span className="font-mono text-2xl font-medium text-white">
                  {ghoLoading ? (
                    <span className="animate-pulse text-gray-500">...</span>
                  ) : (
                    formatBalance(ghoBalance, 18, "GHO")
                  )}
                  {ghoError && (
                    <span className="ml-2 text-xs text-red-400">(Error)</span>
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-400">WGHO:</span>
                <span className="font-mono text-2xl font-medium text-white">
                  {wghoLoading ? (
                    <span className="animate-pulse text-gray-500">...</span>
                  ) : (
                    formatBalance(wghoBalance, 18, "WGHO")
                  )}
                  {wghoError && (
                    <span className="ml-2 text-xs text-red-400">(Error)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Wrap Form */}
            <form onSubmit={handleWrap} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">Wrap GHO</h2>
              <div>
                <label htmlFor="wrap-amount" className="sr-only">
                  Amount to wrap
                </label>
                <input
                  id="wrap-amount"
                  type="number"
                  step="any"
                  min="0"
                  value={wrapAmount}
                  onChange={(e) => setWrapAmount(e.target.value)}
                  placeholder="Amount of GHO to wrap"
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
              <button
                type="submit"
                disabled={
                  isWrapping ||
                  isWrapConfirming ||
                  !wrapAmount ||
                  Number(wrapAmount) <= 0 ||
                  !wrapGho
                }
                className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 transition duration-150 ease-in-out"
              >
                {isWrapping
                  ? "Check Wallet..."
                  : isWrapConfirming
                  ? "Wrapping..."
                  : "Wrap GHO"}
              </button>
              {/* Transaction Status Display */}
              <div className="h-8 text-center text-xs">
                {wrapHash && (
                  <div className="truncate text-gray-400">
                    Tx Hash: {wrapHash}
                  </div>
                )}
                {isWrapConfirming && (
                  <div className="animate-pulse text-blue-400">
                    Waiting for confirmation...
                  </div>
                )}
                {isWrapConfirmed && (
                  <div className="text-green-400">Wrap successful!</div>
                )}
                {wrapError && (
                  <div className="text-red-400">
                    Error:{" "}
                    {(wrapError as BaseError)?.shortMessage ||
                      wrapError.message}
                  </div>
                )}
              </div>
            </form>

            {/* Unwrap Form */}
            <form onSubmit={handleUnwrap} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">
                Unwrap WGHO
              </h2>
              <div>
                <label htmlFor="unwrap-amount" className="sr-only">
                  Amount to unwrap
                </label>
                <input
                  id="unwrap-amount"
                  type="number"
                  step="any"
                  min="0"
                  value={unwrapAmount}
                  onChange={(e) => setUnwrapAmount(e.target.value)}
                  placeholder="Amount of WGHO to unwrap"
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-pink-500 transition duration-150 ease-in-out"
                />
              </div>
              <button
                type="submit"
                disabled={
                  isUnwrapping ||
                  isUnwrapConfirming ||
                  !unwrapAmount ||
                  Number(unwrapAmount) <= 0 ||
                  !unwrapWgho
                }
                className="w-full rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60 transition duration-150 ease-in-out"
              >
                {isUnwrapping
                  ? "Check Wallet..."
                  : isUnwrapConfirming
                  ? "Unwrapping..."
                  : "Unwrap WGHO"}
              </button>
              {/* Transaction Status Display */}
              <div className="h-8 text-center text-xs">
                {unwrapHash && (
                  <div className="truncate text-gray-400">
                    Tx Hash: {unwrapHash}
                  </div>
                )}
                {isUnwrapConfirming && (
                  <div className="animate-pulse text-blue-400">
                    Waiting for confirmation...
                  </div>
                )}
                {isUnwrapConfirmed && (
                  <div className="text-green-400">Unwrap successful!</div>
                )}
                {unwrapError && (
                  <div className="text-red-400">
                    Error:{" "}
                    {(unwrapError as BaseError)?.shortMessage ||
                      unwrapError.message}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
