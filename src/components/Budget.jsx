import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, BarChart, AlertTriangle, CheckCircle, PlusCircle, Edit2, Trash2 } from 'lucide-react';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/budgets`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Ensure amount is a number
        const budgetsWithNumberAmount = data.budgets.map(budget => ({
          ...budget,
          amount: Number(budget.amount)
        }));
        setBudgets(budgetsWithNumberAmount);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setError('Failed to load budgets');
      setLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newBudget,
          amount: Number(newBudget.amount)
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBudgets([...budgets, { ...data.budget, amount: Number(data.budget.amount) }]);
        setShowAddModal(false);
        setNewBudget({ category: '', amount: '', period: 'monthly' });
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      setError('Failed to add budget');
    }
  };

  const handleEditClick = (budget) => {
    setSelectedBudget(budget);
    setNewBudget({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (budget) => {
    setSelectedBudget(budget);
    setShowDeleteConfirm(true);
  };

  const handleEditBudget = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/budgets/${selectedBudget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newBudget,
          amount: Number(newBudget.amount)
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBudgets(budgets.map(b => 
          b._id === selectedBudget._id ? { ...data.budget, amount: Number(data.budget.amount) } : b
        ));
        setShowEditModal(false);
        setSelectedBudget(null);
        setNewBudget({ category: '', amount: '', period: 'monthly' });
      }
    } catch (error) {
      console.error('Error editing budget:', error);
      setError('Failed to edit budget');
    }
  };

  const handleDeleteBudget = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/budgets/${selectedBudget._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setBudgets(budgets.filter(b => b._id !== selectedBudget._id));
        setShowDeleteConfirm(false);
        setSelectedBudget(null);
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      setError('Failed to delete budget');
    }
  };

  const calculateProgress = (budget) => {
    const spent = budget.spent || 0;
    const percentage = (spent / budget.amount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      isOverspent: percentage > 100,
      remaining: budget.amount - spent
    };
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-semibold text-white">Budget Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 p-2 md:px-4 md:py-2 bg-[#20D982]/10 text-[#20D982] rounded-full hover:bg-[#20D982] hover:text-black transition-all duration-300"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden md:inline">Add Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20D982] mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {budgets.map((budget) => {
            const { percentage, isOverspent, remaining } = calculateProgress(budget);
            return (
              <motion.div
                key={budget._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#280832] rounded-xl p-3 md:p-4 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-medium text-white">{budget.category}</h3>
                    <p className="text-xs md:text-sm text-gray-400">{budget.period}</p>
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <button 
                      onClick={() => handleEditClick(budget)}
                      className="p-1 md:p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#83bce3]" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(budget)}
                      className="p-1 md:p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="mb-3 md:mb-4">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className={isOverspent ? 'text-red-400' : 'text-[#20D982]'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverspent ? 'bg-red-400' : 'bg-[#20D982]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-white">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-400">Spent</span>
                    <span className="text-white">${(budget.spent || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm font-medium">
                    <span className="text-gray-400">Remaining</span>
                    <span className={remaining >= 0 ? 'text-[#20D982]' : 'text-red-400'}>
                      ${Math.abs(remaining).toFixed(2)}
                      {remaining < 0 ? ' overspent' : ''}
                    </span>
                  </div>
                </div>

                {isOverspent && (
                  <div className="mt-3 md:mt-4 flex items-center gap-1.5 md:gap-2 text-red-400 text-xs md:text-sm">
                    <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Over budget!</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#280832] rounded-xl p-4 md:p-6 w-full max-w-md"
          >
            <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Add New Budget</h3>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm md:text-base mb-1">Category</label>
                <input
                  type="text"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 rounded-lg bg-black/20 text-white text-sm md:text-base border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm md:text-base mb-1">Amount</label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 rounded-lg bg-black/20 text-white text-sm md:text-base border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm md:text-base mb-1">Period</label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 rounded-lg bg-black/20 text-white text-sm md:text-base border border-gray-700 focus:border-[#20D982] focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex gap-3 md:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 md:px-4 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm md:text-base hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-[#20D982]/10 text-[#20D982] text-sm md:text-base border border-[#20D982] hover:bg-[#20D982] hover:text-black transition-all duration-300"
                >
                  Add Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#280832] rounded-xl p-4 md:p-6 w-full max-w-md"
          >
            <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Edit Budget</h3>
            <form onSubmit={handleEditBudget} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm md:text-base mb-1">Category</label>
                <input
                  type="text"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 rounded-lg bg-black/20 text-white text-sm md:text-base border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm md:text-base mb-1">Amount</label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 rounded-lg bg-black/20 text-white text-sm md:text-base border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm md:text-base mb-1">Period</label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 rounded-lg bg-black/20 text-white text-sm md:text-base border border-gray-700 focus:border-[#20D982] focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex gap-3 md:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBudget(null);
                    setNewBudget({ category: '', amount: '', period: 'monthly' });
                  }}
                  className="flex-1 px-3 md:px-4 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm md:text-base hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-[#20D982]/10 text-[#20D982] text-sm md:text-base border border-[#20D982] hover:bg-[#20D982] hover:text-black transition-all duration-300"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#280832] rounded-xl p-4 md:p-6 w-full max-w-md"
          >
            <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Delete Budget</h3>
            <p className="text-gray-300 text-sm md:text-base mb-6">
              Are you sure you want to delete the budget for {selectedBudget?.category}? This action cannot be undone.
            </p>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedBudget(null);
                }}
                className="flex-1 px-3 md:px-4 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm md:text-base hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBudget}
                className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm md:text-base border border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                Delete Budget
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Budget; 