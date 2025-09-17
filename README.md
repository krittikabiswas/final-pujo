
# 🪔 Anjali Dao - Durga Puja DApp for culture, community and transparency on Algorand 🎉


**Anjali   Dao** is a decentralized application (dApp) built on the **Algorand blockchain** 🟢✨ that brings **transparency, democracy, and community participation** to the management of Durga Puja festivities.

**Anjali DAO Testnet application ID: 745892582**

It functions as a **Decentralized Autonomous Organization (DAO)** 🤝, allowing community members to:
✅ Propose ideas 💡
✅ Vote on them 🗳️
✅ Manage funds transparently 💰

The vision is simple: **bring the collaborative spirit of community pujo into a modern, digital, and decentralized framework**. 🌐🙏



## ✨ Features

🌸 **Donation System** – Any person can donate Algos for idol selection 🪔, cultural programs 🎶, or budget allocation 📊.
🗳️ **Decentralized Voting** – Every vote is stored on the blockchain → transparent ✅ tamper-proof 🔒.
💰 **Transparent Treasury** – All donations (*anjoli*) and expenses are recorded on-chain with full clarity.
👥 **Community Governance** – True democracy where power lies in the hands of the devotees and community.



## 🏛 Project Architecture

This project is structured as a **monorepo** ⚙️ with two main sub-projects:

1. **DurgaDao-contracts** 📝

   * Backend logic (smart contracts).
   * The contract, named **AnjoliDAO**, is written in **Puya** 🐍✨ (Python dialect → TEAL).
   * Handles proposal creation, voting, and fund management.

2. **DurgaDao-frontend** 💻

   * User-facing web app built with **React + TypeScript** ⚡.
   * Connects with wallets (like **Pera Wallet** 📲).
   * Interacts with the smart contract on **Algorand TestNet** 🧪.



## 🚀 Getting Started

Follow these steps to set up and run the project locally 🔧:

### ✅ Prerequisites

🔹 Git – for cloning repo
🔹 Python ≥ 3.10 🐍
🔹 Poetry – dependency management 🎭
🔹 Node.js ≥ 18 ⚡
🔹 AlgoKit – official Algorand CLI [📖 Installation Guide](https://github.com/algorandfoundation/algokit-cli#install)
🔹 Algorand Wallet (e.g., **Pera Wallet**) with TestNet ALGOs from [💧 TestNet Dispenser](https://bank.testnet.algorand.network)
🔹 Algorand SDK 

---

### ⚙️ Installation & Setup

#### 1️⃣ Backend – Smart Contracts

```bash
# Clone the repository
git clone https://github.com/krittikabiswas/final-pujo.git
cd final-pujo/

# Navigate to contracts
cd projects/DurgaDao-contracts

# Install Python dependencies
poetry install

# Compile smart contract
algokit compile contract.py

# Deploy contract to TestNet
algokit project deploy testnet
```

👉 Copy the **App ID** that appears after deployment! 🔑

---

#### 2️⃣ Frontend – React dApp

```bash
# Go to frontend
cd projects/DurgaDao-frontend

# Install dependencies
npm install

# If not auto-created, make .env.testnet file and add:
# VITE_ANJOLI_DAO_APP_ID=YOUR_APP_ID_HERE

# Start development server
npm run dev
```

💡 The app will run at **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 💻 How to Use the dApp

1. 🔗 **Connect Wallet** – Link your Pera Wallet (TestNet mode).
2. 💸 **Donate (Algo)** – Contribute to the treasury directly.
3. 🪔 **Get Tokens (Anjali)** – Get tokens as rewards for your donation.
4. 🗳️ **Vote** – Have your say on community decisions.
5. 💸 **View Balance** – Track your token balance

---

## 🛠 Technology Stack

🔹 Blockchain – **Algorand (TestNet)**
🔹 Smart Contracts – **Algopy**
🔹 Framework – **AlgoKit**
🔹 Frontend – **React + TypeScript + Vite**
🔹 Styling – **CSS** 🎨

---

## 📜 License

📂 Licensed under the **MIT License**. See LICENSE for details.
Project made by Team Sondesh at Algorand Hackathon 2025
