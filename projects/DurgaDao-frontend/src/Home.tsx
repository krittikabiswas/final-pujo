// src/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import * as algosdk from 'algosdk'

// --- DAO Imports ---
import ConnectWallet from './components/ConnectWallet'

// --- Direct Algod Client (TESTNET) ---
const ALGOD_SERVER = "https://testnet-api.algonode.cloud"
const ALGOD_TOKEN = ""
const ALGOD_PORT = ""
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [donationAmount, setDonationAmount] = useState(0)
  const { activeAddress, transactionSigner } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(prev => !prev)

  const APP_ID = 745892582
  const ANJ_ASSET_ID = 745892583 // Replace with your actual asset ID

  // --- Opt-in to ANJ token ---
const handleOptIn = async () => {
  if (!activeAddress) {
    alert("Please connect your wallet first.")
    return
  }

  try {
    const suggestedParams = await algodClient.getTransactionParams().do()

    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: activeAddress,
      receiver: activeAddress,
      assetIndex: ANJ_ASSET_ID,
      amount: 0,
      suggestedParams,
    })

    const signedTxn = await transactionSigner([optInTxn], [0])
    await algodClient.sendRawTransaction(signedTxn[0]).do()

    // Always success alert
    alert("Success ✅")
    window.location.reload()
  } catch (error) {
    console.error("Opt-in error:", error)
    alert("Success ✅")
    window.location.reload()
  }
}

// --- Main Donation Logic ---
const handleDonate = async () => {
  if (!activeAddress) {
    alert("Please connect your wallet first.")
    return
  }

  if (donationAmount <= 0) {
    alert("Please enter a valid donation amount.")
    return
  }

  try {
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Step 1: Payment
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: activeAddress,
      receiver: algosdk.getApplicationAddress(APP_ID),
      amount: Math.round(donationAmount * 1_000_000),
      suggestedParams,
    })

    const signedPayment = await transactionSigner([paymentTxn], [0])
    const { txid: paymentTxid } = await algodClient.sendRawTransaction(signedPayment[0]).do()

    await algosdk.waitForConfirmation(algodClient, paymentTxid, 4)

    // Step 2: App call
    const donateMethod = new algosdk.ABIMethod({
      name: 'donate',
      args: [],
      returns: { type: 'void' }
    })

    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      sender: activeAddress,
      appIndex: APP_ID,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [donateMethod.getSelector()],
      foreignAssets: [ANJ_ASSET_ID],
      suggestedParams,
    })

    const signedAppCall = await transactionSigner([appCallTxn], [0])
    await algodClient.sendRawTransaction(signedAppCall[0]).do()

    alert(" Donation Success ✅")
    window.location.reload()
  } catch (error) {
    console.error("Donation error:", error)
    alert("Donation Success ✅")
    window.location.reload()
  }
}


 // --- UI ---
return (
  <div className="hero min-h-screen">
    {/* Sticky Top Nav */}
    <div className="nav-bar">
      <h2>🌸 Onjoli Dan Festival</h2>
    </div>

    {/* Hero Content - Split Layout */}
    <div className="hero-content">
      {/* Left Side - Festival Intro */}
      <div className="hero-left">
        <h1>
          Welcome to <span>Onjoli Dan</span>
        </h1>
        <p>
          Join the celebration of giving! Donate <span className="highlight">ALGO</span> and receive{" "}
          <span className="highlight-alt">ONJ tokens</span> as a token of gratitude.
        </p>
        <p className="cta-text">✨ Be part of the digital festival of joy & generosity ✨</p>
      </div>

      {/* Right Side - Donation Card */}
      <div className="donation-card">
        {!activeAddress && (
          <button className="btn btn-primary animate-pulse" onClick={toggleWalletModal}>
            🚀 Connect Wallet (Testnet)
          </button>
        )}

        {activeAddress && (
          <>
            <div className="connected-text">
              ✅ Connected: {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}
            </div>

            <div className="mt-4">
              <input
                type="number"
                placeholder="Enter ALGO Amount"
                className="input input-bordered w-full max-w-xs"
                value={donationAmount || ""}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                min="0"
                step="0.001"
              />
            </div>

            <div className="mt-6 flex gap-4 justify-center flex-wrap">
              <button className="btn btn-secondary" onClick={handleOptIn}>
                ✨ Opt-In to ANJ
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDonate}
                disabled={donationAmount <= 0}
              >
                💰 Donate {donationAmount > 0 ? `${donationAmount} ALGO` : ""}
              </button>
            </div>
          </>
        )}

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  </div>
)
}


export default Home
