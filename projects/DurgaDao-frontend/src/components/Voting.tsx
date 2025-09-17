// src/components/Voting.tsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import './Voting_Css.css';

// --- Example Poll Data with Deadlines ---
const polls = [
  {
    id: 1,
    question: 'What should be the theme for the next community event?',
    options: ['Cultural Heritage', 'Modern Tech Fair', 'Eco-Friendly Initiative'],
    cost: 2,
    deadline: 'Closes: September 25, 2025', // <-- DEADLINE ADDED
  },
  {
    id: 2,
    question: 'Which charity should receive next month\'s treasury donation?',
    options: ['Local Education Fund', 'Animal Welfare Shelter', 'Global Health Org'],
    cost: 5,
    deadline: 'Closes: October 5, 2025', // <-- DEADLINE ADDED
  },
];

const Voting: React.FC = () => {
  const { activeAddress } = useWallet();
  const [anjBalance, setAnjBalance] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  // Function to read and set balance from storage
  const updateBalance = () => {
    if (activeAddress) {
      const storageKey = `anjali-dao-donation-${activeAddress}`;
      const savedDonation = sessionStorage.getItem(storageKey) || '0';
      setAnjBalance(Number(savedDonation) * 5);
    }
  };

  // Run on initial load and when a storage update event is received
  useEffect(() => {
    updateBalance(); // Initial balance check
    window.addEventListener('storageUpdated', updateBalance); // Listen for updates
    return () => {
      window.removeEventListener('storageUpdated', updateBalance); // Clean up listener
    };
  }, [activeAddress]);

  const handleOptionChange = (pollId: number, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [pollId]: option }));
  };

  const handleVote = (pollId: number, cost: number) => {
    if (!activeAddress || anjBalance < cost || !selectedOptions[pollId]) {
      // Basic checks are handled by button's disabled state, but this is a safeguard.
      alert('Cannot vote. Please check your balance and selection.');
      return;
    }

    setIsSubmitting(pollId);

    setTimeout(() => {
      const newBalance = anjBalance - cost;
      const newDonationEquivalent = newBalance / 5;
      const storageKey = `anjali-dao-donation-${activeAddress}`;

      sessionStorage.setItem(storageKey, newDonationEquivalent.toString());

      // ✅ BROADCAST a signal that storage has changed
      window.dispatchEvent(new Event('storageUpdated'));

      alert(`✅ Vote cast! ${cost} ANJ has been used.`);
      setIsSubmitting(null);
    }, 1500);
  };

  return (
    <section id="voting" className="section">
      <div className="container">
        <h2 className="section-heading">Community Proposals</h2>
        <p className="section-subheading">
          Use your ANJ tokens to have a say in our community's future.
        </p>

        <div className="voting-container">
          {polls.map((poll) => (
            <div key={poll.id} className="poll-card">
              <h3 className="poll-question">{poll.question}</h3>
              <div className="poll-meta">
                <p className="poll-cost">Requires: {poll.cost} ANJ</p>
                <p className="poll-deadline">{poll.deadline}</p> {/* <-- DEADLINE DISPLAYED */}
              </div>

              <div className="poll-options">
                {poll.options.map((option) => (
                  <label key={option} className="poll-option">
                    <input
                      type="radio"
                      name={`poll-${poll.id}`}
                      value={option}
                      checked={selectedOptions[poll.id] === option}
                      onChange={() => handleOptionChange(poll.id, option)}
                      disabled={isSubmitting === poll.id}
                    />
                    {option}
                  </label>
                ))}
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleVote(poll.id, poll.cost)}
                disabled={isSubmitting === poll.id || anjBalance < poll.cost || !selectedOptions[poll.id]}
              >
                {isSubmitting === poll.id ? 'Casting Vote...' : 'Vote Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Voting;
