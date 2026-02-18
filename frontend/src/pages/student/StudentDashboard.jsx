import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services';
import { ProfileCompletionBanner } from '../../components/ProfileCompletionBanner';

export const StudentDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const data = await studentService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-metallic"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ProfileCompletionBanner />
            <div>
                <h1 className="text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter italic leading-none">
                    Student <span className="text-gold-metallic">Portal</span>
                </h1>
                <p className="text-gray-500 dark:text-amber-100/60 mt-3 font-bold flex items-center gap-2 text-xs md:text-sm">
                    <span className="w-8 h-[2px] bg-slate-900 dark:bg-gold-metallic"></span>
                    ACADEMIC OVERVIEW · SYSTEM SYNC ACTIVE
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gold-metallic mb-2">Institutional Attendance</h3>
                        <p className="text-5xl font-black tracking-tighter italic">{dashboardData?.attendancePercentage || 0}%</p>
                        <p className="text-[10px] mt-4 font-black uppercase tracking-widest text-slate-400">Verified Presence</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gold-metallic/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="glass-card p-8 bg-white dark:bg-white/5 border-slate-200 dark:border-gold-metallic/10 relative overflow-hidden group transition-all hover:scale-[1.02]">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Campus Events</h3>
                        <p className="text-5xl font-black tracking-tighter italic text-gray-900 dark:text-white">{dashboardData?.upcomingEvents?.length || 0}</p>
                        <p className="text-[10px] mt-4 font-black uppercase tracking-widest text-gold-metallic">Active Sessions</p>
                    </div>
                </div>

                <div className="glass-card p-8 bg-gold-metallic text-slate-950 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-950/60 mb-2">Direct Intel</h3>
                        <p className="text-5xl font-black tracking-tighter italic">{dashboardData?.unreadCount || 0}</p>
                        <p className="text-[10px] mt-4 font-black uppercase tracking-widest text-slate-950/40">Unread Logs</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                {dashboardData?.upcomingEvents?.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.upcomingEvents.map((event) => (
                            <div key={event._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold">{event.title}</h3>
                                    <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <Link to="/student/events" className="btn btn-outline btn-sm">
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No upcoming events</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
                <Link to="/student/attendance" className="card text-center hover:shadow-medium transition-shadow">
                    <div className="text-4xl mb-2">📅</div>
                    <h3 className="font-semibold">View Attendance</h3>
                </Link>
                <Link to="/student/placements" className="card text-center hover:shadow-medium transition-shadow">
                    <div className="text-4xl mb-2">💼</div>
                    <h3 className="font-semibold">Placements</h3>
                </Link>
                <Link to="/student/scholarships" className="card text-center hover:shadow-medium transition-shadow">
                    <div className="text-4xl mb-2">🎓</div>
                    <h3 className="font-semibold">Scholarships</h3>
                </Link>
                <Link to="/student/ai-assistant" className="card text-center hover:shadow-medium transition-shadow">
                    <div className="text-4xl mb-2">🤖</div>
                    <h3 className="font-semibold">AI Assistant</h3>
                </Link>
            </div>
        </div>
    );
};
