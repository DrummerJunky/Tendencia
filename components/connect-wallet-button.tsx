"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"

export function ConnectWalletButton() {
  return (
    <ConnectButton
      accountStatus="avatar" // o "address" si prefieres solo ver la dirección
      chainStatus="icon"
      showBalance={false}
    />
  )
}
