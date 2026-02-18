import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMousePosition } from '../../hooks/useMousePosition';
import { motion, useSpring, useTransform } from 'framer-motion';

export const RoleSelectionPage = () => {
    const [hoveredRole, setHoveredRole] = useState(null);
    const { x, y } = useMousePosition();

    // Smooth spring physics for parallax
    const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    // Background parallax transforms
    const blob1X = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
    const blob1Y = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);
    const blob2X = useTransform(mouseX, [0, window.innerWidth], [20, -20]);
    const blob2Y = useTransform(mouseY, [0, window.innerHeight], [20, -20]);

    // Header parallax
    const headerX = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);
    const headerY = useTransform(mouseY, [0, window.innerHeight], [-5, 5]);

    const roles = [
        {
            role: 'student',
            title: 'Student Portal',
            description: 'Access courses, attendance, placements, and connect with your campus community',
            icon: '🎓',
            gradient: 'from-[#1e293b] via-[#334155] to-[#d4af37]',
            hoverGradient: 'from-[#334155] via-[#475569] to-[#f9e272]',
            features: ['Institutional Attendance', 'Placement Hub', 'Social Grid', 'Neural Assistant'],
        },
        {
            role: 'faculty',
            title: 'Faculty Portal',
            description: 'Manage classes, track student progress, and coordinate academic activities',
            icon: '👩‍🏫',
            gradient: 'from-[#422006] via-[#713f12] to-[#d4af37]',
            hoverGradient: 'from-[#713f12] via-[#a16207] to-[#f9e272]',
            features: ['Class Management', 'Analytics Grid', 'Local Broadcasts', 'Institutional Events'],
        },
        {
            role: 'admin',
            title: 'Admin Portal',
            description: 'Oversee campus operations, manage users, and monitor system analytics',
            icon: '👨‍💼',
            gradient: 'from-[#064e3b] via-[#065f46] to-[#d4af37]',
            hoverGradient: 'from-[#065f46] via-[#047857] to-[#f9e272]',
            features: ['User Grid', 'Full System Analytics', 'Protocol Approvals', 'Archive Reports'],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
            {/* Animated Background Elements - adaptive */}
            {/* Animated Background Elements - Parallax aware */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    style={{ x: blob1X, y: blob1Y }}
                    className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-gold-metallic/10 dark:bg-amber-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"
                ></motion.div>
                <motion.div
                    style={{ x: blob2X, y: blob2Y }}
                    className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-gold-metallic/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"
                ></motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-40 left-20 w-80 h-80 bg-gold-metallic/10 dark:bg-indigo-900/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
                ></motion.div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-20">
                {/* Header */}
                <motion.div
                    style={{ x: headerX, y: headerY }}
                    className="text-center mb-16 animate-fade-in"
                >
                    <div className="inline-block mb-6">
                        <div className="flex items-center gap-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl px-6 py-3 rounded-full border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-500 hover:scale-105 cursor-default">
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-metallic to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-metallic/20">
                                <span className="text-white font-bold text-xl drop-shadow-sm">SC</span>
                            </div>
                            <span className="text-slate-900 dark:text-white font-black text-xl tracking-tighter uppercase italic">Smart Campus</span>
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-slate-950 via-slate-800 to-amber-700 dark:from-white dark:via-amber-200 dark:to-gold-metallic bg-clip-text text-transparent uppercase tracking-tighter italic drop-shadow-2xl">
                        Choose Your Portal
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-amber-100/60 max-w-2xl mx-auto font-medium">
                        Select your specialized role to access your personalized institutional dashboard
                    </p>
                </motion.div>

                {/* Role Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {roles.map(({ role, title, description, icon, gradient, hoverGradient, features }) => (
                        <Link
                            key={role}
                            to={`/login/${role}`}
                            onMouseEnter={() => setHoveredRole(role)}
                            onMouseLeave={() => setHoveredRole(null)}
                            className="group relative"
                        >
                            {/* Glow effect - subtle in light mode */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 dark:opacity-0 group-hover:opacity-20 dark:group-hover:opacity-75 transition duration-500`}></div>

                            {/* Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-gold-metallic/50 dark:hover:border-gold-metallic/30 shadow-2xl dark:shadow-none transition-all duration-300 transform h-full overflow-hidden"
                            >
                                {/* Icon */}
                                <div className={`w-20 h-20 bg-gradient-to-br ${hoveredRole === role ? hoverGradient : gradient} rounded-2xl flex items-center justify-center text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                    {icon}
                                </div>

                                {/* Content */}
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
                                <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">{description}</p>

                                {/* Features */}
                                <div className="space-y-2 mb-6">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-cyan-400"></div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action */}
                                <div className="flex items-center justify-between text-indigo-600 dark:text-white font-semibold group-hover:gap-4 transition-all">
                                    <span>Enter Portal</span>
                                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                                </div>

                                {/* Corner decoration */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-gold-metallic/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all bg-white dark:bg-white/5 px-6 py-3 rounded-full backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                        <span>←</span>
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};
