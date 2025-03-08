import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/moneymind.png';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Dashboard from '../components/Dashboard';
import Reports from '../components/Reports';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('activeView') || 'overview'
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

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
      x: 10,
      backgroundColor: "rgba(131, 188, 227, 0.1)",
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

  const handleLogout = async () => {
    console.log("Logout called");
    const API_URL = import.meta.env.VITE_API_URL;
    console.log(API_URL);
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
  
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        console.log("Logout successful");
        navigate("/"); // Redirect to login page
      } else {
        console.error("Logout error:", data.message);
      }
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'transactions':
        return <TransactionList />;
      case 'add':
        return <TransactionForm />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  // Add mobile menu variants
  const mobileMenuVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 w-full h-[70px] bg-[#280832] flex items-center px-2 md:px-4 z-50"
      >
        <div className="flex justify-between items-center w-full">
          {/* Left Section: Menu Button and Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden menu-button p-1.5 md:p-2 text-white hover:text-[#83bce3] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <button onClick={() => setActiveView('overview')}>
                <motion.img
                  src={logo}
                  alt="Money Mind Logo"
                  className="w-[100px] md:w-[170px] h-auto object-contain"
                  whileHover={{ 
                    scale: 1.05, 
                    filter: "brightness(1.2)",
                    transition: { duration: 0.2 }
                  }}
                />
              </button>
            </motion.div>
          </div>

          {/* Navigation Links - Always visible, adjusted for mobile */}
          <div className="flex justify-center items-center">
            <motion.ul 
              className="flex gap-1.5 md:gap-3 items-center"
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
                    animate={activeView === link.id ? "hover" : "visible"}
                  >
                    <button
                      onClick={() => {
                        setActiveView(link.id);
                        localStorage.setItem('activeView', link.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        relative inline-block px-2 md:px-5 py-1.5 md:py-2.5 text-[12px] md:text-[15px] rounded-full
                        transition-all duration-300 
                        ${activeView === link.id
                          ? 'text-[#83bce3] font-medium shadow-lg bg-[#83bce3]/20' 
                          : 'text-white hover:text-[#83bce3] hover:bg-[#83bce3]/20'
                        }
                      `}
                    >
                      {link.text}
                    </button>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Empty div for spacing */}
          <div className="w-[100px] md:w-[170px]"></div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-[70px] left-0 w-64 bg-[#280832] h-[calc(100vh-70px)] z-50 mobile-menu lg:hidden"
          >
            <div className="flex flex-col h-full p-6 overflow-y-auto">
              {/* Other Menu Items */}
              <div className="space-y-6">
                <ul className="space-y-4">
                  {[
                    { id: 'goals', text: "Goals" },
                    { id: 'budget', text: "Budget" },
                    { id: 'savings', text: "Savings" },
                    { id: 'reports', text: "Reports" },
                    { id: 'groups', text: "Groups" }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      variants={listItemVariants}
                      whileHover="hover"
                      animate={activeView === item.id ? "hover" : "visible"}
                      className={`
                        text-white cursor-pointer transition-all duration-300
                        px-4 py-2 rounded-lg
                        ${activeView === item.id 
                          ? 'text-[#83bce3] bg-[#83bce3]/10 shadow-lg' 
                          : 'hover:text-[#83bce3]'
                        }
                      `}
                      onClick={() => {
                        setActiveView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.text}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Bottom Menu Items */}
              <div className="mt-auto pt-6">
                <ul className="space-y-4">
                  {[
                    { id: 'categories', text: "Custom Categories" },
                    { id: 'profile', text: "Profile" }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      variants={listItemVariants}
                      whileHover="hover"
                      animate={activeView === item.id ? "hover" : "visible"}
                      className={`
                        text-white cursor-pointer transition-all duration-300
                        px-4 py-2 rounded-lg
                        ${activeView === item.id 
                          ? 'text-[#83bce3] bg-[#83bce3]/10 shadow-lg' 
                          : 'hover:text-[#83bce3]'
                        }
                      `}
                      onClick={() => {
                        setActiveView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.text}
                    </motion.li>
                  ))}
                  <motion.li
                    variants={listItemVariants}
                    whileHover="hover"
                    className="px-4 py-2 rounded-lg"
                  >
                    <button
                      onClick={handleLogout}
                      className="text-white transition-colors hover:text-[#83bce3]"
                    >
                      Log out
                    </button>
                  </motion.li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex pt-[70px]">
        {/* Left Panel - Hidden on mobile */}
        <motion.div
          variants={leftPanelVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex w-64 bg-[#280832] min-h-screen fixed left-0 flex-col justify-between p-6 pb-20 overflow-y-auto"
        >
          <div className="space-y-6">
            <motion.ul className="space-y-4">
              {[
                { id: 'goals', text: "Goals" },
                { id: 'budget', text: "Budget" },
                { id: 'savings', text: "Savings" },
                { id: 'reports', text: "Reports" },
                { id: 'groups', text: "Groups" }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                  animate={activeView === item.id ? "hover" : "visible"}
                  className={`
                    text-white cursor-pointer transition-all duration-300
                    px-4 py-2 rounded-lg
                    ${activeView === item.id 
                      ? 'text-[#83bce3] bg-[#83bce3]/10 shadow-lg' 
                      : 'hover:text-[#83bce3]'
                    }
                  `}
                  onClick={() => {
                    setActiveView(item.id);
                    localStorage.setItem('activeView', item.id);
                  }}
                >
                  {item.text}
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <div className="mt-auto pt-6">
            <motion.ul className="space-y-4">
              {[
                { id: 'categories', text: "Custom Categories" },
                { id: 'profile', text: "Profile" }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                  animate={activeView === item.id ? "hover" : "visible"}
                  className={`
                    text-white cursor-pointer transition-all duration-300
                    px-4 py-2 rounded-lg
                    ${activeView === item.id 
                      ? 'text-[#83bce3] bg-[#83bce3]/10 shadow-lg' 
                      : 'hover:text-[#83bce3]'
                    }
                  `}
                  onClick={() => {
                    setActiveView(item.id);
                    localStorage.setItem('activeView', item.id);
                  }}
                >
                  {item.text}
                </motion.li>
              ))}
              <motion.li
                variants={listItemVariants}
                whileHover="hover"
                className="px-4 py-2 rounded-lg"
              >
                <button
                  onClick={handleLogout}
                  className="text-white transition-colors hover:text-[#83bce3]"
                >
                  Log out
                </button>
              </motion.li>
            </motion.ul>
          </div>
        </motion.div>

        {/* Main Content Area - Adjusted for mobile */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 p-4 md:p-8 lg:ml-64"
        >
          {renderMainContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
