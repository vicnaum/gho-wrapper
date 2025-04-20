import { defineChain } from "viem";

// Lens Chain Definition (Using GHO as native)
export const LENS_CHAIN_ID = 232; // Exporting the ID directly for easier use
export const lens = defineChain({
  id: LENS_CHAIN_ID,
  name: "Lens Chain",
  nativeCurrency: { name: "GHO", symbol: "GHO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.lens.xyz"] }, // Official Lens RPC
  },
  blockExplorers: {
    default: { name: "Lens Explorer", url: "https://explorer.lens.xyz/" },
  },
});

// Wrapped GHO (WGHO) Contract Address on Lens Chain
export const WGHO_ADDRESS =
  "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F" as const;

// GHO (as native token proxy) Address on Lens Chain (for balance checking if needed)
// Verify if this address is correct for Lens or if native balance check (no token address) should be used.
// export const GHO_ADDRESS_NATIVE_PROXY = '0x000000000000000000000000000000000000800A' as const;
