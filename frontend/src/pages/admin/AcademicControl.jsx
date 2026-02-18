import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Briefcase,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    DollarSign,
    Building2,
    Users,
    Search,
    Send,
    Trophy,
    Target
} from 'lucide-react';
import { adminService, generalService } from '../../services';

export const AcademicControl = () => {
    const [activeTab, setActiveTab] = useState('placements');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Placement Form State
    const [placementData, setPlacementData] = useState({
        companyName: '',
        jobRole: '',
        package: '',
        eligibility: '',
        deadline: '',
        description: ''
    });

    // Scholarship Form State
    const [scholarshipData, setScholarshipData] = useState({
        name: '',
        amount: '',
        totalSlots: '',
        eligibility: '',
        deadline: '',
        description: ''
    });

    // Review Modal State
    const [viewingScholarship, setViewingScholarship] = useState(null);

    const handleUpdateStatus = async (scholarshipId, applicantId, status) => {
        try {
            await adminService.updateScholarshipApplicant(scholarshipId, applicantId, status);
            setMessage({ type: 'success', text: `Applicant marked as ${status}` });

            // Update local state
            const updatedItems = items.map(item => {
                if (item._id === scholarshipId) {
                    const updatedApplicants = item.applicants.map(app => {
                        if (app._id === applicantId) {
                            return { ...app, status };
                        }
                        return app;
                    });
                    return { ...item, applicants: updatedApplicants };
                }
                return item;
            });
            setItems(updatedItems);

            // Also update the viewing modal data
            if (viewingScholarship && viewingScholarship._id === scholarshipId) {
                setViewingScholarship({
                    ...viewingScholarship,
                    applicants: viewingScholarship.applicants.map(app =>
                        app._id === applicantId ? { ...app, status } : app
                    )
                });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Status update failed.' });
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = activeTab === 'placements'
                ? await generalService.getPlacements()
                : await generalService.getScholarships();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlacement = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const result = await adminService.createPlacement(placementData);
            setItems([result, ...items]);
            setShowForm(false);
            setPlacementData({ companyName: '', jobRole: '', package: '', eligibility: '', deadline: '', description: '' });
            setMessage({ type: 'success', text: 'Institutional placement launched successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Deployment failed.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleCreateScholarship = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const result = await adminService.createScholarship(scholarshipData);
            setItems([result, ...items]);
            setShowForm(false);
            setScholarshipData({ name: '', amount: '', totalSlots: '', eligibility: '', deadline: '', description: '' });
            setMessage({ type: 'success', text: 'Academic scholarship fund initialized!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Initialization failed.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <GraduationCap className="text-amber-500" size={32} />
                        Academic Control
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic border-l-2 border-amber-200 pl-3 ml-1">
                        Deployment of institutional opportunities and financial aid
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none shadow-amber-500/20 px-8 flex items-center gap-2"
                >
                    {showForm ? <XCircle size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cancel Operation' : activeTab === 'placements' ? 'Launch Placement' : 'Init Scholarship'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 w-fit">
                <button
                    onClick={() => { setActiveTab('placements'); setShowForm(false); }}
                    className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 ${activeTab === 'placements'
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Briefcase size={16} />
                    Career Placements
                </button>
                <button
                    onClick={() => { setActiveTab('scholarships'); setShowForm(false); }}
                    className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 ${activeTab === 'scholarships'
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Trophy size={16} />
                    Institutional Grants
                </button>
            </div>

            {/* Creation Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-10 border-amber-100 dark:border-amber-900/30">
                            {activeTab === 'placements' ? (
                                <form onSubmit={handleCreatePlacement} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Company Entity</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={placementData.companyName}
                                                    onChange={(e) => setPlacementData({ ...placementData, companyName: e.target.value })}
                                                    className="input pl-12 py-3 text-sm font-bold"
                                                    placeholder="E.g., Google DeepMind"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Job Role</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={placementData.jobRole}
                                                    onChange={(e) => setPlacementData({ ...placementData, jobRole: e.target.value })}
                                                    className="input pl-12 py-3 text-sm font-bold"
                                                    placeholder="E.g., AI Research Engineer"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Package (CTC)</label>
                                            <input
                                                type="text"
                                                value={placementData.package}
                                                onChange={(e) => setPlacementData({ ...placementData, package: e.target.value })}
                                                className="input py-3 text-sm font-bold"
                                                placeholder="E.g., 24 LPA"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Eligibility Criteria</label>
                                            <input
                                                type="text"
                                                value={placementData.eligibility}
                                                onChange={(e) => setPlacementData({ ...placementData, eligibility: e.target.value })}
                                                className="input py-3 text-sm font-bold"
                                                placeholder="E.g., 8.5+ CGPA"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Application Deadline</label>
                                            <input
                                                type="date"
                                                value={placementData.deadline}
                                                onChange={(e) => setPlacementData({ ...placementData, deadline: e.target.value })}
                                                className="input py-3 text-sm font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Role Description</label>
                                        <textarea
                                            value={placementData.description}
                                            onChange={(e) => setPlacementData({ ...placementData, description: e.target.value })}
                                            className="input min-h-[120px] py-4 text-sm leading-relaxed"
                                            placeholder="Outline the responsibilities and institutional benefit..."
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none px-12 py-4 flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                                        >
                                            {isSubmitting ? <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" /> : <Send size={20} />}
                                            Deploy to Student Terminals
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleCreateScholarship} className="space-y-6">
                                    {/* Similar form for Scholarship */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Scholarship Name</label>
                                            <input
                                                type="text"
                                                value={scholarshipData.name}
                                                onChange={(e) => setScholarshipData({ ...scholarshipData, name: e.target.value })}
                                                className="input py-3 text-sm font-bold"
                                                placeholder="E.g., Merit Excellence Fund"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Grant Amount</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={scholarshipData.amount}
                                                    onChange={(e) => setScholarshipData({ ...scholarshipData, amount: e.target.value })}
                                                    className="input pl-12 py-3 text-sm font-bold"
                                                    placeholder="E.g., ₹50,000 / Year"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Total Beneficiaries</label>
                                            <input
                                                type="number"
                                                value={scholarshipData.totalSlots}
                                                onChange={(e) => setScholarshipData({ ...scholarshipData, totalSlots: parseInt(e.target.value) })}
                                                className="input py-3 text-sm font-bold"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Selection Criteria</label>
                                            <input
                                                type="text"
                                                value={scholarshipData.eligibility}
                                                onChange={(e) => setScholarshipData({ ...scholarshipData, eligibility: e.target.value })}
                                                className="input py-3 text-sm font-bold"
                                                placeholder="E.g., Low Income / 90% Attendance"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Filing Deadline</label>
                                            <input
                                                type="date"
                                                value={scholarshipData.deadline}
                                                onChange={(e) => setScholarshipData({ ...scholarshipData, deadline: e.target.value })}
                                                className="input py-3 text-sm font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Description & Terms</label>
                                        <textarea
                                            value={scholarshipData.description}
                                            onChange={(e) => setScholarshipData({ ...scholarshipData, description: e.target.value })}
                                            className="input min-h-[120px] py-4 text-sm leading-relaxed"
                                            placeholder="Detail the academic spirit and requirements of this grant..."
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none px-12 py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20"
                                        >
                                            Initialize Fund
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse rounded-3xl" />)
                ) : items.length > 0 ? (
                    items.map((item, idx) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-8 border-slate-100 dark:border-slate-800 hover:border-amber-500 group transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-3xl">
                                    {activeTab === 'placements' ? <Building2 size={24} /> : <DollarSign size={24} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg">
                                        {item.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-amber-600 transition-colors">
                                {activeTab === 'placements' ? item.companyName : item.name}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {activeTab === 'placements' ? item.jobRole : `${item.amount} Grant`}
                            </p>

                            <div className="mt-8 space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Applications</span>
                                    <span className="text-gray-900 dark:text-white">{item.applicants?.length || 0} Nodes</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Expiry</span>
                                    <span className="text-rose-500">{new Date(item.deadline).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => activeTab === 'scholarships' && setViewingScholarship(item)}
                                className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:bg-amber-500 group-hover:text-white transition-all"
                            >
                                View Full Manifest
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center glass-card border-dashed">
                        <Target className="mx-auto text-slate-200 mb-4" size={64} />
                        <p className="text-gray-400 font-black uppercase tracking-widest">Archive Void</p>
                    </div>
                )}
            </div>


            {/* Review Modal */}
            <AnimatePresence>
                {viewingScholarship && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">{viewingScholarship.name}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Applicant Review Protocol</p>
                                </div>
                                <button onClick={() => setViewingScholarship(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <XCircle size={24} className="text-gray-400 hover:text-rose-500 transition-colors" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {viewingScholarship.applicants && viewingScholarship.applicants.length > 0 ? (
                                    viewingScholarship.applicants.map((applicant) => (
                                        <div key={applicant._id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{applicant.userId?.name || 'Unknown Student'}</p>
                                                    <p className="text-xs text-gray-500">{applicant.userId?.email}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {applicant.documents?.map((doc, i) => (
                                                            <a
                                                                key={i}
                                                                href={doc}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:underline flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 size={10} /> Document {i + 1}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${applicant.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                        applicant.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                                                            'bg-amber-100 text-amber-600'
                                                        }`}>
                                                        {applicant.status}
                                                    </span>
                                                    {applicant.status === 'pending' && (
                                                        <div className="flex gap-2 mt-1">
                                                            <button
                                                                onClick={() => handleUpdateStatus(viewingScholarship._id, applicant._id, 'approved')}
                                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(viewingScholarship._id, applicant._id, 'rejected')}
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-black uppercase tracking-widest">No applicants pending review</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};
