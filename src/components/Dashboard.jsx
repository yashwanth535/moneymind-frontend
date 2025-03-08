import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [lastDebits, setLastDebits] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    fetchDebits();
    fetchCredits();

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/home/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalExpenses(data.total || 0);
        setChartData(data.expenseByPurpose || []);
        
        if (data.expenseByPurpose && data.expenseByPurpose.length > 0) {
          renderPieChart(data.expenseByPurpose);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error fetching dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const renderPieChart = (expenseByPurpose) => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Sort and process data
    const sortedData = expenseByPurpose.sort((a, b) => b.total - a.total);
    const top6 = sortedData.slice(0, 6);
    const others = sortedData.slice(6);
    const othersTotal = others.reduce((sum, item) => sum + item.total, 0);

    const labels = top6.map(item => item._id || 'Uncategorized');
    const values = top6.map(item => item.total);

    if (othersTotal > 0) {
      labels.push('Others');
      values.push(othersTotal);
    }

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#C0C0C0'
    ].slice(0, labels.length);

    try {
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('1)', '0.8)')),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#fff',
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `₹${value.toLocaleString()} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating pie chart:', error);
      setError('Error creating chart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
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
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="text-[#20D982] text-sm md:text-base hover:text-[#1aaf6a] transition-colors"
            >
              {showTransactions ? 'Hide' : 'Show'}
            </button>
          </div>
          <AnimatePresence>
            {showTransactions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {lastDebits.map((debit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
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
              </motion.div>
            )}
          </AnimatePresence>
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
          <div className="relative w-full h-[250px] md:h-[300px]">
            {chartData && chartData.length > 0 ? (
              <canvas ref={chartRef}></canvas>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm md:text-base">
                No expense data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Budget Overview Card (Coming Soon) */}
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
          <h2 className="text-lg md:text-xl text-white mb-4">Budget Overview</h2>
          <p className="text-gray-400 text-sm md:text-base">Budget tracking features coming soon...</p>
        </motion.div>

        {/* Financial Goals Card (Coming Soon) */}
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
          <h2 className="text-lg md:text-xl text-white mb-4">Financial Goals</h2>
          <p className="text-gray-400 text-sm md:text-base">Goal setting and tracking coming soon...</p>
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