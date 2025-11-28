import React, { useEffect, useState } from 'react';
import { getChitHistory } from '../services/history';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const ChitHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getChitHistory();
        setHistory(data);
      } catch (err) {
        console.error('Error fetching chit history:', err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title="Chit History" />
        <div className="content">
          <h2>Chit Payment History</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Chit Scheme</th>
                <th>Amount Paid</th>
                <th>Member</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.schemeName}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.memberName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChitHistory;
