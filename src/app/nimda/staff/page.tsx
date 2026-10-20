'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { StaffUser } from '@/lib/types';
import {
  Users,
  UserPlus,
  Shield,
  Edit3,
  Trash2,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  CalendarCheck,
  FolderKanban,
  Grid,
  Newspaper,
  Megaphone,
  Image as ImageIcon,
  Settings,
  ShieldCheck,
  Search,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const CRM_MODULES_LIST = [
  { id: '/nimda/dashboard', name: 'Dashboard Overview', icon: LayoutDashboard, desc: 'Real-time Analytics & CRM Performance' },
  { id: '/nimda/leads', name: 'CRM Leads & Pipeline', icon: Users, desc: 'Lead Pipeline, Kanban & Customer Tracking' },
  { id: '/nimda/site-visits', name: 'Site Visit Manager', icon: CalendarCheck, desc: 'Customer Plot Visits & Pickup Routing' },
  { id: '/nimda/projects', name: 'Projects', icon: FolderKanban, desc: 'Gated Communities & Layout Management' },
  { id: '/nimda/plots', name: 'Plots Inventory', icon: Grid, desc: 'Plot Dimensions, Pricing & Availability' },
  { id: '/nimda/blogs', name: 'Blog Manager', icon: Newspaper, desc: 'Real Estate Articles & Buyer Guides' },
  { id: '/nimda/popups', name: 'Ad & Seasonal Popups', icon: Megaphone, desc: 'Festive Offers & Popup Banners' },
  { id: '/nimda/gallery', name: 'Media Gallery', icon: ImageIcon, desc: 'Site Photos & Layout Image Assets' },
  { id: '/nimda/settings', name: 'Settings & Office', icon: Settings, desc: 'Office Address, Hours & Brand Contact' },
  { id: '/nimda/staff', name: 'Staff & Permissions', icon: ShieldCheck, desc: 'Manage User Accounts & Access Rights' },
];

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('9842401991');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales Executive');
  const [status, setStatus] = useState('Active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    '/nimda/dashboard',
    '/nimda/leads',
    '/nimda/site-visits'
  ]);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await api.getStaffList();
      if (res?.data) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setEditingStaff(null);
    setUsername('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('');
    setStatus('Active');
    setShowModalPassword(true);
    setSelectedPermissions([
      '/nimda/dashboard',
      '/nimda/leads',
      '/nimda/site-visits',
      '/nimda/plots'
    ]);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setUsername(staff.username || '');
    setEmail(staff.email || '');
    setPhone(staff.phone ? staff.phone.replace(/\D/g, '').slice(0, 10) : '9842401991');
    setPassword(staff.password_plain || 'AdminPassword@2026');
    setRole(staff.role || 'Sales Executive');
    setStatus(staff.status || 'Active');
    setShowModalPassword(true);

    let perms = staff.permissions;
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch { perms = ['ALL']; }
    }
    if (Array.isArray(perms) && perms.includes('ALL')) {
      setSelectedPermissions(CRM_MODULES_LIST.map(m => m.id));
    } else {
      setSelectedPermissions(Array.isArray(perms) ? perms.map((p: string) => p.replace(/^\/admin/, '/nimda')) : []);
    }
    setFormError('');
    setShowModal(true);
  };

  const togglePermission = (moduleId: string) => {
    if (selectedPermissions.includes(moduleId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== moduleId));
    } else {
      setSelectedPermissions([...selectedPermissions, moduleId]);
    }
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(CRM_MODULES_LIST.map(m => m.id));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !email.trim()) {
      setFormError('Staff Name and Gmail / Email address are required.');
      return;
    }

    if (!password.trim()) {
      setFormError('Password is required for staff account.');
      return;
    }

    if (selectedPermissions.length === 0) {
      setFormError('Please tick at least one CRM module permission.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        role: role.trim(),
        status,
        permissions: selectedPermissions.length === CRM_MODULES_LIST.length ? ['ALL'] : selectedPermissions
      };

      if (editingStaff) {
        const res = await api.updateStaff(editingStaff.id, payload);
        if (!res.success) throw new Error(res.message || 'Failed to update staff user');
      } else {
        const res = await api.createStaff(payload);
        if (!res.success) throw new Error(res.message || 'Failed to create staff user');
      }

      setShowModal(false);
      await loadStaff();
    } catch (err: any) {
      setFormError(err.message || 'Error saving staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete staff account for "${staffName}"?`)) return;
    try {
      const res = await api.deleteStaff(id);
      if (!res.success) {
        alert(res.message || 'Failed to delete staff member');
        return;
      }
      loadStaff();
    } catch (err: any) {
      alert(err.message || 'Error deleting staff account');
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm)) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs dark:shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Staff & Access Permissions Manager</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Create staff credentials (Gmail, Phone & Password) and customize module visibility per role.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Account</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Staff Members</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{staffList.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Credentials</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {staffList.filter(s => s.status !== 'Disabled').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Super Admins</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {staffList.filter(s => s.role === 'super_admin' || s.permissions?.includes('ALL')).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-xs">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search staff by name, Gmail email, phone number, or role..."
          className="bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Staff Table (Cleaned 5 Columns: Name & Email, Phone Number, Role, Status, Actions) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs dark:shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">Loading staff members...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">No staff members found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5 min-w-[220px]">Staff Member & Email</th>
                  <th className="py-3.5 px-5 min-w-[150px]">Phone Number</th>
                  <th className="py-3.5 px-5 min-w-[180px]">Assigned Role</th>
                  <th className="py-3.5 px-5 min-w-[120px]">Status</th>
                  <th className="py-3.5 px-5 min-w-[130px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredStaff.map((staff) => {
                  return (
                    <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Gmail */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm shrink-0">
                            {staff.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{staff.username}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono flex items-center gap-1.5 mt-0.5 truncate">
                              <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="truncate">{staff.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono text-xs">
                          <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{staff.phone || '+91 98424 01991'}</span>
                        </div>
                      </td>

                      {/* Role (Clean single-line badge alignment) */}
                      <td className="py-4 px-5">
                        <span className="whitespace-nowrap inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                          {staff.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {staff.status === 'Disabled' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Disabled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons (Clean Right Alignment) */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(staff)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Edit</span>
                          </button>
                          {staff.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDelete(staff.id, staff.username)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal (Clean Header with Close 'X' Button + Phone Field) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">

            {/* Prominent Fixed Header with Close 'X' Button */}
            <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                    {editingStaff ? `Edit Staff Member: ${editingStaff.username}` : 'Add New Staff Member'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Set Gmail login credentials, phone number, password with Eye icon, and tick CRM module access rights.
                  </p>
                </div>
              </div>

              {/* Functional Close X Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Close Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staff Full Name */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                    Staff Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gmail / Email Address */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                    Gmail / Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh.sreehari@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                    Phone Number (10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Login Password Input with Eye Icon Toggle */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                    Login Password * (Click Eye to View)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showModalPassword ? "text" : "password"}
                      required
                      placeholder="Enter or update password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 dark:text-white font-mono text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
                      title={showModalPassword ? "Hide Password" : "Show Password"}
                    >
                      {showModalPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role / Designation */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                    Staff Designation / Role Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Executive, Telecaller, Site Manager"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Account Login Status
                </label>
                <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={status === 'Active'}
                      onChange={() => setStatus('Active')}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <span>Active (Staff can log in)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="radio"
                      name="status"
                      value="Disabled"
                      checked={status === 'Disabled'}
                      onChange={() => setStatus('Disabled')}
                      className="accent-rose-600 w-4 h-4"
                    />
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">Disabled (Block login access)</span>
                  </label>
                </div>
              </div>

              {/* MODULE ACCESS PERMISSIONS (2-Column Grid) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300">
                    MODULE ACCESS PERMISSIONS ({selectedPermissions.length} / {CRM_MODULES_LIST.length} Ticked)
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-amber-600 dark:text-amber-400 hover:underline transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-64 overflow-y-auto">
                  {CRM_MODULES_LIST.map((module) => {
                    const isChecked = selectedPermissions.includes(module.id);
                    const Icon = module.icon;
                    return (
                      <div
                        key={module.id}
                        onClick={() => togglePermission(module.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-transparent'
                        }`}>
                          ✓
                        </div>

                        <Icon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />

                        <div className="truncate">
                          <p className={`font-semibold text-xs ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {module.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{module.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
