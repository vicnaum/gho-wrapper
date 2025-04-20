import { http, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { lens } from "./constants"; // Import our custom chain

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!walletConnectProjectId) {
  console.warn(
    "WalletConnect Project ID is not set. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file."
  );
}

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [lens], // Use only the Lens chain for this app
    transports: {
      // RPC URL for each chain
      [lens.id]: http(lens.rpcUrls.default.http[0]),
    },

    // Required API Keys
    walletConnectProjectId: walletConnectProjectId,

    // Required App Info
    appName: "WGHO Wrapper",

    // Optional App Info
    appDescription: "A simple app to wrap and unwrap GHO on Lens Chain.",
    // appUrl: "https://family.co", // your app's url
    // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)

    // Optional: Set SSR flag if needed for Next.js App Router (usually helps with hydration issues)
    ssr: true,
  })
);
