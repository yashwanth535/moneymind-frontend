import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Reports = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showInsights, setShowInsights] = useState(false);

  // Chart refs
  const expenseChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const paymentChartRef = useRef(null);
  const expenseChartInstance = useRef(null);
  const trendChartInstance = useRef(null);
  const paymentChartInstance = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  ).sort((a, b) => b - a);

  useEffect(() => {
    fetchReportData();
    return () => {
      // Cleanup charts
      if (expenseChartInstance.current) expenseChartInstance.current.destroy();
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (paymentChartInstance.current) paymentChartInstance.current.destroy();
    };
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API_URL}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
      renderCharts(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = (data) => {
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            padding: 20,
            font: { size: 12 }
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
    };

    // Expense Distribution Chart
    if (expenseChartRef.current) {
      if (expenseChartInstance.current) {
        expenseChartInstance.current.destroy();
      }

      const ctx = expenseChartRef.current.getContext('2d');
      const sortedData = data.expenseByPurpose.sort((a, b) => b.total - a.total);
      const top6 = sortedData.slice(0, 6);
      const others = sortedData.slice(6);
      const othersTotal = others.reduce((sum, item) => sum + item.total, 0);

      const labels = top6.map(item => item._id || 'Uncategorized');
      const values = top6.map(item => item.total);

      if (othersTotal > 0) {
        labels.push('Others');
        values.push(othersTotal);
      }

      expenseChartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C0C0C0'
            ].slice(0, labels.length)
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: 'Expense Distribution by Purpose',
              color: '#fff',
              font: { size: 16 }
            }
          }
        }
      });
    }

    // Daily Trend Chart
    if (trendChartRef.current) {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }

      const ctx = trendChartRef.current.getContext('2d');
      trendChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.dailyTrend.map(item => {
            const date = new Date(item._id);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }),
          datasets: [{
            label: 'Daily Expenses',
            data: data.dailyTrend.map(item => item.total),
            borderColor: '#20D982',
            backgroundColor: 'rgba(32, 217, 130, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          ...chartOptions,
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: { color: '#fff' }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: { 
                color: '#fff',
                callback: value => '₹' + value.toLocaleString()
              }
            }
          },
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: 'Daily Expense Trend',
              color: '#fff',
              font: { size: 16 }
            }
          }
        }
      });
    }

    // Payment Method Distribution Chart
    if (paymentChartRef.current) {
      if (paymentChartInstance.current) {
        paymentChartInstance.current.destroy();
      }

      const ctx = paymentChartRef.current.getContext('2d');
      paymentChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.paymentMethodDistribution.map(item => item._id),
          datasets: [{
            data: data.paymentMethodDistribution.map(item => item.total),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
            ]
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: 'Payment Method Distribution',
              color: '#fff',
              font: { size: 16 }
            }
          }
        }
      });
    }
  };

  const generateInsights = (data) => {
    if (!data) return [];

    const insights = [];
    
    // Spending Trend
    const totalExpense = data.totals.debit;
    const avgDailyExpense = totalExpense / data.dailyTrend.length;
    
    insights.push({
      title: 'Monthly Overview',
      points: [
        `Total expenses this month: ₹${totalExpense.toLocaleString()}`,
        `Average daily expense: ₹${avgDailyExpense.toFixed(2).toLocaleString()}`,
        `Net savings: ₹${data.savings.toLocaleString()}`
      ]
    });

    // Top Expenses
    const topExpenses = [...data.expenseByPurpose]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    
    insights.push({
      title: 'Top Expense Categories',
      points: topExpenses.map(exp => 
        `${exp._id}: ₹${exp.total.toLocaleString()} (${((exp.total/totalExpense)*100).toFixed(1)}%)`
      )
    });

    // Payment Methods
    const topPaymentMethods = [...data.paymentMethodDistribution]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    
    insights.push({
      title: 'Preferred Payment Methods',
      points: topPaymentMethods.map(method => 
        `${method._id}: ₹${method.total.toLocaleString()}`
      )
    });

    // Daily Trends
    const maxExpenseDay = [...data.dailyTrend]
      .sort((a, b) => b.total - a.total)[0];
    
    insights.push({
      title: 'Spending Patterns',
      points: [
        `Highest spending day: ${new Date(maxExpenseDay._id).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} (₹${maxExpenseDay.total.toLocaleString()})`
      ]
    });

    return insights;
  };

  const downloadReport = async () => {
    try {
      setLoading(true);
      const reportElement = document.getElementById('report-content');
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#1a1a2e'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`financial-report-${months[selectedMonth - 1]}-${selectedYear}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading report data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-white font-bold">Financial Report</h1>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-[#280832] text-white px-4 py-2 rounded-lg border border-[#20D982]/20"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-[#280832] text-white px-4 py-2 rounded-lg border border-[#20D982]/20"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="bg-[#280832] text-white px-6 py-2 rounded-lg border border-[#20D982]/20 hover:bg-[#20D982]/10 transition-colors"
          >
            {showInsights ? 'Hide Insights' : 'Show Insights'}
          </button>
          <button
            onClick={downloadReport}
            className="bg-[#20D982] text-white px-6 py-2 rounded-lg hover:bg-[#1aaf6a] transition-colors"
          >
            Download Report
          </button>
        </div>
      </div>

      <div id="report-content" className="space-y-6">
        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-xl text-white mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <div className="text-gray-400">Total Income</div>
              <div className="text-2xl text-green-400">
                ₹{reportData?.totals.credit.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <div className="text-gray-400">Total Expenses</div>
              <div className="text-2xl text-red-400">
                ₹{reportData?.totals.debit.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <div className="text-gray-400">Net Savings</div>
              <div className={`text-2xl ${reportData?.savings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{reportData?.savings.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Insights Section */}
        {showInsights && reportData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
          >
            <h2 className="text-xl text-white mb-4">Financial Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generateInsights(reportData).map((insight, index) => (
                <div key={index} className="bg-[#1a1a2e] p-4 rounded-lg">
                  <h3 className="text-[#20D982] font-semibold mb-2">{insight.title}</h3>
                  <ul className="space-y-2">
                    {insight.points.map((point, i) => (
                      <li key={i} className="text-gray-300 text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
          >
            <canvas ref={expenseChartRef} height="300"></canvas>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20"
          >
            <canvas ref={trendChartRef} height="300"></canvas>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#280832] p-6 rounded-xl border border-[#20D982]/20 md:col-span-2"
          >
            <canvas ref={paymentChartRef} height="200"></canvas>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;