import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, PlusCircle, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const Goals = () => {
  const [lifetimeSavings, setLifetimeSavings] = useState(0);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchLifetimeSavings();
    fetchGoals();
  }, []);

  const fetchLifetimeSavings = async () => {
    try {
      const response = await fetch(`${API_URL}/goals/lifetime-savings`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setLifetimeSavings(data.lifetimeSavings);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lifetime savings:', error);
      setError('Failed to load lifetime savings');
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setGoals(data.goals);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load goals');
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGoal)
      });
      const data = await response.json();
      if (data.success) {
        setGoals([...goals, data.goal]);
        setShowAddModal(false);
        setNewGoal({ title: '', targetAmount: '', deadline: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to add goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const response = await fetch(`${API_URL}/goals/${goalId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setGoals(goals.filter(goal => goal._id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const calculateProgress = (targetAmount) => {
    const percentage = (lifetimeSavings / targetAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      isAchieved: percentage >= 100,
      remaining: targetAmount - lifetimeSavings
    };
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Financial Goals</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#20D982]/10 text-[#20D982] rounded-full hover:bg-[#20D982] hover:text-black transition-all duration-300"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Lifetime Savings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#280832] rounded-xl p-6 mb-8 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Lifetime Savings</h2>
          <Target className="text-[#20D982] w-8 h-8" />
        </div>
        <p className="text-4xl font-bold text-[#20D982] mt-4">
          ₹{lifetimeSavings.toLocaleString()}
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20D982] mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const { percentage, isAchieved, remaining } = calculateProgress(goal.targetAmount);
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#280832] rounded-xl p-4 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{goal.title}</h3>
                    <p className="text-sm text-gray-400">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className={isAchieved ? 'text-[#20D982]' : 'text-[#83bce3]'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isAchieved ? 'bg-[#20D982]' : 'bg-[#83bce3]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Amount</span>
                    <span className="text-white">₹{goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Savings</span>
                    <span className="text-white">₹{lifetimeSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-400">Remaining</span>
                    <span className={remaining <= 0 ? 'text-[#20D982]' : 'text-[#83bce3]'}>
                      ₹{Math.abs(remaining).toLocaleString()}
                    </span>
                  </div>
                </div>

                {goal.description && (
                  <p className="mt-4 text-sm text-gray-400">{goal.description}</p>
                )}

                {isAchieved && (
                  <div className="mt-4 flex items-center gap-2 text-[#20D982] text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Goal Achieved!</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#280832] rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Add New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Target Date</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Description (Optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  rows="3"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#20D982]/10 text-[#20D982] border border-[#20D982] hover:bg-[#20D982] hover:text-black transition-all duration-300"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals; 