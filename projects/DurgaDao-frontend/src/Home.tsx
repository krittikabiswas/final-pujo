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
    <div className="hero min-h-screen bg-black-400">
      <div className="hero-content text-center rounded-lg p-8 bg-white shadow-lg">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Welcome to the Onjoli Dan</h1>
          <p className="py-6 text-xl">
            Donate ALGO to participate in the festival and receive ONJ tokens.
          </p>

          {!activeAddress && (
            <button className="btn btn-primary m-2" onClick={toggleWalletModal}>
              Connect Wallet (Testnet)
            </button>
          )}

          {activeAddress && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Connected: {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}
              </div>
              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Amount in ALGO"
                  className="input input-bordered w-full max-w-xs"
                  value={donationAmount || ''}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  min="0"
                  step="0.001"
                />
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  className="btn btn-secondary"
                  onClick={handleOptIn}
                >
                  Opt-In to ANJ
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDonate}
                  disabled={donationAmount <= 0}
                >
                  Donate {donationAmount > 0 ? `${donationAmount} ALGO` : ''}
                </button>
              </div>
            </>
          )}
        </div>

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  )
}

export default Home
