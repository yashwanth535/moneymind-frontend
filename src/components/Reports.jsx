import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Eye, EyeOff } from 'lucide-react';

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
      destroyCharts();
    };
  }, [selectedMonth, selectedYear]);

  const destroyCharts = () => {
    if (expenseChartInstance.current) {
      expenseChartInstance.current.destroy();
      expenseChartInstance.current = null;
    }
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
      trendChartInstance.current = null;
    }
    if (paymentChartInstance.current) {
      paymentChartInstance.current.destroy();
      paymentChartInstance.current = null;
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      destroyCharts(); // Destroy existing charts before fetching new data
      
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
      
      // Wait for state update and DOM to be ready
      setTimeout(() => {
        if (data) {
          createCharts(data);
        }
      }, 0);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCharts = (data) => {
    if (!data) return;
    
    try {
      // Create Expense Distribution Chart
      if (expenseChartRef.current && data.expenseByPurpose && data.expenseByPurpose.length > 0) {
        const ctx = expenseChartRef.current.getContext('2d');
        expenseChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: data.expenseByPurpose.map(item => item._id || 'Uncategorized'),
            datasets: [{
              data: data.expenseByPurpose.map(item => item.total),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#fff' }
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
      }

      // Create Daily Trend Chart
      if (trendChartRef.current && data.dailyTrend && data.dailyTrend.length > 0) {
        const ctx = trendChartRef.current.getContext('2d');
        trendChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.dailyTrend.map(item => {
              const date = new Date(item._id);
              return date.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short' 
              });
            }),
            datasets: [{
              label: 'Daily Expenses',
              data: data.dailyTrend.map(item => item.total),
              borderColor: '#20D982',
              backgroundColor: 'rgba(32, 217, 130, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#fff' }
              },
              tooltip: {
                callbacks: {
                  label: (context) => `₹${context.raw.toLocaleString()}`
                }
              }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { 
                  color: '#fff',
                  maxRotation: 45
                }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { 
                  color: '#fff',
                  callback: value => `₹${value.toLocaleString()}`
                }
              }
            }
          }
        });
      }

      // Create Payment Method Chart
      if (paymentChartRef.current && data.paymentMethodDistribution && data.paymentMethodDistribution.length > 0) {
        const ctx = paymentChartRef.current.getContext('2d');
        paymentChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.paymentMethodDistribution.map(item => item._id || 'Other'),
            datasets: [{
              data: data.paymentMethodDistribution.map(item => item.total),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#fff' }
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
      }
    } catch (error) {
      console.error('Error creating charts:', error);
      setError('Failed to create charts');
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
      
      // Force desktop view for download
      const reportElement = document.getElementById('report-content');
      const originalStyle = reportElement.style.cssText;
      
      // Temporarily apply desktop styles
      reportElement.style.cssText = `
        width: 1024px !important;
        grid-template-columns: repeat(3, 1fr) !important;
        padding: 2rem !important;
      `;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#1a1a2e',
        windowWidth: 1024,
        width: 1024,
        height: reportElement.scrollHeight,
      });
      
      // Restore original styles
      reportElement.style.cssText = originalStyle;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If content is longer than one page, create multiple pages
      const maxHeight = pdf.internal.pageSize.getHeight();
      let currentHeight = 0;
      
      while (currentHeight < pdfHeight) {
        if (currentHeight > 0) {
          pdf.addPage();
        }
        
        const remainingHeight = Math.min(maxHeight, pdfHeight - currentHeight);
        pdf.addImage(
          imgData,
          'PNG',
          0,
          currentHeight === 0 ? 0 : -currentHeight,
          pdfWidth,
          pdfHeight
        );
        
        currentHeight += maxHeight;
      }
      
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20D982] mx-auto"></div>
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6">
        <h1 className="text-2xl md:text-3xl text-white font-bold">Financial Report</h1>
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 md:flex-none bg-[#280832] text-white text-sm md:text-base px-3 py-2 md:px-4 md:py-2 rounded-lg border border-[#20D982]/20"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="flex-1 md:flex-none bg-[#280832] text-white text-sm md:text-base px-3 py-2 md:px-4 md:py-2 rounded-lg border border-[#20D982]/20"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#280832] text-white px-3 py-2 md:px-6 md:py-2 rounded-lg border border-[#20D982]/20 hover:bg-[#20D982]/10 transition-colors"
          >
            {showInsights ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span className="hidden md:inline">{showInsights ? 'Hide Insights' : 'Show Insights'}</span>
          </button>
          <button
            onClick={downloadReport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#20D982] text-white px-3 py-2 md:px-6 md:py-2 rounded-lg hover:bg-[#1aaf6a] transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:inline">Download Report</span>
          </button>
        </div>
      </div>

      <div id="report-content" className="space-y-4 md:space-y-6">
        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
        >
          <h2 className="text-lg md:text-xl text-white mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-[#1a1a2e] p-3 md:p-4 rounded-lg">
              <div className="text-gray-400 text-sm md:text-base">Total Income</div>
              <div className="text-xl md:text-2xl text-green-400">
                ₹{reportData?.totals.credit.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-3 md:p-4 rounded-lg">
              <div className="text-gray-400 text-sm md:text-base">Total Expenses</div>
              <div className="text-xl md:text-2xl text-red-400">
                ₹{reportData?.totals.debit.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-3 md:p-4 rounded-lg">
              <div className="text-gray-400 text-sm md:text-base">Net Savings</div>
              <div className={`text-xl md:text-2xl ${reportData?.savings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
            className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
          >
            <h2 className="text-lg md:text-xl text-white mb-4">Financial Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {generateInsights(reportData).map((insight, index) => (
                <div key={index} className="bg-[#1a1a2e] p-3 md:p-4 rounded-lg">
                  <h3 className="text-[#20D982] text-sm md:text-base font-semibold mb-2">{insight.title}</h3>
                  <ul className="space-y-1.5 md:space-y-2">
                    {insight.points.map((point, i) => (
                      <li key={i} className="text-gray-300 text-xs md:text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Expense Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
          >
            <h3 className="text-white text-base md:text-lg mb-4">Expense Distribution</h3>
            <div className="h-[300px] relative">
              <canvas ref={expenseChartRef}></canvas>
            </div>
          </motion.div>

          {/* Daily Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20"
          >
            <h3 className="text-white text-base md:text-lg mb-4">Daily Expense Trend</h3>
            <div className="h-[300px] relative">
              <canvas ref={trendChartRef}></canvas>
            </div>
          </motion.div>

          {/* Payment Method Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#280832] p-4 md:p-6 rounded-xl border border-[#20D982]/20 lg:col-span-2"
          >
            <h3 className="text-white text-base md:text-lg mb-4">Payment Method Distribution</h3>
            <div className="h-[300px] relative">
              <canvas ref={paymentChartRef}></canvas>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;