import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'chart.js/auto';
import { Target, Wallet, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [lastDebits, setLastDebits] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [lifetimeSavings, setLifetimeSavings] = useState(0);
  
  // Chart refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    fetchDebits();
    fetchCredits();
    fetchGoals();
    fetchBudgets();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/home/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalExpenses(data.total || 0);
        setChartData(data.expenseByPurpose || []);
        
        if (data.expenseByPurpose && data.expenseByPurpose.length > 0) {
          createChart(data.expenseByPurpose);
        }
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDebits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/home/debits`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalDebit(data.totalDebit || 0);
        setLastDebits(data.lastDebits || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error fetching debit data');
      }
    } catch (error) {
      console.error('Error fetching debits:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching credits from:', `${API_URL}/home/credits`);
      
      const response = await fetch(`${API_URL}/home/credits`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received credits data:', data);
      setTotalCredit(data.totalCredit || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
      setError(error.message);
    } finally {
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

      // Fetch lifetime savings
      const savingsResponse = await fetch(`${API_URL}/goals/lifetime-savings`, {
        credentials: 'include'
      });
      const savingsData = await savingsResponse.json();
      if (savingsData.success) {
        setLifetimeSavings(savingsData.lifetimeSavings);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_URL}/budgets`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const createChart = (data) => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data
    const sortedData = data.sort((a, b) => b.total - a.total);
    const labels = sortedData.map(item => item._id);
    const values = sortedData.map(item => item.total);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#C0C0C0'
    ];

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#fff'
            }
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20D982] mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const monthlySavings = totalCredit - totalDebit;

  return (
    <>
      <motion.h1 
        className="text-2xl md:text-3xl text-white mb-4 md:mb-8 font-bold px-2 md:px-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Welcome to MoneyMind
      </motion.h1>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2 }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        {/* Monthly Overview Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-lg md:text-xl text-white mb-4">Monthly Overview</h2>
          <div className="space-y-3 text-sm md:text-base">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Income:</span>
              <span className="text-green-400">₹{totalCredit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Expenses:</span>
              <span className="text-red-400">₹{totalDebit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-300 font-semibold">Net Savings:</span>
              <span className={`font-semibold ${monthlySavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{monthlySavings.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl text-white">Recent Transactions</h2>
            <a 
              href="/home#transactions"
              className="text-[#20D982] hover:text-[#1aaf6a] transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
          <div className="space-y-2">
            {lastDebits.slice(0, 4).map((debit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center p-2 bg-[#1a1a2e] rounded text-sm md:text-base"
              >
                <div>
                  <div className="text-gray-300">{debit.purpose}</div>
                  <div className="text-xs md:text-sm text-gray-400">{debit.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400">₹{debit.amount.toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-gray-400">{debit.modeOfPayment}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Expense Distribution Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-lg md:text-xl text-white mb-4">Expense Distribution</h2>
          <div className="h-[300px] relative">
            {chartData && chartData.length > 0 ? (
              <canvas ref={chartRef}></canvas>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No expense data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Budget Overview Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl text-white">Budget Overview</h2>
            <Wallet className="text-[#20D982] w-6 h-6" />
          </div>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.slice(0, 3).map((budget) => {
                const percentage = (budget.spent / budget.amount) * 100;
                const isOverspent = percentage > 100;
                return (
                  <div key={budget._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{budget.category}</span>
                      <span className={isOverspent ? 'text-red-400' : 'text-[#20D982]'}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOverspent ? 'bg-red-400' : 'bg-[#20D982]'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm md:text-base">No budgets set</p>
          )}
        </motion.div>

        {/* Financial Goals Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl text-white">Financial Goals</h2>
            <Target className="text-[#20D982] w-6 h-6" />
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const percentage = (lifetimeSavings / goal.targetAmount) * 100;
                const isAchieved = percentage >= 100;
                return (
                  <div key={goal._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{goal.title}</span>
                      <span className={isAchieved ? 'text-[#20D982]' : 'text-[#83bce3]'}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isAchieved ? 'bg-[#20D982]' : 'bg-[#83bce3]'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm md:text-base">No goals set</p>
          )}
        </motion.div>

        {/* Investment Overview Card (Coming Soon) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-lg md:text-xl text-white mb-4">Investment Overview</h2>
          <p className="text-gray-400 text-sm md:text-base">Investment tracking features coming soon...</p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard; 