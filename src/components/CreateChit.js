import React, { useState } from 'react';
import { FaMoneyBillWave, FaRegClock, FaUsers, FaFileSignature } from 'react-icons/fa';

const CreateChit = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [members, setMembers] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name, amount, duration, totalMembers: members });
    setName('');
    setAmount('');
    setDuration('');
    setMembers('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gradient-to-br from-white to-gray-100 p-8 rounded-2xl shadow-2xl transition duration-300 ease-in-out">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Chit Scheme</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="flex items-center text-gray-600 mb-1 font-medium">
            <FaFileSignature className="mr-2 text-blue-600" /> Scheme Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="flex items-center text-gray-600 mb-1 font-medium">
            <FaMoneyBillWave className="mr-2 text-green-600" /> Amount (₹)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="flex items-center text-gray-600 mb-1 font-medium">
            <FaRegClock className="mr-2 text-purple-600" /> Duration (months)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="flex items-center text-gray-600 mb-1 font-medium">
            <FaUsers className="mr-2 text-pink-600" /> Total Members
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-xl"
        >
          Create Chit
        </button>
      </form>
    </div>
  );
};

export default CreateChit;
