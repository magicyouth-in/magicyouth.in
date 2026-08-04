import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Users, Calendar, FileText, HeartHandshake, MessageSquare, Bell,
  CheckCircle2, XCircle, Search, Filter, RefreshCw, LogOut, Sparkles,
  ChevronRight, Trash2, Edit3, Plus, Image as ImageIcon, Eye, FileUp,
  Settings as SettingsIcon, MessageCircle, ExternalLink, Activity, Info, UploadCloud
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, join_requests, contact_messages, events, gallery, documents, testimonials, settings

  // Database collections lists
  const [joinRequests, setJoinRequests] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Create States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', venue: '', category: 'Cultural', status: 'upcoming', academicYear: '2025-2026' });
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ eventName: '', caption: '', academicYear: '2025-2026' });
  const [documentForm, setDocumentForm] = useState({ title: '', category: 'Report', visibility: 'Public' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', quote: '', isFeatured: false });
  const [settingsForm, setSettingsForm] = useState({ currentPassword: '', newPassword: '', siteTitle: 'MAGIC Youth Platform' });

  // Files
  const [eventPoster, setEventPoster] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  // Success / Error messages in forms
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // 1. Auth check
  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        if (!data.loggedIn) {
          navigate('/admin/login');
        } else {
          setAdmin(data.admin);
          fetchDashboardData();
        }
      })
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  // Real-time notifications via Socket.IO
  useEffect(() => {
    const socket = io();
    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    socket.on('new_join_request', (app) => {
      setJoinRequests(prev => [app, ...prev]);
    });
    socket.on('new_contact_message', (msg) => {
      setContactMessages(prev => [msg, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/join').then(res => res.json()),
      fetch('/api/contact').then(res => res.json()),
      fetch('/api/events').then(res => res.json()),
      fetch('/api/gallery').then(res => res.json()),
      fetch('/api/documents').then(res => res.json()),
      fetch('/api/testimonials').then(res => res.json()),
      fetch('/api/notifications').then(res => res.json())
    ]).then(([statsRes, joinRes, contactRes, eventsRes, galleryRes, docsRes, testimonialsRes, notifRes]) => {
      if (statsRes.success) setStats(statsRes.data);
      if (joinRes.success) setJoinRequests(joinRes.data);
      if (contactRes.success) setContactMessages(contactRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (galleryRes.success) setGallery(galleryRes.data);
      if (docsRes.success) setDocuments(docsRes.data);
      if (testimonialsRes.success) setTestimonials(testimonialsRes.data);
      if (notifRes.success) {
        setNotifications(notifRes.data);
        setUnreadCount(notifRes.data.filter(n => !n.isRead).length);
      }
    }).finally(() => setLoading(false));
  };

  // Actions
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    navigate('/admin/login');
  };

  const handleUpdateJoinStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/join/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setJoinRequests(prev => prev.map(item => item._id === id ? { ...item, status } : item));
        setSelectedRequest(null);
      }
    } catch {}
  };

  const handleDeleteJoin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this volunteer application?')) return;
    try {
      // Keep in local list minus deleted
      setJoinRequests(prev => prev.filter(item => item._id !== id));
    } catch {}
  };

  const handleUpdateContactStatus = async (id, status, reply = '') => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminReply: reply })
      });
      const data = await res.json();
      if (data.success) {
        setContactMessages(prev => prev.map(item => item._id === id ? { ...item, status, adminReply: reply } : item));
        setSelectedMessage(null);
        setReplyText('');
      }
    } catch {}
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      setContactMessages(prev => prev.filter(item => item._id !== id));
    } catch {}
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const formData = new FormData();
      Object.keys(eventForm).forEach(k => formData.append(k, eventForm[k]));
      if (eventPoster) formData.append('posterImage', eventPoster);

      const url = editingEventId ? `/api/events/${editingEventId}` : '/api/events';
      const method = editingEventId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(editingEventId ? 'Event updated successfully!' : 'Event created successfully!');
        setEventForm({ title: '', description: '', date: '', venue: '', category: 'Cultural', status: 'upcoming', academicYear: '2025-2026' });
        setEventPoster(null);
        setEditingEventId(null);
        fetchDashboardData();
      } else {
        setFormError(data.message || 'Error saving event.');
      }
    } catch (err) {
      setFormError('Network error saving event.');
    }
  };

  const handleEditEvent = (evt) => {
    setEditingEventId(evt._id);
    setEventForm({
      title: evt.title || '',
      description: evt.description || '',
      date: evt.date ? evt.date.split('T')[0] : '',
      venue: evt.venue || '',
      category: evt.category || 'Cultural',
      status: evt.status || 'upcoming',
      academicYear: evt.academicYear || '2025-2026'
    });
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchDashboardData();
    } catch {}
  };

  const handleViewRegistrations = async (evt) => {
    setViewingRegistrationsEvent(evt);
    try {
      const res = await fetch(`/api/events/${evt._id}/registrations`);
      const data = await res.json();
      if (data.success) setEventRegistrations(data.data || []);
    } catch {}
  };

  const handleUploadGallery = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!galleryFile) {
      setFormError('Please select an image file to upload.');
      return;
    }
    try {
      const fData = new FormData();
      fData.append('eventName', galleryForm.eventName);
      fData.append('caption', galleryForm.caption);
      fData.append('academicYear', galleryForm.academicYear);
      fData.append('photo', galleryFile);

      const res = await fetch('/api/gallery', { method: 'POST', body: fData });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Gallery image uploaded!');
        setGalleryForm({ eventName: '', caption: '', academicYear: '2025-2026' });
        setGalleryFile(null);
        fetchDashboardData();
      } else {
        setFormError(data.message || 'Error uploading image.');
      }
    } catch {
      setFormError('Network error uploading image.');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchDashboardData();
    } catch {}
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!docFile) {
      setFormError('Please select a document file.');
      return;
    }
    try {
      const fData = new FormData();
      fData.append('title', documentForm.title);
      fData.append('category', documentForm.category);
      fData.append('visibility', documentForm.visibility);
      fData.append('document', docFile);

      const res = await fetch('/api/documents', { method: 'POST', body: fData });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Document uploaded!');
        setDocumentForm({ title: '', category: 'Report', visibility: 'Public' });
        setDocFile(null);
        fetchDashboardData();
      } else {
        setFormError(data.message || 'Error uploading document.');
      }
    } catch {
      setFormError('Network error uploading document.');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchDashboardData();
    } catch {}
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm)
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Testimonial added successfully!');
        setTestimonialForm({ name: '', role: '', quote: '', isFeatured: false });
        fetchDashboardData();
      } else {
        setFormError(data.message);
      }
    } catch {
      setFormError('Network error saving testimonial.');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch {}
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Admin password updated successfully!');
        setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      } else {
        setFormError(data.message || 'Failed to update password.');
      }
    } catch {
      setFormError('Network error updating password.');
    }
  };

  // CSV Export for Volunteer applications
  const exportToCSV = () => {
    const headers = ['Name,Email,Phone,Gender,College,Department,Year,City,Status\n'];
    const rows = joinRequests.map(r => 
      `"${r.name}","${r.email}","${r.phone}","${r.gender}","${r.college}","${r.department}","${r.year}","${r.city}","${r.status}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `volunteers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter application files helper
  const getFilteredRequests = () => {
    return joinRequests.filter(r => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.college.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  };

  return (
    <div className="min-h-screen bg-[#070114] text-slate-100 flex flex-col md:flex-row">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-full md:w-64 bg-[#0a021b]/95 border-b md:border-b-0 md:border-r border-purple-500/20 p-6 flex flex-col justify-between flex-shrink-0 relative z-30">
        <div className="space-y-8">
          {/* Admin title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/30 flex items-center justify-center text-white shadow-purple-glow">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wider uppercase text-white">MAGIC YOUTH</h2>
              <p className="text-[10px] text-purple-400 font-semibold tracking-widest uppercase">Admin Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'join_requests', label: 'Join Requests', icon: HeartHandshake },
              { id: 'contact_messages', label: 'Contact Messages', icon: MessageSquare },
              { id: 'events', label: 'Events Manager', icon: Calendar },
              { id: 'gallery', label: 'Gallery Manager', icon: ImageIcon },
              { id: 'documents', label: 'Document Center', icon: FileText },
              { id: 'testimonials', label: 'Testimonials', icon: MessageCircle },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setFormSuccess(''); setFormError(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-purple-glow border border-purple-400/30'
                      : 'text-slate-400 hover:text-purple-200 hover:bg-purple-950/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout action */}
        <div className="mt-8 pt-4 border-t border-purple-900/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-full relative z-10">
        {/* Header toolbar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-900/30">
          <div>
            <h1 className="text-2xl font-extrabold text-white capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-xs text-purple-300/50 mt-1">Logged in as {admin?.email || 'Administrator'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 text-purple-300 transition"
              title="Sync Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl border border-purple-500/20 bg-purple-950/20 hover:bg-purple-900/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-purple-300/50">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-purple-500" />
            <p className="text-xs">Fetching latest data from MongoDB...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* MODULE 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Pending Volunteers', val: joinRequests.filter(r => r.status === 'Pending').length, icon: HeartHandshake, color: 'text-amber-400' },
                    { label: 'Unread Inquiries', val: contactMessages.filter(c => c.status === 'New').length, icon: MessageSquare, color: 'text-blue-400' },
                    { label: 'Total Events', val: events.length, icon: Calendar, color: 'text-purple-400' },
                    { label: 'Public Documents', val: documents.length, icon: FileText, color: 'text-emerald-400' }
                  ].map((stat, i) => (
                    <div key={i} className="dark-glass-card p-5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-semibold text-purple-300/60 uppercase tracking-wider">{stat.label}</span>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className="text-3xl font-extrabold text-white">{stat.val}</div>
                    </div>
                  ))}
                </div>

                {/* Main panel layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Recent join requests */}
                  <div className="lg:col-span-6 dark-glass-card p-6">
                    <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-purple-400" /> Recent Applications
                    </h3>
                    <div className="space-y-3">
                      {joinRequests.slice(0, 4).map(req => (
                        <div key={req._id} className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/10 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white">{req.name}</p>
                            <p className="text-[10px] text-purple-300/50 mt-0.5">{req.college}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            req.status === 'Approved' ? 'bg-emerald-950 text-emerald-300' :
                            req.status === 'Rejected' ? 'bg-red-950 text-red-300' :
                            'bg-amber-950 text-amber-300'
                          }`}>{req.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent messages */}
                  <div className="lg:col-span-6 dark-glass-card p-6">
                    <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" /> Recent Messages
                    </h3>
                    <div className="space-y-3">
                      {contactMessages.slice(0, 4).map(msg => (
                        <div key={msg._id} className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/10 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white">{msg.name}</p>
                            <p className="text-[10px] text-purple-300/50 mt-0.5 truncate max-w-xs">{msg.query}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            msg.status === 'Read' ? 'bg-slate-900 text-slate-400' : 'bg-blue-950 text-blue-300'
                          }`}>{msg.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System health and info */}
                  <div className="lg:col-span-12 dark-glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex gap-4 items-start">
                      <div className="p-3 rounded-2xl bg-purple-900/30 text-purple-400 border border-purple-500/25">
                        <Info className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">System Diagnostics</h4>
                        <p className="text-xs text-purple-300/55 mt-0.5 leading-relaxed">
                          Connected to cluster: <strong>magicyouth-atlas</strong>. File uploads directed to <code>/uploads/</code> local storage. Real-time updates active via Socket.IO.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-purple-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> MDB Atlas Live</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: JOIN REQUESTS */}
            {activeTab === 'join_requests' && (
              <div className="space-y-6">
                <div className="dark-glass-card p-5 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search applicant name or college..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/20 text-white text-xs outline-none"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-650 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                  >
                    Export CSV
                  </button>
                </div>

                <div className="dark-glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs text-purple-100/80">
                      <thead>
                        <tr className="bg-slate-950/90 border-b border-purple-900/30 text-purple-300 text-[10px] uppercase font-bold">
                          <th className="p-4">Applicant</th>
                          <th className="p-4">College</th>
                          <th className="p-4">Skills</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-900/20">
                        {getFilteredRequests().map(req => (
                          <tr key={req._id} className="hover:bg-purple-950/10 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white">{req.name}</div>
                              <div className="text-[10px] text-purple-300/50 mt-0.5">{req.email} · {req.phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-white/80">{req.college}</div>
                              <div className="text-[10px] text-purple-300/40 mt-0.5">{req.department} · {req.year}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {req.skills.map(s => <span key={s} className="bg-purple-950/60 border border-purple-500/20 px-2 py-0.5 rounded text-[9px] text-purple-300 font-semibold">{s}</span>)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                req.status === 'Approved' ? 'badge-ongoing' :
                                req.status === 'Rejected' ? 'bg-red-950 text-red-300 border border-red-500/25' :
                                'badge-upcoming'
                              }`}>{req.status}</span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="p-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/20 transition"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJoin(req._id)}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/20 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: CONTACT MESSAGES */}
            {activeTab === 'contact_messages' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 dark-glass-card p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                    <h3 className="font-bold text-xs text-purple-300 uppercase tracking-widest pb-2 border-b border-purple-900/30">Inbox</h3>
                    {contactMessages.map(msg => (
                      <div
                        key={msg._id}
                        onClick={() => { setSelectedMessage(msg); setReplyText(msg.adminReply || ''); }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedMessage?._id === msg._id
                            ? 'bg-purple-900/30 border-purple-500/50'
                            : 'bg-slate-950/60 border-purple-500/10 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold text-xs text-white truncate max-w-[120px]">{msg.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            msg.status === 'New' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' : 'bg-slate-900 text-slate-400'
                          }`}>{msg.status}</span>
                        </div>
                        <p className="text-[10px] text-purple-300/70 truncate">{msg.subject}</p>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-2">
                    {selectedMessage ? (
                      <div className="dark-glass-card p-6 space-y-6">
                        <div className="flex justify-between items-start border-b border-purple-900/30 pb-4">
                          <div>
                            <h3 className="font-bold text-base text-white">{selectedMessage.name}</h3>
                            <p className="text-xs text-purple-300/50 mt-0.5">{selectedMessage.email} · {selectedMessage.phone || 'No phone'}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteContact(selectedMessage._id)}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/25 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5">Subject</p>
                          <p className="text-xs font-bold text-white">{selectedMessage.subject}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/15">
                          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5">Message Inquiry</p>
                          <p className="text-xs text-purple-200/85 leading-relaxed italic">"{selectedMessage.query}"</p>
                        </div>

                        {selectedMessage.adminReply && (
                          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/15">
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5">Saved Reply / Action Notes</p>
                            <p className="text-xs text-purple-200/70 leading-relaxed font-semibold">{selectedMessage.adminReply}</p>
                          </div>
                        )}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateContactStatus(selectedMessage._id, 'Replied', replyText);
                          }}
                          className="space-y-4 pt-4 border-t border-purple-900/30"
                        >
                          <label className="block text-[11px] font-semibold text-purple-300">Reply Note / Change Status</label>
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows="3"
                            placeholder="Add reply history or response notes..."
                            className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="btn-purple-glow px-6 py-2 rounded-full text-xs font-bold">
                              Save Reply / Mark Replied
                            </button>
                            {selectedMessage.status === 'New' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateContactStatus(selectedMessage._id, 'Read')}
                                className="btn-ghost px-5 py-2 rounded-full text-xs font-bold"
                              >
                                Mark Read Only
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="dark-glass-card p-12 text-center text-purple-300/30 text-xs">
                        Select an inquiry from the inbox list to view details or record responses.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: EVENTS MANAGER */}
            {activeTab === 'events' && (
              <div className="space-y-8">
                {/* Event Creation Form */}
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white border-b border-purple-900/30 pb-3 mb-5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>{editingEventId ? 'Edit Event Details' : 'Publish / Create New Activity'}</span>
                  </h3>

                  {formSuccess && <p className="mb-4 text-xs text-emerald-400 font-semibold">✓ {formSuccess}</p>}
                  {formError && <p className="mb-4 text-xs text-red-400 font-semibold">⚠ {formError}</p>}

                  <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Event Title *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.title}
                          onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="State level Chess Championship..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Venue / Location *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.venue}
                          onChange={e => setEventForm(f => ({ ...f, venue: e.target.value }))}
                          placeholder="ALIET Seminar Hall..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Date *</label>
                        <input
                          type="date"
                          required
                          value={eventForm.date}
                          onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Category</label>
                        <select
                          value={eventForm.category}
                          onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        >
                          <option value="Cultural">Cultural</option>
                          <option value="Sports & Chess">Sports & Chess</option>
                          <option value="Technical">Technical</option>
                          <option value="Social Outreach">Social Outreach</option>
                          <option value="Leadership">Leadership</option>
                          <option value="Programs">Programs (Flagships)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Status</label>
                        <select
                          value={eventForm.status}
                          onChange={e => setEventForm(f => ({ ...f, status: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Academic Year</label>
                        <select
                          value={eventForm.academicYear}
                          onChange={e => setEventForm(f => ({ ...f, academicYear: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        >
                          <option value="2025-2026">2025-2026</option>
                          <option value="2024-2025">2024-2025</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-purple-300 mb-1">Description *</label>
                      <textarea
                        required
                        value={eventForm.description}
                        onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                        rows="3"
                        placeholder="Write detailed event highlights, guidelines, participants details..."
                        className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        <label className="cursor-pointer bg-purple-950 hover:bg-purple-900 border border-purple-500/20 px-4 py-2 rounded-xl text-xs font-bold text-purple-300 transition">
                          Upload Poster Image
                          <input type="file" accept="image/*" onChange={e => setEventPoster(e.target.files[0])} className="hidden" />
                        </label>
                        {eventPoster && <span className="text-[10px] text-purple-200">✓ {eventPoster.name}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-purple-glow px-6 py-2 rounded-full text-xs font-bold">
                          {editingEventId ? '✓ Save Changes' : '✨ Publish Activity'}
                        </button>
                        {editingEventId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEventId(null);
                              setEventForm({ title: '', description: '', date: '', venue: '', category: 'Cultural', status: 'upcoming', academicYear: '2025-2026' });
                            }}
                            className="btn-ghost px-5 py-2 rounded-full text-xs font-bold"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Events list */}
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white mb-4">Published Activities</h3>
                  <div className="space-y-4">
                    {events.map(evt => (
                      <div key={evt._id} className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                            <span className="text-[9px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{evt.status}</span>
                          </div>
                          <p className="text-[10px] text-purple-300/50 mt-1">📅 {evt.date?.split('T')[0]} · 📍 {evt.venue} · 🏷️ {evt.category}</p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleViewRegistrations(evt)}
                            className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500/20 text-[10px] font-bold text-purple-300 hover:bg-purple-900 transition flex items-center gap-1"
                          >
                            <Users className="w-3.5 h-3.5" /> Registrations
                          </button>
                          <button
                            onClick={() => handleEditEvent(evt)}
                            className="p-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/20 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt._id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 5: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white border-b border-purple-900/30 pb-3 mb-5 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>Upload Gallery Photos (Bulk & Album wise)</span>
                  </h3>
                  {formSuccess && <p className="mb-4 text-xs text-emerald-400 font-semibold">✓ {formSuccess}</p>}
                  {formError && <p className="mb-4 text-xs text-red-400 font-semibold">⚠ {formError}</p>}

                  <form onSubmit={handleUploadGallery} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Album / Event Name *</label>
                        <input
                          type="text"
                          required
                          value={galleryForm.eventName}
                          onChange={e => setGalleryForm(f => ({ ...f, eventName: e.target.value }))}
                          placeholder="e.g. Chess Tournament 2025"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Academic Year</label>
                        <select
                          value={galleryForm.academicYear}
                          onChange={e => setGalleryForm(f => ({ ...f, academicYear: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        >
                          <option value="2025-2026">2025-2026</option>
                          <option value="2024-2025">2024-2025</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Select Photo File *</label>
                        <label className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 cursor-pointer text-xs font-semibold text-purple-300 hover:border-purple-400 transition">
                          <UploadCloud className="w-4 h-4" />
                          <span>{galleryFile ? galleryFile.name : 'Choose Image'}</span>
                          <input type="file" accept="image/*" onChange={e => setGalleryFile(e.target.files[0])} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-purple-300 mb-1">Image Caption</label>
                      <input
                        type="text"
                        value={galleryForm.caption}
                        onChange={e => setGalleryForm(f => ({ ...f, caption: e.target.value }))}
                        placeholder="e.g. Final round highlight match..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                      />
                    </div>
                    <button type="submit" className="btn-purple-glow px-6 py-2 rounded-full text-xs font-bold">
                      Upload Image to Gallery
                    </button>
                  </form>
                </div>

                {/* Images grid */}
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white mb-4">Gallery Images ({gallery.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {gallery.map(img => (
                      <div key={img._id} className="relative aspect-square rounded-xl overflow-hidden border border-purple-500/10 group">
                        <img src={`/uploads/gallery/${img.filename}`} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2.5 transition-opacity duration-300 text-left">
                          <span className="text-[9px] font-bold text-purple-300 truncate">{img.eventName}</span>
                          <button
                            onClick={() => handleDeleteGallery(img._id)}
                            className="p-1 rounded bg-red-950/80 text-red-400 hover:bg-red-900 border border-red-500/30 transition self-end"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white border-b border-purple-900/30 pb-3 mb-5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Upload Reports / Document visibility</span>
                  </h3>
                  {formSuccess && <p className="mb-4 text-xs text-emerald-400 font-semibold">✓ {formSuccess}</p>}
                  {formError && <p className="mb-4 text-xs text-red-400 font-semibold">⚠ {formError}</p>}

                  <form onSubmit={handleUploadDocument} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Document Title *</label>
                        <input
                          type="text"
                          required
                          value={documentForm.title}
                          onChange={e => setDocumentForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. Annual Audit Report 2025"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Category</label>
                        <select
                          value={documentForm.category}
                          onChange={e => setDocumentForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        >
                          <option value="Report">Audit Report</option>
                          <option value="Newsletter">Newsletter</option>
                          <option value="Syllabus">Guidelines / Handbooks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Select File *</label>
                        <label className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 cursor-pointer text-xs font-semibold text-purple-300 hover:border-purple-400 transition">
                          <UploadCloud className="w-4 h-4" />
                          <span>{docFile ? docFile.name : 'Choose File (PDF/Docs)'}</span>
                          <input type="file" onChange={e => setDocFile(e.target.files[0])} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="btn-purple-glow px-6 py-2 rounded-full text-xs font-bold">
                      Upload Document
                    </button>
                  </form>
                </div>

                {/* Documents list */}
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white mb-4">Uploaded Documents ({documents.length})</h3>
                  <div className="space-y-4">
                    {documents.map(doc => (
                      <div key={doc._id} className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/10 flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold text-white">{doc.title}</h4>
                          <p className="text-[10px] text-purple-300/50 mt-1">📁 {doc.category} · 👁️ {doc.visibility} · Download count: {doc.downloadsCount || 0}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 7: TESTIMONIALS */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white border-b border-purple-900/30 pb-3 mb-5">Add Quote/Testimonial</h3>
                  {formSuccess && <p className="mb-4 text-xs text-emerald-400 font-semibold">✓ {formSuccess}</p>}
                  {formError && <p className="mb-4 text-xs text-red-400 font-semibold">⚠ {formError}</p>}

                  <form onSubmit={handleSaveTestimonial} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Author Name *</label>
                        <input
                          type="text"
                          required
                          value={testimonialForm.name}
                          onChange={e => setTestimonialForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Dr. K Srinivas"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-300 mb-1">Role / Position *</label>
                        <input
                          type="text"
                          required
                          value={testimonialForm.role}
                          onChange={e => setTestimonialForm(f => ({ ...f, role: e.target.value }))}
                          placeholder="e.g. Student Volunteer Coordinator"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-purple-300 mb-1">Testimonial Quote *</label>
                      <textarea
                        required
                        value={testimonialForm.quote}
                        onChange={e => setTestimonialForm(f => ({ ...f, quote: e.target.value }))}
                        rows="3"
                        placeholder="Write quote text..."
                        className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none resize-none"
                      />
                    </div>
                    <button type="submit" className="btn-purple-glow px-6 py-2 rounded-full text-xs font-bold">
                      Add Testimonial Quote
                    </button>
                  </form>
                </div>

                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white mb-4">Testimonials List</h3>
                  <div className="space-y-4">
                    {testimonials.map(item => (
                      <div key={item._id} className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/10 flex justify-between items-center text-xs">
                        <div className="max-w-xl">
                          <p className="italic text-purple-200/80">"{item.quote}"</p>
                          <p className="font-bold text-white mt-1">
                            — {item.name} <span className="text-[10px] text-purple-400 font-semibold">({item.role})</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTestimonial(item._id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="dark-glass-card p-6">
                  <h3 className="font-bold text-sm text-white border-b border-purple-900/30 pb-3 mb-5 flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-purple-400" />
                    <span>Change Portal Administrator Password</span>
                  </h3>
                  {formSuccess && <p className="mb-4 text-xs text-emerald-400 font-semibold">✓ {formSuccess}</p>}
                  {formError && <p className="mb-4 text-xs text-red-400 font-semibold">⚠ {formError}</p>}

                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-[10px] font-semibold text-purple-300 mb-1">Current Password *</label>
                      <input
                        type="password"
                        required
                        value={settingsForm.currentPassword}
                        onChange={e => setSettingsForm(f => ({ ...f, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-purple-300 mb-1">New Password *</label>
                      <input
                        type="password"
                        required
                        value={settingsForm.newPassword}
                        onChange={e => setSettingsForm(f => ({ ...f, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/20 text-white text-xs outline-none"
                      />
                    </div>
                    <button type="submit" className="btn-purple-glow px-6 py-2 rounded-full text-xs font-bold">
                      Update Admin Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── DETAIL MODALS ── */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dark-glass-card max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto relative border-purple-500/30 shadow-2xl text-xs">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 text-purple-400 hover:text-white">✕</button>
            <div className="border-b border-purple-900/30 pb-3 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-950 border border-purple-500/20 flex items-center justify-center font-bold text-white text-base">
                {selectedRequest.profileImage ? (
                  <img src={`/uploads/join/${selectedRequest.profileImage}`} alt="" className="w-full h-full rounded-full object-cover" />
                ) : selectedRequest.name[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{selectedRequest.name}</h3>
                <p className="text-[10px] text-purple-300/60 mt-0.5">{selectedRequest.email} · {selectedRequest.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/60 border border-purple-500/10 rounded-xl space-y-1">
                <p className="font-bold text-[9px] uppercase text-purple-300">College & Location</p>
                <p className="text-white/80">{selectedRequest.college}</p>
                <p className="text-[10px] text-purple-300/50">{selectedRequest.city}</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-purple-500/10 rounded-xl space-y-1">
                <p className="font-bold text-[9px] uppercase text-purple-300">Academic Major</p>
                <p className="text-white/80">{selectedRequest.department} ({selectedRequest.year})</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-purple-500/10 rounded-xl space-y-1">
              <p className="font-bold text-[9px] uppercase text-purple-300">Motivation / Statement</p>
              <p className="leading-relaxed italic text-purple-200/80">"{selectedRequest.reason}"</p>
            </div>

            {selectedRequest.previousExperience && (
              <div className="p-3 bg-slate-950/60 border border-purple-500/10 rounded-xl space-y-1">
                <p className="font-bold text-[9px] uppercase text-purple-300">Volunteering History</p>
                <p className="leading-relaxed">{selectedRequest.previousExperience}</p>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-purple-900/30 pt-4">
              <div className="flex gap-2">
                {selectedRequest.resumeUrl ? (
                  <a
                    href={`/uploads/join/${selectedRequest.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/20 text-purple-300 font-bold rounded-full text-[10px] transition"
                  >
                    View Resume / CV
                  </a>
                ) : (
                  <span className="text-[10px] text-purple-300/40">No resume uploaded</span>
                )}
              </div>
              <div className="flex gap-2">
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateJoinStatus(selectedRequest._id, 'Approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-[10px]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateJoinStatus(selectedRequest._id, 'Rejected')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-[10px]"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION LIST MODAL */}
      {viewingRegistrationsEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dark-glass-card max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto relative border-purple-500/30 shadow-2xl text-xs">
            <button onClick={() => setViewingRegistrationsEvent(null)} className="absolute top-4 right-4 text-purple-400 hover:text-white">✕</button>
            <h3 className="font-extrabold text-sm text-white border-b border-purple-900/30 pb-3">
              Registrations for: {viewingRegistrationsEvent.title}
            </h3>
            {eventRegistrations.length === 0 ? (
              <p className="text-center text-purple-300/30 py-8">No students registered yet.</p>
            ) : (
              <div className="space-y-2">
                {eventRegistrations.map((reg, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/10 flex justify-between items-center text-[11px]">
                    <div>
                      <p className="font-bold text-white">{reg.name}</p>
                      <p className="text-purple-300/60 mt-0.5">{reg.email} · {reg.phone}</p>
                    </div>
                    {reg.rollNo && (
                      <span className="bg-purple-950 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] text-purple-300 font-mono font-bold">
                        {reg.rollNo}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
