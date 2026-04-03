import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Medicine } from '../types';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Package, LayoutDashboard, Plus, List, User, LogOut, Menu, X,
  Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Copy,
  RefreshCw, Loader2, AlertTriangle, Check, X as XIcon
} from 'lucide-react';

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    units: '',
    senderName: '',
    description: ''
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { currentUser, company, logout } = useAuth();
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    if (!currentUser || !company) {
      navigate('/company/login');
      return;
    }

    // Real-time listener for medicines
    const q = query(
      collection(db, 'medicines'),
      where('companyId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicinesData: Medicine[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        medicinesData.push({
          id: doc.id,
          code: data.code,
          name: data.name,
          units: data.units,
          senderName: data.senderName,
          description: data.description,
          companyId: data.companyId,
          companyName: data.companyName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      medicinesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setMedicines(medicinesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching medicines:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, company, navigate]);

  const generateSecretCode = () => {
    const companyPrefix = company?.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'XXXX';
    const year = new Date().getFullYear();
    const chars = '0123456789ABCDEF';
    let random = '';
    for (let i = 0; i < 5; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MED-${companyPrefix}-${year}-${random}`;
  };

  const handleGenerateCode = () => {
    setGeneratedCode(generateSecretCode());
  };

  const resetForm = () => {
    setFormData({ name: '', units: '', senderName: '', description: '' });
    setGeneratedCode('');
    setError('');
    setSuccess('');
  };

  const handleAddMedicine = async (e: FormEvent) => {
    e.preventDefault();
    if (!generatedCode) {
      setError('Please generate a code first');
      return;
    }
    if (!formData.name.trim() || !formData.units || !formData.senderName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'medicines'), {
        code: generatedCode,
        name: formData.name.trim(),
        units: parseInt(formData.units),
        senderName: formData.senderName.trim(),
        description: formData.description.trim(),
        companyId: currentUser?.uid,
        companyName: company?.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSuccess('Medicine added successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError('Failed to add medicine. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMedicine = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'medicines', selectedMedicine.id), {
        name: formData.name.trim(),
        units: parseInt(formData.units),
        senderName: formData.senderName.trim(),
        description: formData.description.trim(),
        updatedAt: serverTimestamp()
      });
      setSuccess('Medicine updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        resetForm();
        setSelectedMedicine(null);
      }, 1500);
    } catch (err) {
      setError('Failed to update medicine. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!selectedMedicine) return;

    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'medicines', selectedMedicine.id));
      setSuccess('Medicine deleted successfully!');
      setTimeout(() => {
        setShowDeleteModal(false);
        setSelectedMedicine(null);
      }, 1000);
    } catch (err) {
      setError('Failed to delete medicine. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      units: medicine.units.toString(),
      senderName: medicine.senderName,
      description: medicine.description
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDeleteModal(true);
  };

  const openViewModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowViewModal(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Filter and pagination
  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const totalMedicines = medicines.length;
  const totalUnits = medicines.reduce((sum, med) => sum + med.units, 0);
  const recentAdditions = medicines.filter(med => {
    const daysSinceAdded = (Date.now() - med.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAdded <= 7;
  }).length;

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'add', icon: Plus, label: 'Add Medicine' },
    { id: 'medicines', icon: List, label: 'My Medicines' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MedTrack</span>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                  if (item.id === 'add') {
                    handleGenerateCode();
                    setShowAddModal(true);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-4">
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'add' && 'Add Medicine'}
              {activeTab === 'medicines' && 'My Medicines'}
              {activeTab === 'profile' && 'Profile'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-slate-400">
                <User className="w-5 h-5" />
                <span className="text-sm">{company?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm">Total Medicines</h3>
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{totalMedicines}</div>
                  <p className="text-slate-500 text-sm mt-2">Products in inventory</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm">Total Units</h3>
                    <List className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{totalUnits.toLocaleString()}</div>
                  <p className="text-slate-500 text-sm mt-2">Units in stock</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm">Recent Additions</h3>
                    <Plus className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{recentAdditions}</div>
                  <p className="text-slate-500 text-sm mt-2">Added this week</p>
                </div>
              </div>

              {/* Recent Medicines */}
              <div className="bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Recent Medicines</h2>
                  <button
                    onClick={() => setActiveTab('medicines')}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    View All →
                  </button>
                </div>
                {medicines.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No medicines added yet</p>
                    <button
                      onClick={() => {
                        handleGenerateCode();
                        setShowAddModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Add Your First Medicine
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                          <th className="p-4">Code</th>
                          <th className="p-4">Medicine</th>
                          <th className="p-4">Units</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.slice(0, 5).map((med) => (
                          <tr key={med.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-4">
                              <span className="font-mono text-sm text-cyan-400">{med.code}</span>
                            </td>
                            <td className="p-4 text-white">{med.name}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-slate-700 rounded text-sm text-white">{med.units}</span>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">
                              {med.createdAt.toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medicines Tab */}
          {activeTab === 'medicines' && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by code, name, or sender..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    handleGenerateCode();
                    setShowAddModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {/* Medicines Table */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading medicines...</p>
                  </div>
                ) : paginatedMedicines.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {searchTerm ? 'No medicines found matching your search' : 'No medicines added yet'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => {
                          handleGenerateCode();
                          setShowAddModal(true);
                        }}
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Add Your First Medicine
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-slate-400 text-sm border-b border-slate-700 bg-slate-800/50">
                            <th className="p-4">Code</th>
                            <th className="p-4">Medicine</th>
                            <th className="p-4">Units</th>
                            <th className="p-4">Sender</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedMedicines.map((med, index) => (
                            <tr
                              key={med.id}
                              className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${
                                index % 2 === 0 ? 'bg-slate-800/30' : ''
                              }`}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm text-cyan-400">{med.code}</span>
                                  <button
                                    onClick={() => handleCopyCode(med.code)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                    title="Copy code"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-white">{med.name}</td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-slate-700 rounded text-sm text-white">{med.units}</span>
                              </td>
                              <td className="p-4 text-slate-400">{med.senderName}</td>
                              <td className="p-4 text-slate-400 text-sm">{med.createdAt.toLocaleDateString()}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openViewModal(med)}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(med)}
                                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(med)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                        <p className="text-slate-400 text-sm">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of{' '}
                          {filteredMedicines.length} results
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-500 text-white'
                                  : 'text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{company?.name}</h2>
                    <p className="text-slate-400">{company?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <label className="text-sm text-slate-400">Company Name</label>
                    <p className="text-white">{company?.name}</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <label className="text-sm text-slate-400">Email</label>
                    <p className="text-white">{company?.email}</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <label className="text-sm text-slate-400">Member Since</label>
                    <p className="text-white">{company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add Medicine</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMedicine} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  {success}
                </div>
              )}

              {/* Generated Code */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Secret Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedCode}
                    readOnly
                    placeholder="Click generate to create code"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    title="Generate new code"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Medicine Name */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Medicine Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter medicine name"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Units */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Units/Quantity *</label>
                <input
                  type="number"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  placeholder="Enter quantity"
                  min="1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sender Name */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Sender Name *</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="Enter sender name"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Medicine'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Medicine</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedMedicine(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditMedicine} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  {success}
                </div>
              )}

              {/* Code (readonly) */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Secret Code</label>
                <input
                  type="text"
                  value={selectedMedicine.code}
                  readOnly
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-cyan-400 font-mono"
                />
              </div>

              {/* Medicine Name */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Medicine Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Units */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Units/Quantity *</label>
                <input
                  type="number"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  min="1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sender Name */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Sender Name *</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Medicine'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Medicine Modal */}
      {showViewModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Medicine Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-700">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <span className="font-mono text-lg text-cyan-400">{selectedMedicine.code}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="text-xs text-slate-400">Medicine Name</label>
                  <p className="text-white font-medium">{selectedMedicine.name}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="text-xs text-slate-400">Units</label>
                  <p className="text-white font-medium">{selectedMedicine.units}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="text-xs text-slate-400">Sender</label>
                  <p className="text-white font-medium">{selectedMedicine.senderName}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="text-xs text-slate-400">Created</label>
                  <p className="text-white font-medium">{selectedMedicine.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
              {selectedMedicine.description && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="text-xs text-slate-400">Description</label>
                  <p className="text-white">{selectedMedicine.description}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleCopyCode(selectedMedicine.code)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedMedicine);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Medicine?</h2>
              <p className="text-slate-400 mb-2">
                Are you sure you want to delete <strong className="text-white">{selectedMedicine.name}</strong>?
              </p>
              <p className="text-slate-500 text-sm">Code: {selectedMedicine.code}</p>
              <p className="text-red-400 text-sm mt-2">This action cannot be undone.</p>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMedicine(null);
                }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMedicine}
                disabled={submitting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copied Toast */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn z-50">
          <Check className="w-5 h-5" />
          Code copied to clipboard!
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function Building2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
