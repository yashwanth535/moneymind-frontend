import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0, 0.71, 0.2, 1.01]
        }}
      >
        <motion.h1
          className="text-5xl font-bold bg-gradient-to-r from-[#83bce3] to-[#20D982] inline-block text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          401 - Unauthorized
        </motion.h1>
      </motion.div>
      
      <motion.p
        className="mt-6 text-lg text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        You do not have permission to view this page. Please log in.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-8"
      >
        <Link
          to="/"
          className="px-6 py-3 bg-[#280832] text-white rounded-lg border border-[#20D982]/30 hover:bg-[#83bce3] hover:text-black transition-all duration-300 shadow-[0_0_5px_#83bce3]"
        >
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}
