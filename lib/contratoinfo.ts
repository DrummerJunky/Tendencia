// lib/contractInfo.ts

export const votingContract = {
  address: "0xTU_DIRECCION_DEL_CONTRATO_EN_SEPOLIA", // ej. "0xAbCdEf1234…"
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [{ internalType: "string", name: "candidate", type: "string" }],
      name: "vote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "candidate", type: "string" }],
      name: "getVotes",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "", type: "string" }],
      name: "votes",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ],
};
