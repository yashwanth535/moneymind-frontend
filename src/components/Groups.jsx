import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const Groups = () => {
  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Groups</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#280832] rounded-xl p-8 shadow-lg text-center"
      >
        <Users className="w-16 h-16 text-[#83bce3] mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-3">Coming Soon!</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Group expense tracking and shared budgets are on the way. Stay tuned for exciting new features that will help you manage finances with friends and family.
        </p>
      </motion.div>
    </div>
  );
};

export default Groups; 