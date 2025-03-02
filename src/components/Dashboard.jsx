import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [lastDebits, setLastDebits] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    fetchDebits();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/home/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalExpenses(data.total);
        renderPieChart(data.expenseByPurpose);
      } else {
        console.error('Error fetching dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const renderPieChart = (expenseByPurpose) => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const sortedData = expenseByPurpose.sort((a, b) => b.total - a.total);
    const top6 = sortedData.slice(0, 6);
    const others = sortedData.slice(6);
    const othersTotal = others.reduce((sum, item) => sum + item.total, 0);

    const labels = top6.map(item => item._id);
    const values = top6.map(item => item.total);

    if (othersTotal > 0) {
      labels.push('Others');
      values.push(othersTotal);
    }

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#C0C0C0'
          ].slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#fff'
            }
          }
        }
      }
    });
  };

  const fetchDebits = async () => {
    try {
      const response = await fetch(`${API_URL}/home/debits`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTotalDebit(data.totalDebit);
        setLastDebits(data.lastDebits);
      } else {
        console.error('Error fetching debit data');
      }
    } catch (error) {
      console.error('Error fetching debits:', error);
    }
  };

  return (
    <>
      <motion.h1 
        className="text-3xl text-white mb-8 font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Welcome to MoneyMind
      </motion.h1>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
        {/* Expense Overview Card */}
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
          className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-xl text-white mb-4">Expense Overview</h2>
          <p className="text-gray-300 mb-4">Total Expenses: ₹{totalExpenses}/-</p>
          <div className="relative w-full h-[200px]">
            <canvas ref={chartRef} width="200" height="200"></canvas>
          </div>
        </motion.div>

        {/* Debit Section Card */}
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
          className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-xl text-white mb-4">Monthly Debit Overview</h2>
          <p className="text-gray-300 mb-4">Total Debit This Month: ₹{totalDebit}</p>
          <ul className="space-y-2">
            {lastDebits.map((debit, index) => (
              <li key={index} className="text-gray-300">
                {new Date(debit.date).toLocaleDateString()}: ₹{debit.amount}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Additional Card for Future Use */}
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
          className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-xl text-white mb-4">Quick Actions</h2>
          <p className="text-gray-300">Additional features coming soon...</p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard; 