"use client";
import { useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";
import { useAccount, useBalance, useSendTransaction, useChainId } from "wagmi";
import { formatEther } from "viem";
import { useCallback, useState, useEffect } from "react";
import { userHasWallet } from "@civic/auth-web3";

function Web3U({
  walletCreationInProgress,
}: {
  walletCreationInProgress?: boolean;
}) {
  const { isConnected, address, chain } = useAccount();
  const chainId = useChainId();
  const user = useUser();
  const isLoading = user.isLoading || walletCreationInProgress;
  const [receipientAddress, setRecipientAddress] = useState<string | null>(null);
  const [ethToSend, setEthToSend] = useState<number | null>(0.001);
  const [busySendingEth, setBusySendingEth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get chain info from multiple sources
  const effectiveChain = chain;
  const effectiveChainId = chain?.id || chainId;

  // Debug logging
  useEffect(() => {
    console.log("Web3U Debug Info:", {
      isConnected,
      address,
      chain,
      chainId,
      effectiveChain,
      effectiveChainId,
      user: user.user,
      userHasWallet: userHasWallet(user),
      isLoading,
      walletCreationInProgress
    });
  }, [isConnected, address, chain, chainId, effectiveChain, effectiveChainId, user, isLoading, walletCreationInProgress]);

  const ethBalance = useBalance({
    address,
    query: {
      refetchInterval: 3000,
      enabled: !!address && (!!effectiveChain || !!effectiveChainId),
    },
  });

  const formatBalanceEth = (balance: bigint | undefined) => {
    if (!balance) return (0.0).toFixed(5);
    return Number.parseFloat(formatEther(balance)).toFixed(5);
  };

  const { sendTransaction, error: sendTxError } = useSendTransaction();

  useEffect(() => {
    if (sendTxError) {
      console.error("Error sending transaction:", sendTxError);
      setError(sendTxError.message);
    }
  }, [sendTxError]);

  const sendEth = useCallback(() => {
    if (!ethToSend || !receipientAddress) {
      setError("Please enter both amount and recipient address");
      return;
    }

    if (!effectiveChain && !effectiveChainId) {
      setError("Cannot send transaction: Chain not available");
      return;
    }

    setError(null);
    setBusySendingEth(true);
    
    sendTransaction({
      to: receipientAddress as `0x${string}`,
      value: BigInt(ethToSend * 1e18),
    }, {
      onSettled: () => {
        setBusySendingEth(false);
      },
      onError: (error) => {
        setError(error.message);
        setBusySendingEth(false);
      }
    });
  }, [receipientAddress, ethToSend, sendTransaction, effectiveChain, effectiveChainId]);

  if (!isConnected || isLoading) {
    return (
      <div className="text-gray-900 dark:text-white">
        <div>Connecting wallet. Please wait...</div>
        {isLoading && <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading user data...</div>}
        {walletCreationInProgress && <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Creating wallet...</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      {!effectiveChain && !effectiveChainId && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-4">
          <strong>Warning:</strong> Wallet connected but chain is undefined. This might be due to:
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Embedded wallet feature not enabled in Civic Auth Dashboard</li>
            <li>Network configuration issues</li>
            <li>Client ID configuration problems</li>
          </ul>
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex flex-col text-gray-900 dark:text-white">
          <span>Chain: {effectiveChain?.name || `Chain ID ${effectiveChainId}` || "Unknown/Undefined"}</span>
          <span>Chain ID: {effectiveChainId || "N/A"}</span>
          <span>Wallet address: {address}</span>
          <span>Balance: {formatBalanceEth(ethBalance?.data?.value)} ETH</span>
          {ethBalance.isError && <span className="text-red-500 text-sm">Error loading balance</span>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-gray-900 dark:text-white">Send ETH to wallet:</span>
        <label className="text-gray-700 dark:text-gray-300">ETH to send:</label>
        <input 
          type="number" 
          className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2" 
          placeholder="0.001" 
          value={ethToSend || ''} 
          onChange={(evt) => setEthToSend(parseFloat(evt.target.value))} 
        />
        <label className="text-gray-700 dark:text-gray-300">Recipient address:</label>
        <input 
          type="text" 
          className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2" 
          placeholder="0x..." 
          value={receipientAddress || ''} 
          onChange={(evt) => setRecipientAddress(evt.target.value)} 
        />
        <button
          className={`mt-2 rounded px-4 py-2 text-white 
            ${!receipientAddress || !ethToSend || busySendingEth || (!effectiveChain && !effectiveChainId)
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={!receipientAddress || !ethToSend || busySendingEth || (!effectiveChain && !effectiveChainId)}
          onClick={sendEth}
        >
          {busySendingEth ? 'Sending transaction...' : 'Send transaction'}
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
    </div>
  );
}

function Web3Zone() {
  const { user, isLoading, walletCreationInProgress } = useUser();
  useAutoConnect();

  // Debug logging for Web3Zone
  useEffect(() => {
    console.log("Web3Zone Debug Info:", {
      user,
      isLoading,
      walletCreationInProgress
    });
  }, [user, isLoading, walletCreationInProgress]);

  if (!isLoading && !user) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-4 text-gray-900 dark:text-white text-center">
          <h3 className="text-lg font-semibold mb-2">Web3 Wallet Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please sign in using the button above to access your embedded wallet and Web3 features.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Once signed in, you&apos;ll be able to view your wallet balance and send transactions.
          </div>
        </div>
      </div>
    );
  }

  return <Web3U walletCreationInProgress={walletCreationInProgress} />;
}

export { Web3Zone };
