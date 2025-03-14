import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Save, Trash2, Filter, RotateCcw } from 'lucide-react';

const TransactionList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [filterType, setFilterType] = useState('Debit');
  const [filterMode, setFilterMode] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debits, setDebits] = useState([]);
  const [credits, setCredits] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  // Add notification component
  const Notification = ({ message, type }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.1 }}
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white min-w-[200px] text-center`}
    >
      {message}
    </motion.div>
  );

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 1000);
  };

  useEffect(() => {
    fetchTransactions();
    fetchProfile();
  }, []);

  // Add useEffect to update active filters when any filter changes
  useEffect(() => {
    const newActiveFilters = [];
    if (startDate || endDate) {
      newActiveFilters.push('Date Range');
    }
    if (filterMode) {
      newActiveFilters.push(`Mode: ${filterMode}`);
    }
    if (filterCategory) {
      newActiveFilters.push(`Category: ${filterCategory}`);
    }
    setActiveFilters(newActiveFilters);
  }, [startDate, endDate, filterMode, filterCategory]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch all debits without filters initially
      const debitResponse = await fetch(`${API_URL}/fetch-transactions/fetch-debits`, {
        credentials: 'include'
      });
      if (debitResponse.ok) {
        const debitData = await debitResponse.json();
        setDebits(debitData);
        if (filterType === 'Debit') {
          setFilteredTransactions(debitData);
        }
      } else {
        alert('Error fetching debit transactions');
      }

      const creditResponse = await fetch(`${API_URL}/fetch-transactions/fetch-credits`, {
        credentials: 'include'
      });
      if (creditResponse.ok) {
        const creditData = await creditResponse.json();
        setCredits(creditData);
        if (filterType === 'Credit') {
          setFilteredTransactions(creditData);
        }
      } else {
        alert('Error fetching credit transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const resetFilters = () => {
    setFilterMode('');
    setFilterCategory('');
    setStartDate('');
    setEndDate('');
    setActiveFilters([]);
    // Reset filtered transactions based on current type
    setFilteredTransactions(filterType === 'Debit' ? debits : credits);
  };

  const applyFilters = () => {
    let filteredArray = filterType === "Debit" ? debits : credits;

    // Filter the transactions
    filteredArray = filteredArray.filter(item => {
      const itemDate = new Date(item.date);
      const itemMonthYear = itemDate.toISOString().slice(0, 7);

      if (startDate && itemMonthYear < startDate) {
        return false;
      }
      if (endDate && itemMonthYear > endDate) {
        return false;
      }
      if (filterMode && item.modeOfPayment !== filterMode) {
        return false;
      }
      if (filterType === 'Debit' && filterCategory && item.purpose !== filterCategory) {
        return false;
      }

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

    // Find the current transaction data
    const transaction = filteredTransactions.find(t => t._id === id);
    if (!transaction) return;

    // Get all input fields
    const dateInput = row.querySelector('input[type="date"]');
    const amountInput = row.querySelector('input[type="number"]');
    const purposeInput = type === 'Debit' ? row.querySelector('select') : null;
    const modeInput = type === 'Debit' ? row.querySelectorAll('input[type="text"]')[0] : row.querySelectorAll('input[type="text"]')[0];
    const bankInput = type === 'Credit' ? row.querySelectorAll('input[type="text"]')[1] : null;

    // Set values for the input fields
    if (dateInput) dateInput.value = transaction.date.split('T')[0];
    if (amountInput) amountInput.value = transaction.amount;
    
    if (type === 'Debit') {
      if (purposeInput) purposeInput.value = transaction.purpose;
      if (modeInput) modeInput.value = transaction.modeOfPayment;
    } else {
      if (modeInput) modeInput.value = transaction.modeOfPayment;
      if (bankInput) bankInput.value = transaction.bank;
    }

    // Toggle visibility
    staticFields.forEach(el => el.classList.add('hidden'));
    editFields.forEach(el => el.classList.remove('hidden'));
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
  };

  const handleSave = async (id, type) => {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    // Get input fields directly by type
    const dateInput = row.querySelector('input[type="date"]');
    const amountInput = row.querySelector('input[type="number"]');
    const purposeInput = type === 'Debit' ? row.querySelector('select') : null;
    const modeInput = type === 'Debit' ? row.querySelectorAll('input[type="text"]')[0] : row.querySelectorAll('input[type="text"]')[0];
    const bankInput = type === 'Credit' ? row.querySelectorAll('input[type="text"]')[1] : null;

    // Get values from inputs
    const amount = amountInput?.value;
    const date = dateInput?.value;
    const purpose = type === 'Debit' ? purposeInput?.value : null;
    const modeOfPayment = modeInput?.value;
    const bank = type === 'Credit' ? bankInput?.value : null;

    // Validate required fields
    if (!amount || !date || (!purpose && type === 'Debit') || !modeOfPayment || (!bank && type === 'Credit')) {
      showNotification('All fields are required!', 'error');
      return;
    }

    try {
      const endpoint = type === 'Debit' 
        ? `${API_URL}/fetch-transactions/edit-debit/${id}`
        : `${API_URL}/fetch-transactions/edit-credit/${id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          date,
          ...(type === 'Debit' ? { purpose } : { bank }),
          modeOfPayment,
        }),
      });

      if (response.ok) {
        // Reset visibility of fields after successful save
        const staticFields = row.querySelectorAll('.static');
        const editFields = row.querySelectorAll('.edit');
        const editBtn = row.querySelector('.edit-btn');
        const saveBtn = row.querySelector('.save-btn');

        staticFields.forEach(el => el.classList.remove('hidden'));
        editFields.forEach(el => el.classList.add('hidden'));
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');

        showNotification('Transaction updated successfully');
        fetchTransactions();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Error updating transaction', 'error');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showNotification(error.message || 'Error updating transaction', 'error');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await fetch(`${API_URL}/fetch-transactions/delete/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        showNotification('Transaction deleted successfully');
        
        // Update local state immediately
        if (type === 'Debit') {
          setDebits(prevDebits => prevDebits.filter(debit => debit._id !== id));
          setFilteredTransactions(prevTransactions => 
            prevTransactions.filter(transaction => transaction._id !== id)
          );
        } else {
          setCredits(prevCredits => prevCredits.filter(credit => credit._id !== id));
          setFilteredTransactions(prevTransactions => 
            prevTransactions.filter(transaction => transaction._id !== id)
          );
        }
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Error deleting transaction', 'error');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showNotification('Error deleting transaction', 'error');
    }
  };

  // Add handleRemoveFilter function
  const handleRemoveFilter = (filterType) => {
    switch (filterType) {
      case 'Date Range':
        setStartDate('');
        setEndDate('');
        break;
      case filterType.startsWith('Mode:') && filterType:
        setFilterMode('');
        break;
      case filterType.startsWith('Category:') && filterType:
        setFilterCategory('');
        break;
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20D982] mx-auto"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col px-2 md:px-0"
    >
      <AnimatePresence>
        {notification.show && (
          <Notification message={notification.message} type={notification.type} />
        )}
      </AnimatePresence>

      {/* Filter Section */}
      <motion.div
        variants={filterVariants}
        className="sticky top-0 w-full mb-4 flex flex-col gap-2 p-2 md:p-4 bg-[#1e1e2f] rounded-lg z-10 shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
      >
        {/* Filter Container */}
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Type and Category Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 md:w-40"
            >
              <label className="text-white text-xs md:text-sm min-w-[50px]">Type:</label>
              <select 
                className="flex-1 px-2 py-1.5 text-xs md:text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilteredTransactions(e.target.value === 'Debit' ? debits : credits);
                  resetFilters();
                }}
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </motion.div>

            {filterType === 'Debit' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-1.5 md:w-48"
              >
                <label className="text-white text-xs md:text-sm min-w-[50px]">Cat:</label>
                <select 
                  className="flex-1 px-2 py-1.5 text-xs md:text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All</option>
                  {profile?.customCategories?.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 md:w-40"
            >
              <label className="text-white text-xs md:text-sm min-w-[50px]">Mode:</label>
              <select 
                className="flex-1 px-2 py-1.5 text-xs md:text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </motion.div>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 flex-1"
            >
              <label className="text-white text-xs md:text-sm min-w-[50px]">From:</label>
              <input 
                type="date" 
                className="flex-1 px-2 py-1.5 text-xs md:text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 flex-1"
            >
              <label className="text-white text-xs md:text-sm min-w-[50px]">To:</label>
              <input 
                type="date" 
                className="flex-1 px-2 py-1.5 text-xs md:text-sm text-white bg-[#2a2a40] border border-[#444] rounded-md focus:border-[#83bce3] focus:shadow-[0_0_5px_#83bce3] outline-none transition-all duration-300"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:ml-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={applyFilters}
                className="p-1.5 md:p-2 bg-[#71a9d1] text-black rounded-md hover:bg-[#5a8cb3] transition-all duration-300"
              >
                <Filter size={16} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="p-1.5 md:p-2 bg-[#444] text-white rounded-md hover:bg-[#555] transition-all duration-300"
              >
                <RotateCcw size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-[#20D982]/10 text-[#20D982] rounded-full text-[10px] md:text-xs group hover:bg-[#20D982]/20 transition-all duration-300"
              >
                <span>{filter}</span>
                <button
                  onClick={() => handleRemoveFilter(filter)}
                  className="w-3 h-3 flex items-center justify-center rounded-full hover:bg-[#20D982]/30 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Table Container */}
      <motion.div
        variants={tableVariants}
        className="w-full bg-[#1e1e2f] rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#2a2a40] sticky top-0">
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <th className="whitespace-nowrap p-1.5 md:p-3 text-left text-[#d1d1e1] border-b border-[#333] text-xs md:text-sm">Date</th>
                <th className="whitespace-nowrap p-1.5 md:p-3 text-left text-[#d1d1e1] border-b border-[#333] text-xs md:text-sm">Amount</th>
                {filterType === 'Debit' && (
                  <th className="whitespace-nowrap p-1.5 md:p-3 text-left text-[#d1d1e1] border-b border-[#333] text-xs md:text-sm">Purpose</th>
                )}
                <th className="whitespace-nowrap p-1.5 md:p-3 text-left text-[#d1d1e1] border-b border-[#333] text-xs md:text-sm">Mode</th>
                {filterType === 'Credit' && (
                  <th className="whitespace-nowrap p-1.5 md:p-3 text-left text-[#d1d1e1] border-b border-[#333] text-xs md:text-sm">Bank</th>
                )}
                <th className="whitespace-nowrap p-1.5 md:p-3 text-center text-[#d1d1e1] border-b border-[#333] text-xs md:text-sm">Actions</th>
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
                      className="text-center py-4 text-sm md:text-base font-bold text-[#e0e0e0]"
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
                      className="hover:bg-[#33334c] group text-xs md:text-sm"
                    >
                      <td className="px-1.5 md:px-2.5 py-1.5 md:py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                        <span className="static">{new Date(transaction.date).toLocaleDateString()}</span>
                        <input 
                          type="date" 
                          className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded text-xs" 
                          defaultValue={transaction.date.split('T')[0]} 
                        />
                      </td>
                      <td className="px-1.5 md:px-2.5 py-1.5 md:py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                        <span className="static">₹{transaction.amount}</span>
                        <input 
                          type="number" 
                          className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded text-xs" 
                          defaultValue={transaction.amount} 
                        />
                      </td>
                      {filterType === 'Debit' && (
                        <td className="px-1.5 md:px-2.5 py-1.5 md:py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                          <span className="static">{transaction.purpose}</span>
                          <select 
                            className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded text-xs" 
                            defaultValue={transaction.purpose}
                          >
                            {profile?.customCategories?.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td className="px-1.5 md:px-2.5 py-1.5 md:py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                        <span className="static">{transaction.modeOfPayment}</span>
                        <input 
                          type="text" 
                          className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded text-xs" 
                          defaultValue={transaction.modeOfPayment} 
                        />
                      </td>
                      {filterType === 'Credit' && (
                        <td className="px-1.5 md:px-2.5 py-1.5 md:py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                          <span className="static">{transaction.bank}</span>
                          <input 
                            type="text" 
                            className="edit hidden w-full bg-[#2a2a40] text-white px-2 py-1 rounded text-xs" 
                            defaultValue={transaction.bank} 
                          />
                        </td>
                      )}
                      <td className="px-1.5 md:px-2.5 py-1.5 md:py-3 bg-[#252535] text-[#e0e0e0] border-b border-[#333] group-hover:bg-[#33334c] group-hover:text-white">
                        <div className="flex gap-1 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="edit-btn p-1 bg-[#71a9d1] text-black rounded hover:bg-[#5a8cb3]"
                            onClick={() => handleEdit(transaction._id, filterType)}
                          >
                            <Pencil size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="save-btn hidden p-1 bg-[#71a9d1] text-black rounded hover:bg-[#5a8cb3]"
                            onClick={() => handleSave(transaction._id, filterType)}
                          >
                            <Save size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleDelete(transaction._id, filterType)}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransactionList;
