import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionForm = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formType, setFormType] = useState('debit');
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    purpose: '',
    modeOfPayment: '',
    bank: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const inputVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = formType === 'debit' 
        ? `${API_URL}/add-transaction/debit-transaction`
        : `${API_URL}/add-transaction/credit-transaction`;

      const payload = formType === 'debit'
        ? {
            amount: formData.amount,
            date: formData.date,
            purpose: formData.purpose,
            modeOfPayment: formData.modeOfPayment
          }
        : {
            amount: formData.amount,
            date: formData.date,
            bank: formData.bank,
            modeOfPayment: formData.modeOfPayment
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(data.message || 'Transaction added successfully!', 'success');
        // Reset form
        setFormData({
          amount: '',
          date: '',
          purpose: '',
          modeOfPayment: '',
          bank: ''
        });
      } else {
        showNotification(data.message || 'Failed to add transaction', 'error');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showNotification('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full max-w-md mx-auto mt-8"
    >
      <AnimatePresence>
        {notification.show && (
          <Notification message={notification.message} type={notification.type} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#280832] p-6 rounded-lg shadow-[0_0_5px_#83bce3]"
      >
        <motion.select
          variants={inputVariants}
          whileHover={{ scale: 1.02 }}
          className="w-[15%] mx-auto p-2.5 rounded-lg border border-[#20D982]/30 bg-[#280832] text-white focus:ring-2 focus:ring-[#83bce3]"
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
        >
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </motion.select>

        <motion.form
          variants={formVariants}
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
        >
          <motion.div variants={inputVariants} className="space-y-1">
            <label className="text-gray-200">Amount</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-gray-600 bg-[#280832] text-white focus:ring-2 focus:ring-[#83bce3]"
              required
            />
          </motion.div>

          <motion.div variants={inputVariants} className="space-y-1">
            <label className="text-gray-200">Date</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-gray-600 bg-[#280832] text-white focus:ring-2 focus:ring-[#83bce3]"
              required
            />
          </motion.div>

          {formType === 'debit' && (
            <motion.div
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-1"
            >
              <label className="text-gray-200">Purpose</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-gray-600 bg-[#280832] text-white focus:ring-2 focus:ring-[#83bce3]"
                required={formType === 'debit'}
              />
            </motion.div>
          )}

          <motion.div variants={inputVariants} className="space-y-1">
            <label className="text-gray-200">Mode of Payment</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              name="modeOfPayment"
              value={formData.modeOfPayment}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-gray-600 bg-[#280832] text-white focus:ring-2 focus:ring-[#83bce3]"
              required
            >
              <option value="">Select Mode</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </motion.select>
          </motion.div>

          {formType === 'credit' && (
            <motion.div
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-1"
            >
              <label className="text-gray-200">Bank</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-gray-600 bg-[#280832] text-white focus:ring-2 focus:ring-[#83bce3]"
                required={formType === 'credit'}
              />
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2.5 bg-[#83bce3] text-black rounded-lg transition-all duration-300
              ${isSubmitting 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-[#66a8c4] active:bg-[#3b7b98]'
              }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default TransactionForm;
