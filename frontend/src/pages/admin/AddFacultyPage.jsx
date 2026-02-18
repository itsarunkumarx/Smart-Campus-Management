import { useState } from 'react';
import { adminService } from '../../services';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const AddFacultyPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        facultyId: '',
        designation: 'Assistant Professor',
    });

    const departments = [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Business Administration',
        'Mathematics',
        'Physics'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminService.addFaculty(formData);
            toast.success('Faculty added successfully! Default password: faculty123');
            navigate('/admin/users?role=faculty');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to add faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Institutional Faculty Onboarding</h1>
                    <p className="text-slate-600 dark:text-slate-400">Register new faculty members into the Smart Campus system.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                >
                    ← Back
                </button>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white dark:border-slate-800 transition-all duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. Dr. Jane Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Institutional Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="jane.doe@college.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
                            <select
                                className="input"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Faculty ID</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. FAC-2024-001"
                                value={formData.facultyId}
                                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. Associate Professor"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex gap-3">
                            <span className="text-2xl">🔐</span>
                            <div>
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Security Note</h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-400">
                                    The default password for all new faculty is <code className="font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded">faculty123</code>.
                                    They will be forced to change this upon their first login.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary px-10 py-3 text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Complete Onboarding'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
