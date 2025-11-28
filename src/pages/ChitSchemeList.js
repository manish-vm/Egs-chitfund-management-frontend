import React, { useEffect, useState } from 'react';
import { getAllChitSchemes } from '../services/chit';
import Header from '../components/Header';
import ChitSchemeCard from '../components/ChitSchemeCard';
import './ChitSchemeList.css';

const ChitSchemeList = () => {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await getAllChitSchemes();
        setSchemes(data);
      } catch (err) {
        console.error('Failed to fetch chit schemes:', err);
      }
    };

    fetchSchemes();
  }, []);

  return (
    <div className="chit-list-container">
      <h1 className="chit-list-title">Available Chit Schemes</h1>

      <div className="chit-grid">
        {schemes.length > 0 ? (
          schemes.map((scheme) => (
            <ChitSchemeCard
              key={scheme._id}
              scheme={scheme}
              onJoin={(id) => console.log('Joining scheme', id)}
            />
          ))
        ) : (
          <p className="no-schemes">No chit schemes found.</p>
        )}
      </div>
    </div>
  );
};

export default ChitSchemeList;
