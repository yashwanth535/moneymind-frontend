import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/moneymind.png';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Dashboard from '../components/Dashboard';

const Home = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'transactions', 'add'

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const navLinkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const leftPanelVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: { 
      color: "#83bce3",
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        delay: 0.5
      }
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'transactions':
        return <TransactionList />;
      case 'add':
        return <TransactionForm />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 w-full h-[70px] bg-[#280832] flex items-center px-4 z-50"
      >
        <div className="flex justify-between items-center w-full">
          {/* Logo Section */}
          <motion.div 
            className="flex-[0.1] flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <button onClick={() => setActiveView('overview')}>
              <motion.img
                src={logo}
                alt="Money Mind Logo"
                className="w-[170px] h-auto object-contain"
                whileHover={{ 
                  scale: 1.05, 
                  filter: "brightness(1.2)",
                  transition: { duration: 0.2 }
                }}
              />
            </button>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex-[0.45] flex justify-center">
            <motion.ul 
              className="flex gap-5 items-center"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {[
                { id: 'transactions', text: "Transactions" },
                { id: 'overview', text: "Overview" },
                { id: 'add', text: "Add" }
              ].map((link, index) => (
                <motion.li key={index}>
                  <motion.div
                    variants={navLinkVariants}
                    whileHover="hover"
                  >
                    <button
                      onClick={() => setActiveView(link.id)}
                      className={`
                        relative inline-block px-5 py-2.5 text-[15px] rounded-full
                        transition-all duration-300 
                        ${activeView === link.id
                          ? 'text-black bg-[#83bce3] font-medium shadow-lg' 
                          : 'text-white hover:bg-[#83bce3]/20'
                        }
                        before:content-['']
                        before:absolute before:inset-0
                        before:rounded-full before:transition-all
                        before:duration-300
                        hover:shadow-md
                      `}
                    >
                      {link.text}
                    </button>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="flex-[0.45]"></div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex pt-[70px]">
        {/* Left Panel */}
        <motion.div
          variants={leftPanelVariants}
          initial="hidden"
          animate="visible"
          className="w-64 bg-[#280832] min-h-screen fixed left-0 flex flex-col justify-between p-6 pb-20 overflow-y-auto"
        >
          <div className="space-y-6">
            <motion.ul className="space-y-4">
              {["Goals", "Budget", "Savings", "Reports", "Groups"].map((item, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                  className="text-white cursor-pointer transition-colors"
                >
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <div className="mt-auto pt-6">
            <motion.ul className="space-y-4">
              {["Custom Categories", "Profile"].map((item, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                  className="text-white cursor-pointer transition-colors"
                >
                  {item}
                </motion.li>
              ))}
              <motion.li
                variants={listItemVariants}
                whileHover="hover"
                className="mb-4"
              >
                <Link to="/auth/logout" className="text-white transition-colors">
                  Log out
                </Link>
              </motion.li>
            </motion.ul>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 ml-64 p-8"
        >
          {renderMainContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
