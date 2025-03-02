import React from "react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { Menu, X, Home, Info, Layout } from 'lucide-react';
import logo from '../assets/moneymind.png';

const LandingHeader = ({ setShowAuth, setFormType, isMenuOpen, setIsMenuOpen }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, reload: true },
    { name: 'Services', path: '#services', icon: Layout, action: () => scrollToSection('services') },
    { name: 'About', path: '#about', icon: Info, action: () => scrollToSection('about') }
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed w-full z-50 bg-[#280832] h-[60px] md:h-[70px] shadow-lg"
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo Section */}
          <div className="flex-1 flex items-center">
            <Link to="/" onClick={() => window.location.reload()} className="group">
              <img 
                src={logo} 
                alt="Money Mind Logo" 
                className="h-auto w-[150px] md:w-[200px] object-contain transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-lg"
              />
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 hidden md:block">
            <nav className="flex justify-center">
              <ul className="flex gap-3 md:gap-5 items-center">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.path}
                      className="inline-block px-3 md:px-5 py-2 md:py-2.5 text-white rounded-full text-[14px] md:text-[15px] font-medium transition-all duration-300 hover:bg-[#83bce3] hover:text-black hover:scale-105 hover:shadow-md"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.action) {
                          item.action();
                        } else if (item.reload) {
                          window.location.href = item.path;
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Auth Buttons Section */}
          <div className="flex-1 hidden md:block">
            <ul className="flex justify-end gap-2 md:gap-[10px] items-center">
              <li>
                <button
                  className="inline-block px-4 md:px-5 py-2 md:py-2.5 text-white rounded-full text-[14px] md:text-[15px] font-medium border-[1.5px] border-[#20D982] bg-[#20D982]/10 transition-all duration-300 hover:bg-[#20D982] hover:text-black"
                  onClick={() => { setShowAuth(true); setFormType("signin-form"); }}
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  className="inline-block px-4 md:px-5 py-2 md:py-2.5 text-white rounded-full text-[14px] md:text-[15px] font-medium border-[1.5px] border-[#20D982] bg-[#20D982]/10 transition-all duration-300 hover:bg-[#20D982] hover:text-black"
                  onClick={() => { setShowAuth(true); setFormType("signup-form"); }}
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:bg-[#83bce3]/20 rounded-full transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial="hidden"
          animate={isMenuOpen ? "visible" : "hidden"}
          variants={{
            visible: { height: 'auto', opacity: 1 },
            hidden: { height: 0, opacity: 0 }
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden bg-[#280832] absolute left-0 right-0 top-[60px] border-t border-[#20D982]/20"
        >
          <div className="py-3 space-y-2 px-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="flex items-center space-x-2 px-4 py-2 text-white rounded-full text-[14px] font-medium hover:bg-[#83bce3] hover:text-black transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.action) {
                    item.action();
                  } else if (item.reload) {
                    window.location.href = item.path;
                  }
                }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <button
                className="w-full px-4 py-2 rounded-full text-white text-[14px] font-medium border-[1.5px] border-[#20D982] bg-[#20D982]/10 transition-all duration-300 hover:bg-[#20D982] hover:text-black"
                onClick={() => { setShowAuth(true); setFormType("signin"); setIsMenuOpen(false); }}
              >
                Sign In
              </button>
              <button
                className="w-full px-4 py-2 rounded-full text-white text-[14px] font-medium border-[1.5px] border-[#20D982] bg-[#20D982]/10 transition-all duration-300 hover:bg-[#20D982] hover:text-black"
                onClick={() => { setShowAuth(true); setFormType("signup"); setIsMenuOpen(false); }}
              >
                Get Started
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;