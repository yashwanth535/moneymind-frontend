 import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/moneymind.png';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Dashboard from '../components/Dashboard';
import Reports from '../components/Reports';
import Budget from '../components/Budget';
import Profile from '../components/Profile';
import Goals from '../components/Goals';
import Groups from '../components/Groups';
// Import icons from lucide-react
import { 
  Receipt, 
  PieChart, 
  Plus, 
  Target, 
  Wallet, 
  BarChart, 
  Users, 
  User, 
  LogOut,
  Menu
} from 'lucide-react';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(() => {
    // Get view from hash, default to 'overview' if no hash
    return window.location.hash.slice(1) || 'overview';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setActiveView(hash || 'overview');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activeView changes
  useEffect(() => {
    if (activeView) {
      window.location.hash = activeView;
    }
  }, [activeView]);

  useEffect(() => {
    // Get profile picture from localStorage if it exists
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.picture) {
          setProfilePicture(userData.picture);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

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
      case 'budget':
        return <Budget />;
      case 'profile':
        return <Profile />;
      case 'goals':
        return <Goals />;
      case 'groups':
        return <Groups />;
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

  // Header navigation items with icons
  const headerNavItems = [
    { id: 'transactions', text: "Transactions", icon: <Receipt size={20} /> },
    { id: 'overview', text: "Overview", icon: <PieChart size={20} /> },
    { id: 'add', text: "Add", icon: <Plus size={20} /> }
  ];

  // Left panel main menu items with icons
  const leftPanelMainItems = [
    { id: 'goals', text: "Goals", icon: <Target size={20} /> },
    { id: 'budget', text: "Budget", icon: <Wallet size={20} /> },
    { id: 'reports', text: "Reports", icon: <BarChart size={20} /> },
    { id: 'groups', text: "Groups", icon: <Users size={20} /> }
  ];

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
              <Menu size={24} />
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
                  className="w-[130px] md:w-[170px] h-auto object-contain"
                  whileHover={{ 
                    scale: 1.05, 
                    filter: "brightness(1.2)",
                    transition: { duration: 0.2 }
                  }}
                />
              </button>
            </motion.div>
          </div>

          {/* Navigation Links - Only visible on desktop */}
          <div className="hidden lg:flex justify-center items-center">
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
              {headerNavItems.map((link, index) => (
                <motion.li key={index}>
                  <motion.div
                    variants={navLinkVariants}
                    whileHover="hover"
                    animate={activeView === link.id ? "hover" : "visible"}
                  >
                    <button
                      onClick={() => {
                        setActiveView(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        relative inline-flex items-center gap-1.5 px-2 md:px-5 py-1.5 md:py-2.5 text-[12px] md:text-[15px] rounded-full
                        transition-all duration-300 
                        ${activeView === link.id
                          ? 'text-[#83bce3] font-medium shadow-lg bg-[#83bce3]/20' 
                          : 'text-white hover:text-[#83bce3] hover:bg-[#83bce3]/20'
                        }
                      `}
                    >
                      {link.icon}
                      {link.text}
                    </button>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Profile Section */}
          <motion.button
            className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-[#83bce3] hover:border-white transition-colors"
            onClick={() => setActiveView('profile')}
            whileHover={{ scale: 1.05 }}
          >
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={24} className="text-white" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-[70px] left-0 w-[220px] bg-[#280832] h-[calc(100vh-70px)] z-50 mobile-menu lg:hidden"
          >
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              {/* Overview at the top */}
              <motion.div
                variants={listItemVariants}
                whileHover="hover"
                animate={activeView === 'overview' ? "hover" : "visible"}
                className={`
                  text-white cursor-pointer transition-all duration-300
                  px-4 py-2.5 rounded-full flex items-center gap-3 mb-4 text-[14px]
                  ${activeView === 'overview' 
                    ? 'text-[#83bce3] bg-[#83bce3]/20 shadow-lg font-medium' 
                    : 'hover:text-[#83bce3] hover:bg-[#83bce3]/20'
                  }
                `}
                onClick={() => {
                  setActiveView('overview');
                  setIsMobileMenuOpen(false);
                }}
              >
                <PieChart size={20} strokeWidth={2} />
                Overview
              </motion.div>

              {/* Transactions and Add in the next row */}
              <div className="flex flex-col gap-2 mb-6">
                {['transactions', 'add'].map((id) => {
                  const item = headerNavItems.find(item => item.id === id);
                  return (
                    <motion.div
                      key={id}
                      variants={listItemVariants}
                      whileHover="hover"
                      animate={activeView === id ? "hover" : "visible"}
                      className={`
                        text-white cursor-pointer transition-all duration-300
                        px-4 py-2.5 rounded-full flex items-center gap-3 text-[14px]
                        ${activeView === id 
                          ? 'text-[#83bce3] bg-[#83bce3]/20 shadow-lg font-medium' 
                          : 'hover:text-[#83bce3] hover:bg-[#83bce3]/20'
                        }
                      `}
                      onClick={() => {
                        setActiveView(id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {React.cloneElement(item.icon, { strokeWidth: 2 })}
                      {item.text}
                    </motion.div>
                  );
                })}
              </div>

              {/* Other Menu Items */}
              <div className="space-y-2">
                {leftPanelMainItems.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={listItemVariants}
                    whileHover="hover"
                    animate={activeView === item.id ? "hover" : "visible"}
                    className={`
                      text-white cursor-pointer transition-all duration-300
                      px-4 py-2.5 rounded-full flex items-center gap-3 text-[14px]
                      ${activeView === item.id 
                        ? 'text-[#83bce3] bg-[#83bce3]/20 shadow-lg font-medium' 
                        : 'hover:text-[#83bce3] hover:bg-[#83bce3]/20'
                      }
                    `}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {React.cloneElement(item.icon, { strokeWidth: 2 })}
                    {item.text}
                  </motion.div>
                ))}
              </div>

              {/* Bottom Menu Items */}
              <div className="mt-auto pt-6">
                <motion.div
                  variants={listItemVariants}
                  whileHover="hover"
                  className="px-4 py-2.5 rounded-full"
                >
                  <button
                    onClick={handleLogout}
                    className="text-white transition-all duration-300 hover:text-[#83bce3] flex items-center gap-3 text-[14px] w-full hover:bg-[#83bce3]/20 px-4 py-2 rounded-full"
                  >
                    <LogOut size={20} strokeWidth={2} />
                    Log out
                  </button>
                </motion.div>
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
          className="hidden lg:flex w-[170px] bg-[#280832] min-h-screen fixed left-0 flex-col justify-between p-4 pb-20 overflow-y-auto"
        >
          <div className="space-y-6">
            <motion.ul className="space-y-3">
              {leftPanelMainItems.map((item, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                  animate={activeView === item.id ? "hover" : "visible"}
                  className={`
                    text-white cursor-pointer transition-all duration-300
                    px-3 py-2 rounded-lg flex items-center gap-2 text-sm
                    ${activeView === item.id 
                      ? 'text-[#83bce3] bg-[#83bce3]/10 shadow-lg' 
                      : 'hover:text-[#83bce3]'
                    }
                  `}
                  onClick={() => setActiveView(item.id)}
                >
                  {item.icon}
                  {item.text}
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <div className="mt-auto pt-6">
            <motion.ul className="space-y-3">
              <motion.li
                variants={listItemVariants}
                whileHover="hover"
                className="px-3 py-2 rounded-lg"
              >
                <button
                  onClick={handleLogout}
                  className="text-white transition-colors hover:text-[#83bce3] flex items-center gap-2 text-sm"
                >
                  <LogOut size={18} />
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
          className="flex-1 p-4 md:p-8 lg:ml-[170px]"
        >
          {renderMainContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;