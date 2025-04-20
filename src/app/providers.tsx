"use client"; // Mark this as a Client Component

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { config } from "@/lib/wagmi"; // Import your config

// Create a react-query client
const queryClient = new QueryClient();

// Define props if you might pass things like initialState later
type Props = {
  children: React.ReactNode;
  // If using SSR hydration with cookies later, add:
  // initialState?: State | undefined;
};

export function Providers({ children }: Props) {
  // If not using SSR hydration, config can be imported directly
  // If using SSR hydration, you might pass config or initialState as props

  return (
    <WagmiProvider config={config} /* initialState={initialState} */>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
