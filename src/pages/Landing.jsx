import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import AuthForms from "../components/auth";
import mainImage from '../assets/main_img.png';
import leftImage from '../assets/left.png';
import middleImage from '../assets/middle.png';
import rightImage from '../assets/right.svg';
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Printer, Menu, X, Home, Info, Layout, PhoneCall } from 'lucide-react';
import logo from '../assets/moneymind.png';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [formType, setFormType] = useState("signin");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);

  const [headerRef, headerInView] = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const [featuresRef, featuresInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleShowAuth = (formType) => {
    setShowAuth(true);
    setFormType(formType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-roboto font-extralight">
      {/* Integrated Header */}
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
                    onClick={() => { handleShowAuth("signin-form"); }}
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <button
                    className="inline-block px-4 md:px-5 py-2 md:py-2.5 text-white rounded-full text-[14px] md:text-[15px] font-medium border-[1.5px] border-[#20D982] bg-[#20D982]/10 transition-all duration-300 hover:bg-[#20D982] hover:text-black"
                    onClick={() => { handleShowAuth("signup-form"); }}
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
                  onClick={() => { handleShowAuth("signin-form"); setIsMenuOpen(false); }}
                >
                  Sign In
                </button>
                <button
                  className="w-full px-4 py-2 rounded-full text-white text-[14px] font-medium border-[1.5px] border-[#20D982] bg-[#20D982]/10 transition-all duration-300 hover:bg-[#20D982] hover:text-black"
                  onClick={() => { handleShowAuth("signup-form"); setIsMenuOpen(false); }}
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Hero Section */}
      <div className="mt-[80px] md:mt-[150px] flex flex-col md:flex-row justify-between items-center md:items-start px-4 md:px-8 min-h-[450px] md:h-auto w-full">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:hidden block w-[80%] max-w-[300px] mb-8 mt-4"
        >
          <img
            src={mainImage}
            alt="Hero Image"
            className="w-full h-auto object-contain"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:block flex-[0.4] mt-[80px] flex-shrink basis-0"
        >
          <img
            src={mainImage}
            alt="Hero Image"
            className="w-full max-w-[600px] h-auto object-contain"
          />
        </motion.div>

        {/* Main Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-full md:flex-[0.6] flex-shrink basis-0 flex justify-center items-center md:items-start ${
            showAuth ? "w-full" : ""
          }`}
        >
          {!showAuth ? (
            <div className="text-center w-full px-4 md:px-0">
              <h1 className="text-[28px] md:text-[60px] text-white font-normal mb-4 font-['Space_Grotesk'] leading-tight">
                Effortless Financial Management at{" "}
                <span className="text-[#bbe86f]">Your Fingertips</span>
              </h1>
              <p className="text-white font-roboto font-extralight leading-relaxed mb-8 text-[15px] md:text-base">
                Create an account today and begin tracking all your expenses, organizing transactions, and monitoring subscriptions in real time, helping you stay in control of your financial health.
              </p>
              <button
                className="bg-[#20D982] text-black px-6 md:px-8 py-3 md:py-4 rounded-full text-[14px] md:text-[15px] font-normal transition-all duration-300 hover:bg-[#bbe86f] cursor-pointer font-roboto"
                onClick={() => handleShowAuth("signup-form")}
              >
                Get Started Now
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex justify-center px-4 md:px-0"
            >
              <AuthForms initialForm={formType} onClose={handleCloseAuth} />
            </motion.div>
          )}
        </motion.div>
      </div>

      <hr className="border-none h-[2px] bg-black my-4 md:my-8" />

      <section 
        id="services"
        ref={featuresRef} 
        className="py-8 md:py-12 px-4 md:px-6 bg-black relative mt-[30px] md:mt-[50px] mb-[60px] md:mb-[110px] scroll-mt-[100px]"
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          className="text-2xl md:text-3xl font-bold text-center text-white mb-6 md:mb-8"
        >
          Our Services
        </motion.h2>
        <div className="flex justify-center overflow-x-auto scrollbar-hide md:overflow-visible">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-4 md:px-0 w-full md:max-w-6xl mx-auto justify-center">
            {[
              {
                title: "Real-time Monitoring",
                description: "Track your daily, weekly, and monthly expenses with live updates.",
                image: leftImage
              },
              {
                title: "Receipt Scanning",
                description: "Scan all your receipts, hence saving time.",
                image: middleImage
              },
              {
                title: "Visual Reports",
                description: "Generate beautiful charts and reports to analyze your spending patterns.",
                image: rightImage
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 md:p-5 w-full md:w-[30%] flex-shrink-0 h-[300px] md:h-[350px] flex flex-col items-center justify-between transition-all duration-300 hover:scale-102 hover:shadow-lg"
              >
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-black mb-2">{feature.title}</h3>
                  <p className="text-black text-sm md:text-base">{feature.description}</p>
                </div>
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-[150px] md:w-[200px] h-auto mt-4 object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-[#1d0324] py-4 md:py-5 text-center scroll-mt-[100px]">
        <h3 className="text-white text-xl md:text-2xl font-semibold mb-2 md:mb-3">About Us</h3>
        <p className="text-white max-w-2xl mx-auto px-4 text-sm md:text-base">
          Expense Tracker is dedicated to helping you manage your finances with ease. Our mission is to make budgeting stress-free.
        </p>
      </section>

      <footer className="bg-[#1d0324] text-white py-4 md:py-5 text-center">
        <hr className="border-white/20 max-w-6xl mx-auto mb-3 md:mb-4" />
        <p className="text-sm md:text-base">&copy; 2024 MoneyMind. All rights reserved.</p>
        <p className="text-sm md:text-base mt-2 text-center">
          Created by{" "}
          <a 
            href="https://yashwanth.site/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#20D982] hover:text-[#bbe86f] transition-colors duration-300 underline"
          >
            Yashwanth Munikuntla
          </a>
          {" "} — also known as{" "}
          <span className="text-gray-400">
            Yashwanth Goud, yashwanth535
          </span>
          , passionate full-stack developer & creator of MoneyMind.
        </p>
        <div className="mt-2 flex flex-col md:flex-row gap-1 md:gap-4 justify-center items-center text-xs md:text-sm">
          <a
            href="/policy"
            className="text-[#20D982] hover:text-[#bbe86f] underline transition-colors duration-300"
          >
            Privacy Policy
          </a>
          <span className="hidden md:inline-block text-gray-500">|</span>
          <a
            href="/terms"
            className="text-[#20D982] hover:text-[#bbe86f] underline transition-colors duration-300"
          >
            Terms of Service
          </a>
        </div>

      </footer>
    </div>
  );
};

export default LandingPage;