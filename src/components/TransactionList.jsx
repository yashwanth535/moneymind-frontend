import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [filterType, setFilterType] = useState('Debit');
  const [filterMode, setFilterMode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debits, setDebits] = useState([]);
  const [credits, setCredits] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const debitResponse = await fetch(`${API_URL}/fetch-transactons/fetch-debits`);
      if (debitResponse.ok) {
        const debitData = await debitResponse.json();
        setDebits(debitData);
        setFilteredTransactions(debitData);
      } else {
        alert('Error fetching debit transactions');
      }

      const creditResponse = await fetch(`${API_URL}/fetch-transactons/fetch-credits`);
      if (creditResponse.ok) {
        const creditData = await creditResponse.json();
        setCredits(creditData);
      } else {
        alert('Error fetching credit transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const applyFilters = () => {
    let filteredArray = filterType === "Debit" ? debits : credits;

    filteredArray = filteredArray.filter(item => {
      const itemDate = new Date(item.date);
      const itemMonthYear = itemDate.toISOString().slice(0, 7);

      if (startDate && itemMonthYear < startDate) return false;
      if (endDate && itemMonthYear > endDate) return false;
      if (filterMode && item.modeOfPayment !== filterMode) return false;
      if (searchQuery && !item.purpose?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });

    setFilteredTransactions(filteredArray);
  };

  const handleEdit = async (id, type) => {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    const staticFields = row.querySelectorAll('.static');
    const editFields = row.querySelectorAll('.edit');
    const editBtn = row.querySelector('.edit-btn');
    const saveBtn = row.querySelector('.save-btn');

    staticFields.forEach(el => el.classList.add('hidden'));
    editFields.forEach(el => el.classList.remove('hidden'));
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
  };

  const handleSave = async (id, type) => {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    const inputs = row.getElementsByTagName('input');
    if (inputs.length < 4) return;

    const amount = inputs[0].value;
    const date = inputs[1].value;
    const purpose = type === 'Debit' ? inputs[2].value : null;
    const modeOfPayment = type === 'Debit' ? inputs[3].value : inputs[2].value;
    const bank = type === 'Credit' ? inputs[3].value : null;

    if (!amount || !date || (!purpose && type === 'Debit') || !modeOfPayment || (!bank && type === 'Credit')) {
      alert("All fields are required!");
      return;
    }

    try {
      const endpoint = type === 'Debit' 
        ? `${API_URL}/fetch-transactons/edit-debit/${id}`
        : `${API_URL}/fetch-transactons/edit-credit/${id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          date,
          ...(type === 'Debit' ? { purpose } : { bank }),
          modeOfPayment,
        }),
      });

      if (response.ok) {
        alert('Transaction updated successfully');
        fetchTransactions();
      } else {
        alert('Error updating transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const endpoint = type === 'Debit'
        ? `${API_URL}/fetch-transactons/delete-debit/${id}`
        : `${API_URL}/fetch-transactons/delete-credit/${id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        alert('Transaction deleted successfully');
        fetchTransactions();
      } else {
        alert('Error deleting transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const filterVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col"
    >
      {/* Filter Section */}
      <motion.div
        variants={filterVariants}
        className="sticky top-0 w-full mb-4 flex gap-4 flex-wrap justify-center items-center p-4 bg-[#1e1e2f] rounded-lg z-10 shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <label className="text-white text-[15px]">Type:</label>
          <select 
            className="px-3 py-2.5 text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilteredTransactions(e.target.value === 'Debit' ? debits : credits);
            }}
          >
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <label className="text-white text-[15px]">Mode:</label>
          <select 
            className="px-3 py-2.5 text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="">All Modes</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <label className="text-white text-[15px]">From:</label>
          <input 
            type="date" 
            className="px-3 py-2.5 text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <label className="text-white text-[15px]">To:</label>
          <input 
            type="date" 
            className="px-3 py-2.5 text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <label className="text-white text-[15px]">Search:</label>
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="px-3 py-2.5 text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={applyFilters}
          className="px-3 py-2.5 text-sm bg-[#71a9d1] text-black rounded-md hover:rounded-lg active:border-[#83bce3] transition-all duration-300"
        >
          Apply Filters
        </motion.button>
      </motion.div>

      {/* Table Container */}
      <motion.div
        variants={tableVariants}
        className="w-full overflow-x-auto"
      >
        <table className="w-full border-collapse bg-[#1e1e2f] text-white shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
          <thead>
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <th className="p-3 text-left bg-[#2a2a40] text-[#d1d1e1] border-b border-[#333]">Date</th>
              <th className="p-3 text-left bg-[#2a2a40] text-[#d1d1e1] border-b border-[#333]">Amount</th>
              {filterType === 'Debit' && (
                <th className="p-3 text-left bg-[#2a2a40] text-[#d1d1e1] border-b border-[#333]">Purpose</th>
              )}
              <th className="p-3 text-left bg-[#2a2a40] text-[#d1d1e1] border-b border-[#333]">Mode</th>
              {filterType === 'Credit' && (
                <th className="p-3 text-left bg-[#2a2a40] text-[#d1d1e1] border-b border-[#333]">Bank</th>
              )}
              <th className="p-3 text-left bg-[#2a2a40] text-[#d1d1e1] border-b border-[#333]">Actions</th>
            </motion.tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody>
              {filteredTransactions.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td 
                    colSpan={filterType === 'Debit' ? 5 : 5} 
                    className="text-center py-4 text-lg font-bold text-[#e0e0e0]"
                  >
                    No {filterType}s Found
                  </td>
                </motion.tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction._id}
                    id={`row-${transaction._id}`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#33334c] group"
                  >
                    <td className="px-2.5 py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                      <span className="static">{new Date(transaction.date).toLocaleDateString()}</span>
                      <input type="date" className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded" defaultValue={transaction.date.split('T')[0]} />
                    </td>
                    <td className="px-2.5 py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                      <span className="static">₹{transaction.amount}</span>
                      <input type="number" className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded" defaultValue={transaction.amount} />
                    </td>
                    {filterType === 'Debit' && (
                      <td className="px-2.5 py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                        <span className="static">{transaction.purpose}</span>
                        <input type="text" className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded" defaultValue={transaction.purpose} />
                      </td>
                    )}
                    <td className="px-2.5 py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                      <span className="static">{transaction.modeOfPayment}</span>
                      <input type="text" className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded" defaultValue={transaction.modeOfPayment} />
                    </td>
                    {filterType === 'Credit' && (
                      <td className="px-2.5 py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                        <span className="static">{transaction.bank}</span>
                        <input type="text" className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded" defaultValue={transaction.bank} />
                      </td>
                    )}
                    <td className="px-2.5 py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="edit-btn px-2 py-1 bg-[#71a9d1] text-black rounded mr-2 hover:bg-[#5a8cb3]"
                        onClick={() => handleEdit(transaction._id, filterType)}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="save-btn hidden px-2 py-1 bg-[#71a9d1] text-black rounded mr-2 hover:bg-[#5a8cb3]"
                        onClick={() => handleSave(transaction._id, filterType)}
                      >
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(transaction._id, filterType)}
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default TransactionList;
