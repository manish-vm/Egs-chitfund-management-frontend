import React, { useEffect, useState } from 'react';
import { getAllChitSchemes } from '../services/chit';
import { useAuth } from '../context/AuthContext';
import PayContribution from './PayContribution';
import { LuClock, LuIndianRupee } from 'react-icons/lu';
import '../components/MyChitsWithPay.css';

const MyChitsWithPay = () => {
  const { user } = useAuth();
  const [joinedChits, setJoinedChits] = useState([]);
  const [selectedChit, setSelectedChit] = useState(null);

  useEffect(() => {
    async function fetchChits() {
      try {
        const res = await getAllChitSchemes();

        // Filter chits where user is joined (supports multiple formats)
        const filtered = res.filter(scheme =>
          scheme.joinedUsers?.some(
            (u) =>
              u === user._id ||            // case: string ID
              u?._id === user._id ||       // case: { _id: "123" }
              u?.user?._id === user._id    // case: { user: { _id: "123" }, isApproved: true }
          )
        );

        setJoinedChits(filtered);
      } catch (err) {
        console.error("Error fetching joined chits:", err);
      }
    }

    if (user?._id) fetchChits();
  }, [user]);

  return (
    <div className="mychits-main-wrapper-1123">
      {/* Left side - list of joined chits */}
      <div className="mychits-left-1123">
        <h2 className="mychits-title-1123">Your Joined Chit Schemes</h2>

        {joinedChits.length === 0 ? (
          <p className="mychits-empty-1123">
            You haven't joined any chit schemes yet.
          </p>
        ) : (
          joinedChits.map((chit) => (
            <div key={chit._id} className="mychits-card-1123">
              <h3 className="chit-name-1123">{chit.name}</h3>

              <p className="chit-info-1123">
                <LuIndianRupee className="icon-1123" /> ₹{chit.amount}
              </p>

              <p className="chit-info-1123">
                <LuClock className="icon-1123" /> {chit.durationInMonths} months
              </p>

              <button
                onClick={() => setSelectedChit(chit)}
                className="pay-btn-1123"
              >
                💸 Pay Contribution
              </button>
            </div>
          ))
        )}
      </div>

      {/* Right side - contribution payment */}
      <div className="mychits-right-1123">
        {selectedChit ? (
          <PayContribution userId={user._id} chit={selectedChit} />
        ) : (
          <div className="placeholder-1123">
            Select a chit to view payment options.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChitsWithPay;
