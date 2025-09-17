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
  const [donationAmount, setDonationAmount] = useState<number | undefined>(undefined)
  const { activeAddress, transactionSigner } = useWallet()

  // --- State for Loading and Feedback ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const toggleWalletModal = () => setOpenWalletModal(prev => !prev)

  const APP_ID = 745892582
  const ANJ_ASSET_ID = 745892583

  // --- Function to handle setting messages ---
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000) // Message disappears after 5 seconds
  }

  // --- Opt-in to ANJ token ---
  const handleOptIn = async () => {
    if (!activeAddress) {
      return showMessage("Please connect your wallet first.", 'error')
    }
    setIsSubmitting(true)
    setMessage(null)

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: activeAddress,
        assetIndex: ANJ_ASSET_ID,
        amount: 0,
        suggestedParams,
      })

      const signedTxn = await transactionSigner([{ txn: optInTxn, signers: [activeAddress] }])
      await algodClient.sendRawTransaction(signedTxn).do()
      showMessage("Opt-in successful! ✨", 'success')
    } catch (error) {
      console.error("Opt-in error:", error)
      showMessage("Opt-in failed. You may already be opted-in.", 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Main Donation Logic ---
  const handleDonate = async () => {
    if (!activeAddress) {
      return showMessage("Please connect your wallet first.", 'error')
    }
    if (!donationAmount || donationAmount <= 0) {
      return showMessage("Please enter a valid donation amount.", 'error')
    }
    setIsSubmitting(true)
    setMessage(null)

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const appAddress = algosdk.getApplicationAddress(APP_ID)

      // Transaction 1: Payment from user to App Address
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: appAddress,
        amount: Math.round(donationAmount * 1_000_000), // Convert ALGO to microALGO
        suggestedParams,
      })

      // Transaction 2: App Call to trigger donation logic
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
          from: activeAddress,
          appIndex: APP_ID,
          appArgs: [new TextEncoder().encode('donate')],
          foreignAssets: [ANJ_ASSET_ID],
          suggestedParams,
      })

      // Group transactions for atomic execution
      const txnsToGroup = [paymentTxn, appCallTxn]
      algosdk.assignGroupID(txnsToGroup)

      const signedTxns = await transactionSigner(
        txnsToGroup.map(txn => ({ txn, signers: [activeAddress] }))
      )

      await algodClient.sendRawTransaction(signedTxns).do()

      showMessage("Donation successful! Thank you for your support. 💖", 'success')
      setDonationAmount(undefined) // Reset input
    } catch (error) {
      console.error("Donation error:", error)
      showMessage("Donation failed. Please check the console.", 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- UI ---
  return (
    <div className="main-container">
      {/* Sticky Nav Bar */}
      <nav className="nav-bar">
        <div className="container nav-container">
          <h2 className="logo"> 🪔 Anjali DAO</h2>
          <div className="nav-links">
            <a href="#hero">Home</a>
            <a href="#donate">Donate</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
<section id="hero" className="hero">
  <div className="container">
    <div className="hero-content">
      <h1>
        Welcome to <span>Anjali DAO</span>
      </h1>
      <p>
        Donate <span className="highlight">ALGO</span> to participate in the festival and receive{" "}
        <span className="highlight-alt">ANJ governance tokens</span>.
      </p>
      <p className="cta-text">🌟 Be part of the community revolution!</p>
    </div>
  </div>
</section>

      {/* Donation Section */}
      <section id="donate" className="donation-section">
        <div className="container">
          <div className="donation-card">
            <h2 className="donation-title">Support Our Cause</h2>
            <p className="donation-subtitle">Your contribution makes a real difference.</p>

            {/* --- Transaction Feedback Message --- */}
            {message && (
              <div className={`message-box ${message.type}`}>
                {message.text}
              </div>
            )}

            {!activeAddress && (
              <button className="btn btn-primary connect-btn" onClick={toggleWalletModal}>
                🚀 Connect Wallet to Donate
              </button>
            )}

            {activeAddress && (
              <>
                <div className="wallet-address">
                  ✅ Connected: <span>{activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}</span>
                </div>
                <div className="input-group">
                  <label htmlFor="donation-amount" className="sr-only">Amount</label>
                  <input
                    id="donation-amount"
                    className="donation-input"
                    type="number"
                    placeholder="e.g., 10"
                    value={donationAmount || ""}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    min="0.1"
                    step="0.001"
                    disabled={isSubmitting}
                  />
                  <span className="input-currency">ALGO</span>
                </div>
                <div className="btn-group">
                  <button className="btn btn-secondary" onClick={handleOptIn} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "✨ Opt-In to ANJ"}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleDonate}
                    disabled={isSubmitting || !donationAmount || donationAmount <= 0}
                  >
                    {isSubmitting ? "Processing..." : `💰 Donate ${donationAmount > 0 ? `${donationAmount} ALGO` : ""}`}
                  </button>
                </div>
                <p className="info-text">
                  Note: Please ensure you have testnet ALGO for transaction fees.
                </p>
              </>
            )}
          </div>
        </div>
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>📖 About Onjoli DAO</h2>
          <p>
            Onjoli DAO is a community-driven initiative to empower festival donations with blockchain
            transparency and rewards. Our goal is to create a decentralized ecosystem where every
            contribution is valued and every voice is heard.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>📬 Contact Us</h2>
          <p>For inquiries and support, please reach out to us.</p>
          <a href="mailto:support@onjoli.org" className="btn btn-primary">Email: support@onjoli.org</a>
        </div>
      </section>
    </div>
  )
}

export default Home
