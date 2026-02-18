import { BrowserProvider, Contract } from "ethers";

export const CONTRACT_ADDRESS = "0x8019919bAd00C6Fd5b98817f854e2C8824334FAf";

const BNB_CHAIN_ID = 56;
const BNB_TESTNET_CHAIN_ID = 97;

const MINIMAL_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const BNB_CHAIN_PARAMS = {
  chainId: "0x38",
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"],
};

export async function connectWallet(): Promise<{ address: string; provider: BrowserProvider }> {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to connect your wallet.");
  }

  const provider = new BrowserProvider((window as any).ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  if (chainId !== BNB_CHAIN_ID && chainId !== BNB_TESTNET_CHAIN_ID) {
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x38" }]);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await provider.send("wallet_addEthereumChain", [BNB_CHAIN_PARAMS]);
      } else {
        throw new Error("Please switch to BNB Smart Chain in your wallet.");
      }
    }
  }

  return { address: accounts[0], provider };
}

export async function checkOwnedPets(
  provider: BrowserProvider,
  userAddress: string
): Promise<number[]> {
  const contract = new Contract(CONTRACT_ADDRESS, MINIMAL_ABI, provider);
  const owned: number[] = [];

  const checks = [1, 2, 3, 4, 5].map(async (tokenId) => {
    try {
      const owner: string = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        owned.push(tokenId);
      }
    } catch {
    }
  });

  await Promise.all(checks);
  return owned.sort((a, b) => a - b);
}

export async function mintPet(
  provider: BrowserProvider,
  tokenId: number
): Promise<void> {
  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer);
  const tx = await contract.mint(tokenId);
  await tx.wait();
}
