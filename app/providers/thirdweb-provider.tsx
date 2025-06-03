'use client';

import { ThirdwebProvider, metamaskWallet } from '@thirdweb-dev/react';
import { ReactNode } from 'react';

export function ThirdwebWrapper({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain="mumbai"
      supportedWallets={[metamaskWallet()]}
    >
      {children}
    </ThirdwebProvider>
  );
}
