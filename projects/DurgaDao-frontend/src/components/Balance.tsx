// src/components/Balance_Info.tsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import './Balance_Info.css';

const BalanceInfo: React.FC = () => {
  const { activeAddress } = useWallet();
  const [anjBalance, setAnjBalance] = useState(0);

  // Function to read and set balance from storage
  const updateBalance = () => {
    if (activeAddress) {
      const storageKey = `anjali-dao-donation-${activeAddress}`;
      const savedDonation = sessionStorage.getItem(storageKey);
      if (savedDonation) {
        setAnjBalance(Number(savedDonation) * 5);
      } else {
        setAnjBalance(0);
      }
    }
  };

  // ✅ THIS EFFECT IS NEW
  // It runs on initial load and listens for the 'storageUpdated' signal
  useEffect(() => {
    updateBalance(); // Check balance when component loads

    // Listen for the custom event sent from the Voting component
    window.addEventListener('storageUpdated', updateBalance);

    // Cleanup: remove the listener when the component is unmounted
    return () => {
      window.removeEventListener('storageUpdated', updateBalance);
    };
  }, [activeAddress]);

  if (!activeAddress) {
    return null;
  }

  return (
    <div className="balance-info-card">
      <h4>Your ANJ Token Balance</h4>
      <p className="balance-amount">
        {anjBalance.toLocaleString()} <span>ANJ</span>
      </p>
      <small>Balance is based on your donations in the current session.</small>
    </div>
  );
};

export default BalanceInfo;
