import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-gold-light border border-slate-200 dark:border-white/10 hover:border-gold-metallic dark:hover:border-gold-metallic transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-metallic/20 shadow-sm"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                        <motion.div
                            key="moon"
                            initial={{ y: 20, opacity: 0, rotate: 45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -20, opacity: 0, rotate: -45 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Moon size={20} className="text-indigo-400" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ y: 20, opacity: 0, rotate: 45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -20, opacity: 0, rotate: -45 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Sun size={20} className="text-amber-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
};

export default ThemeToggle;
