import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useMousePosition } from '../../hooks/useMousePosition';

export const LandingPage = () => {
    const { x, y } = useMousePosition();

    // Smooth spring physics for hero parallax
    const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    // Background parallax transforms
    const bgX = useTransform(mouseX, [0, window.innerWidth], [-30, 30]);
    const bgY = useTransform(mouseY, [0, window.innerHeight], [-30, 30]);

    // Hero text parallax
    const textX = useTransform(mouseX, [0, window.innerWidth], [-15, 15]);
    const textY = useTransform(mouseY, [0, window.innerHeight], [-8, 8]);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated background elements - adaptive & parallax aware */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        style={{ x: bgX, y: bgY }}
                        className="absolute top-0 left-1/4 w-[50rem] h-[50rem] bg-gold-metallic/5 dark:bg-amber-500/10 rounded-full filter blur-[120px] animate-pulse"
                    ></motion.div>
                    <motion.div
                        style={{ x: useTransform(mouseX, [0, window.innerWidth], [30, -30]), y: useTransform(mouseY, [0, window.innerHeight], [30, -30]) }}
                        className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 dark:bg-gold-metallic/5 rounded-full filter blur-[120px] animate-pulse animation-delay-1000"
                    ></motion.div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 mb-8 animate-fade-in shadow-sm dark:shadow-none">
                            <div className="w-2 h-2 bg-gold-metallic dark:bg-amber-400 rounded-full animate-pulse"></div>
                            <span className="text-slate-600 dark:text-slate-300 text-sm font-black uppercase tracking-widest">Enterprise-Grade Campus Grid</span>
                        </div>

                        {/* Main Heading with Parallax */}
                        <motion.h1
                            style={{ x: textX, y: textY }}
                            className="text-6xl md:text-8xl font-black mb-8 animate-slide-up uppercase tracking-tighter italic"
                        >
                            <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-amber-700 dark:from-white dark:via-white/90 dark:to-gold-metallic bg-clip-text text-transparent drop-shadow-2xl">
                                Smart Campus
                            </span>
                            <br />
                            <span className="text-slate-900 dark:text-white drop-shadow-xl">Management</span>
                        </motion.h1>

                        <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-500">
                            A comprehensive platform for students, faculty, and administrators to manage academic
                            activities, collaborate seamlessly, and elevate campus experience
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap justify-center gap-6 animate-fade-in animation-delay-1000">
                            <Link
                                to="/register"
                                className="btn btn-primary px-8 py-4 sm:px-12 sm:py-5 text-xl tracking-tight"
                            >
                                <span className="relative z-10 uppercase font-black text-sm sm:text-base">Initialize Interface</span>
                            </Link>
                            <Link
                                to="/role-selection"
                                className="btn btn-secondary px-8 py-4 sm:px-12 sm:py-5 text-xl min-w-[200px]"
                            >
                                Sign In →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { number: '10K+', label: 'Active Students', icon: '🎓' },
                        { number: '500+', label: 'Faculty Members', icon: '📖' },
                        { number: '50+', label: 'Departments', icon: '🏢' },
                        { number: '99.9%', label: 'Uptime', icon: '⚡' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 dark:border-white/10 text-center hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm">
                            <div className="text-4xl mb-3">{stat.icon}</div>
                            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.number}</div>
                            <div className="text-slate-500 dark:text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Powerful Features</h2>
                    <p className="text-xl text-slate-600 dark:text-gray-400">Everything you need in one platform</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: '📊', title: 'Attendance', desc: 'Real-time tracking', color: 'from-blue-500 to-cyan-500' },
                        { icon: '💼', title: 'Placements', desc: 'Job opportunities', color: 'from-purple-500 to-pink-500' },
                        { icon: '🎓', title: 'Scholarships', desc: 'Financial aid', color: 'from-green-500 to-teal-500' },
                        { icon: '🎉', title: 'Events', desc: 'Campus activities', color: 'from-orange-500 to-red-500' },
                        { icon: '💬', title: 'Social Feed', desc: 'Connect & share', color: 'from-indigo-500 to-purple-500' },
                        { icon: '📝', title: 'Complaints', desc: 'Quick resolution', color: 'from-pink-500 to-rose-500' },
                        { icon: '🤖', title: 'AI Assistant', desc: 'Instant help', color: 'from-cyan-500 to-blue-500' },
                        { icon: '🔔', title: 'Notifications', desc: 'Stay updated', color: 'from-yellow-500 to-amber-500' },
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-white dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-sm"
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-3xl mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-gray-400">{feature.desc}</p>
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role Highlights */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '👨‍🎓',
                            title: 'For Students',
                            desc: 'Track attendance, apply for placements, connect with peers, and access AI assistance',
                            gradient: 'from-blue-600 to-indigo-600',
                        },
                        {
                            icon: '👨‍🏫',
                            title: 'For Faculty',
                            desc: 'Manage attendance, post announcements, monitor student progress, and create events',
                            gradient: 'from-purple-600 to-pink-600',
                        },
                        {
                            icon: '👨‍💼',
                            title: 'For Admins',
                            desc: 'Oversee operations, manage users, handle placements, scholarships, and analytics',
                            gradient: 'from-green-600 to-teal-600',
                        },
                    ].map((role, idx) => (
                        <div key={idx} className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-r ${role.gradient} rounded-2xl blur opacity-10 dark:opacity-25 group-hover:opacity-30 dark:group-hover:opacity-75 transition duration-500`}></div>
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-500">
                                <div className="text-6xl mb-4">{role.icon}</div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{role.title}</h3>
                                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">{role.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-sky-600 rounded-3xl blur-xl opacity-20 dark:opacity-50"></div>
                    <div className="relative bg-gradient-to-r from-indigo-600 to-sky-600 rounded-3xl p-12 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-indigo-100 mb-8">Join thousands of students, faculty, and administrators</p>
                        <Link
                            to="/register"
                            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-slate-50 transform hover:-translate-y-1 transition-all duration-300 shadow-xl"
                        >
                            Create Your Account Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-lg py-12 mt-20 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-500 dark:text-gray-400">&copy; 2024 Smart Campus Management System. All rights reserved.</p>
                </div>
            </footer>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 1s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
          animation-fill-mode: backwards;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
          animation-fill-mode: backwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
};
