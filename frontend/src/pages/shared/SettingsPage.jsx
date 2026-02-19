import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService, api } from '../../services';

export const SettingsPage = () => {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [accountForm, setAccountForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
        department: user?.department || '',
        year: user?.year || 1,
    });

    const [socialForm, setSocialForm] = useState({
        bio: user?.bio || '',
        skills: user?.skills?.join(', ') || '',
        certifications: user?.certifications?.join(', ') || '',
        github: user?.socialLinks?.github || '',
        linkedin: user?.socialLinks?.linkedin || '',
        instagram: user?.socialLinks?.instagram || '',
        website: user?.socialLinks?.website || '',
    });

    const [academicForm, setAcademicForm] = useState({
        cgpa: user?.academicInfo?.cgpa || 0,
        semester: user?.academicInfo?.semester || 1,
        currentSubjects: user?.academicInfo?.currentSubjects?.join(', ') || '',
    });

    const [facultyForm, setFacultyForm] = useState({
        facultyId: user?.facultyInfo?.facultyId || '',
        designation: user?.facultyInfo?.designation || '',
        officeHours: user?.facultyInfo?.officeHours || '',
        experience: user?.facultyInfo?.experience || 0,
    });

    const [privacySettings, setPrivacySettings] = useState({
        showEmail: user?.privacy?.showEmail ?? true,
        showPhone: user?.privacy?.showPhone ?? false,
        publicProfile: user?.privacy?.publicProfile ?? true,
    });

    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return setMessage({ type: 'error', text: 'Institutional security protocol: Only image assets allowed.' });
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const baseUrl = apiUrl.replace(/\/api$/, '');
            const fullUrl = `${baseUrl}${response.data.url}`;
            setAccountForm({ ...accountForm, profileImage: fullUrl });
            setMessage({ type: 'success', text: 'Profile image archived. Sync Identity to finalize.' });
        } catch (error) {
            console.error('Image upload failed:', error);
            const errorMessage = error.response?.data?.message || 'Asset archiving failed.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setUploading(false);
        }
    };

    const handleProfileUpdate = async (updateData) => {
        setLoading(true);
        try {
            await updateProfile(updateData);
            setMessage({ type: 'success', text: 'Profile synced and updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleBasicSubmit = (e) => {
        e.preventDefault();
        handleProfileUpdate(accountForm);
    };

    const handleSocialSubmit = (e) => {
        e.preventDefault();
        handleProfileUpdate({
            bio: socialForm.bio,
            skills: socialForm.skills.split(',').map(s => s.trim()).filter(s => s),
            certifications: socialForm.certifications.split(',').map(s => s.trim()).filter(s => s),
            socialLinks: {
                github: socialForm.github,
                linkedin: socialForm.linkedin,
                instagram: socialForm.instagram,
                website: socialForm.website,
            }
        });
    };

    const handleAcademicSubmit = (e) => {
        e.preventDefault();
        handleProfileUpdate({
            academicInfo: {
                ...academicForm,
                currentSubjects: academicForm.currentSubjects.split(',').map(s => s.trim()).filter(s => s)
            }
        });
    };

    const handleFacultySubmit = (e) => {
        e.preventDefault();
        handleProfileUpdate({ facultyInfo: facultyForm });
    };

    const handlePrivacyToggle = (field) => {
        const newPrivacy = { ...privacySettings, [field]: !privacySettings[field] };
        setPrivacySettings(newPrivacy);
        handleProfileUpdate({ privacy: newPrivacy });
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        try {
            await updateProfile({ password: securityForm.newPassword });
            setMessage({ type: 'success', text: 'Security credentials updated!' });
            setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm('Are you sure you want to deactivate your institutional manifest? This will restrict your access until reactivation.')) return;
        setLoading(true);
        try {
            await authService.deactivateAccount();
            logout();
        } catch (err) {
            setMessage({ type: 'error', text: 'Deactivation protocol failed.' });
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('CRITICAL ACTION: This will permanently purge your manifest from the institutional database. This action is irreversible. Proceed?')) return;
        setLoading(true);
        try {
            await authService.deleteAccount();
            logout();
        } catch (err) {
            setMessage({ type: 'error', text: 'Purge protocol failed.' });
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Identity', icon: '👤' },
        ...(user?.role === 'student' ? [{ id: 'academic', label: 'Academic', icon: '🎓' }] : []),
        ...(user?.role === 'faculty' ? [{ id: 'professional', label: 'Professional', icon: '💼' }] : []),
        { id: 'social', label: 'Portfolio', icon: '✨' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'privacy', label: 'Privacy', icon: '🛡️' },
        { id: 'management', label: 'Account', icon: '⚙️' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-500">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <form onSubmit={handleBasicSubmit} className="space-y-6">
                            <h3 className="text-xl font-bold uppercase tracking-tighter">Core Identity</h3>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                                            {accountForm.profileImage ? (
                                                <img src={accountForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-2xl font-black text-indigo-600">
                                                    {accountForm.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Institutional Avatar</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <label className="btn btn-secondary py-2 px-4 text-[10px] cursor-pointer">
                                                {uploading ? 'Archiving...' : 'Upload New Asset'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                            {accountForm.profileImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAccountForm({ ...accountForm, profileImage: '' })}
                                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Institutional Username</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={accountForm.username}
                                        onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value.toLowerCase() })}
                                        required
                                    />
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">Changing this will update your institutional signal ID</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={accountForm.name}
                                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={accountForm.phone}
                                        onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary px-8">
                                {loading ? 'Syncing...' : 'Sync Identity'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'academic' && (
                        <form onSubmit={handleAcademicSubmit} className="space-y-6">
                            <h3 className="text-xl font-bold uppercase tracking-tighter">Academic Transcript</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current CGPA</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input"
                                        value={academicForm.cgpa}
                                        onChange={(e) => setAcademicForm({ ...academicForm, cgpa: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Semester</label>
                                    <select
                                        className="input"
                                        value={academicForm.semester}
                                        onChange={(e) => setAcademicForm({ ...academicForm, semester: parseInt(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subjects (Comma separated)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Data Structures, OS, Networking"
                                        value={academicForm.currentSubjects}
                                        onChange={(e) => setAcademicForm({ ...academicForm, currentSubjects: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary px-8">Save Academic Data</button>
                        </form>
                    )}

                    {activeTab === 'professional' && (
                        <form onSubmit={handleFacultySubmit} className="space-y-6">
                            <h3 className="text-xl font-bold uppercase tracking-tighter">Professional Credentials</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Faculty ID</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={facultyForm.facultyId}
                                        onChange={(e) => setFacultyForm({ ...facultyForm, facultyId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Designation</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={facultyForm.designation}
                                        onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Office Hours</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Mon-Fri, 2PM - 4PM"
                                        value={facultyForm.officeHours}
                                        onChange={(e) => setFacultyForm({ ...facultyForm, officeHours: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary px-8">Update Credentials</button>
                        </form>
                    )}

                    {activeTab === 'social' && (
                        <form onSubmit={handleSocialSubmit} className="space-y-6">
                            <h3 className="text-xl font-bold uppercase tracking-tighter">Professional Portfolio</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Biographical Manifesto</label>
                                    <textarea
                                        rows="4"
                                        className="input"
                                        value={socialForm.bio}
                                        onChange={(e) => setSocialForm({ ...socialForm, bio: e.target.value })}
                                        placeholder="Your institutional narrative..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Expertise & Skills (CSV)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={socialForm.skills}
                                        onChange={(e) => setSocialForm({ ...socialForm, skills: e.target.value })}
                                        placeholder="React, Java, Cloud Computing"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Certifications (CSV)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={socialForm.certifications}
                                        onChange={(e) => setSocialForm({ ...socialForm, certifications: e.target.value })}
                                        placeholder="AWS Certified, Google Cloud Associate"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">GitHub Profile URL</label>
                                        <input
                                            type="url"
                                            className="input"
                                            value={socialForm.github}
                                            onChange={(e) => setSocialForm({ ...socialForm, github: e.target.value })}
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">LinkedIn Profile URL</label>
                                        <input
                                            type="url"
                                            className="input"
                                            value={socialForm.linkedin}
                                            onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instagram Profile URL</label>
                                        <input
                                            type="url"
                                            className="input"
                                            value={socialForm.instagram}
                                            onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                                            placeholder="https://instagram.com/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Personal Website/Portfolio</label>
                                        <input
                                            type="url"
                                            className="input"
                                            value={socialForm.website}
                                            onChange={(e) => setSocialForm({ ...socialForm, website: e.target.value })}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary px-8">Manifest Portfolio</button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handleSecuritySubmit} className="space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                    🛡️
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tighter">Security Protocols</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Credential Rotation Service</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Institutional Access Key (New Password)</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={securityForm.newPassword}
                                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                        minLength="6"
                                        placeholder="Min 6 characters required"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Verify Access Key</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={securityForm.confirmPassword}
                                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                        placeholder="Repeat access key"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={loading} className="w-full md:w-auto btn btn-primary px-12 py-4">
                                    {loading ? 'Encrypting...' : 'Rotate Access Keys'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold uppercase tracking-tighter">Privacy Sovereignty</h3>
                            <div className="space-y-4">
                                <PrivacyToggle
                                    label="Public Profile Visibility"
                                    desc="Allow other scouts to discover your manifest"
                                    active={privacySettings.publicProfile}
                                    onClick={() => handlePrivacyToggle('publicProfile')}
                                />
                                <PrivacyToggle
                                    label="Institutional Email Disclosure"
                                    desc="Show email on your public scout profile"
                                    active={privacySettings.showEmail}
                                    onClick={() => handlePrivacyToggle('showEmail')}
                                />
                                <PrivacyToggle
                                    label="Communication Line Disclosure"
                                    desc="Expose phone number to verified faculty"
                                    active={privacySettings.showPhone}
                                    onClick={() => handlePrivacyToggle('showPhone')}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'management' && (
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-tighter text-gray-900 dark:text-white">Account Sovereignty</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Manage your core institutional status</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Deactivate Manifest</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">Temporarily secure your account. Active signals will be paused.</p>
                                        </div>
                                        <button
                                            onClick={handleDeactivate}
                                            disabled={loading}
                                            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Deactivate
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 transition-all hover:border-rose-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight text-rose-600">Institutional Purge</p>
                                            <p className="text-[10px] font-bold text-rose-400 uppercase mt-1 italic">Permanently delete your profile and all associated data. IRREVERSIBLE.</p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Purge Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PrivacyToggle = ({ label, desc, active, onClick }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:border-indigo-200">
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{label}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">{desc}</p>
        </div>
        <button
            onClick={onClick}
            className={`w-12 h-6 rounded-full relative transition-all ${active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
        </button>
    </div>
);
