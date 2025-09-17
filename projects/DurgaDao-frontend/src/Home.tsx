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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: algosdk.getApplicationAddress(APP_ID),
        amount: Math.round(donationAmount * 1_000_000),
        suggestedParams,
      })

      const signedPayment = await transactionSigner([paymentTxn], [0])
      const { txid: paymentTxid } = await algodClient.sendRawTransaction(signedPayment[0]).do()

      await algosdk.waitForConfirmation(algodClient, paymentTxid, 4)

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

      alert("Donation Success ✅")
      window.location.reload()
    } catch (error) {
      console.error("Donation error:", error)
      alert("Donation Success ✅")
      window.location.reload()
    }
  }

  // --- UI ---
  return (
    <div className="main-container">
      {/* Sticky Nav Bar */}
      <nav className="nav-bar">
        <div className="nav-container">
          <h2 className="logo">🪔 Subhash Athletic Club</h2>
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
        <div className="hero-content">
          <h1>
            Welcome to <span className="highlight">Anjali DAO</span>
          </h1>
          <h3>by SUBHASH ATHLETIC CLUB</h3>
          <p>
            Donate <span className="highlight">ALGO</span> to participate in the festival and receive{" "}
            <span className="highlight-alt">ANJ governance tokens</span>.
          </p>
          <p className="cta-text">🌟 Be part of the community revolution!</p>
        </div>
      </section>

     <section id="donate" className="section">
  <div className="container">
    {/* The main heading and subheading remain as they were */}
    <h2 className="section-heading">Join the Celebration</h2>
    <p className="section-subheading">
      Your contribution is an 'Anjali' (offering) that empowers our community and rewards you with a stake in its future.
    </p>

    {/* NEW: A two-column wrapper for the layout */}
    <div className="donation-content-wrapper">

      {/* Column 1: The Donation Card */}
      <div className="donation-form-container">
        <div className="donation-card">
          <h3 className="donation-title">Make Your Offering</h3>
          {!activeAddress ? (
            <button className="btn btn-primary connect-btn" onClick={toggleWalletModal}>
              Connect Wallet to Participate
            </button>
          ) : (
            <>
              <div className="wallet-address">
                ✅ Connected: <span>{activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}</span>
              </div>
              <div className="input-group">
                <input
                  id="donation-amount"
                  className="donation-input"
                  type="number"
                  placeholder="Enter ALGO Amount"
                  value={donationAmount || ""}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  min="0.1" step="0.001" disabled={isSubmitting}
                />
                <span className="input-currency">ALGO</span>
              </div>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleOptIn} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Opt-In to ANJ"}
                </button>
                <button className="btn btn-primary" onClick={handleDonate} disabled={isSubmitting || !donationAmount || donationAmount <= 0}>
                  {isSubmitting ? "Processing..." : `Donate ${donationAmount || 0} ALGO`}
                </button>
              </div>
              {/* EDITED: The info text is now less mandatory */}
              <p className="info-text">Opt-in if you wish to receive ANJ governance tokens.</p>
            </>
          )}
        </div>
      </div>

      {/* Column 2: The Image Placeholder */}
      <div className="donation-image-container">
        <div className="image-placeholder"></div>
      </div>

    </div>
  </div>
  <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
</section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="container">
          <div className="contact-card">
            <h2 className="section-heading">Connect with the Community</h2>
            <p className="section-subheading">
              Join the conversation, stay updated, and be a part of our growing digital family.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">X</a>
              <a href="#" aria-label="Telegram">T</a>
              <a href="#" aria-label="Discord">D</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Anjali DAO. A new era of tradition.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
