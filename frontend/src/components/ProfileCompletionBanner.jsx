import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProfileCompletionBanner = () => {
    const { user } = useAuth();

    if (!user || user.isProfileComplete) return null;

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                        ✨
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Complete Your Profile!</h3>
                        <p className="text-amber-50 mt-1">
                            Your profile is incomplete. Fill in your academic and personal details to unlock all features.
                        </p>
                    </div>
                </div>
                <Link
                    to="/settings"
                    className="px-6 py-2 bg-white text-orange-600 rounded-xl font-bold hover:bg-amber-50 transform hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap"
                >
                    Setup Now →
                </Link>
            </div>
        </div>
    );
};
