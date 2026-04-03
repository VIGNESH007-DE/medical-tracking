import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Medicine, SearchHistoryItem } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Package, Search, LogOut, Printer, Copy, Clock, X,
  Loader2, AlertCircle, Check, User, FileText,
  ChevronRight, Trash2
} from 'lucide-react';

export default function UserSearch() {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);

  const { isUserLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Redirect if not logged in
    if (!isUserLoggedIn()) {
      navigate('/user/login');
    }
  }, [isUserLoggedIn, navigate]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setError('Please enter a code to search');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError('');
    setMedicine(null);

    try {
      const q = query(
        collection(db, 'medicines'),
        where('code', '==', searchCode.trim().toUpperCase())
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('No medicine found with this code. Please check and try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const medicineData: Medicine = {
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
        };
        setMedicine(medicineData);
        
        // Save to search history
        addToHistory(medicineData);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (med: Medicine) => {
    const newItem: SearchHistoryItem = {
      code: med.code,
      medicineName: med.name,
      companyName: med.companyName,
      searchedAt: new Date().toISOString()
    };

    const updatedHistory = [newItem, ...searchHistory.filter(h => h.code !== med.code)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const handleHistoryClick = (code: string) => {
    setSearchCode(code);
    // Trigger search with the history code
    const fakeEvent = { preventDefault: () => {} } as FormEvent;
    setSearchCode(code);
    setTimeout(() => {
      handleSearch(fakeEvent);
    }, 100);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userLoggedIn');
    navigate('/');
  };

  const clearSearch = () => {
    setSearchCode('');
    setMedicine(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .result-card { 
            box-shadow: none !important; 
            border: 1px solid #ddd !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 no-print">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">MedTrack</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="text-center mb-8 no-print">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Search Medicine
          </h1>
          <p className="text-slate-400 mb-8">
            Enter the secret code to verify and track medicine details
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className={`relative ${shake ? 'animate-shake' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30" />
              <div className="relative flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => {
                      setSearchCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter code (e.g., MED-ACME-2024-12A4F)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg"
                  />
                  {searchCode && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 no-print">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        {medicine && (
          <div className="max-w-2xl mx-auto mb-8 result-card animate-slideDown">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 border-b border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{medicine.name}</h2>
                      <span className="font-mono text-emerald-400">{medicine.code}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 no-print">
                    <button
                      onClick={() => handleCopyCode(medicine.code)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Print"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl">
                    <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <label className="text-xs text-slate-400">Company</label>
                      <p className="text-white font-medium">{medicine.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl">
                    <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <label className="text-xs text-slate-400">Units/Quantity</label>
                      <p className="text-white font-medium">
                        <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">
                          {medicine.units} units
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl">
                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <label className="text-xs text-slate-400">Sender</label>
                      <p className="text-white font-medium">{medicine.senderName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <label className="text-xs text-slate-400">Dispatch Date</label>
                      <p className="text-white font-medium">{medicine.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>

                {medicine.description && (
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <label className="text-xs text-slate-400">Description</label>
                        <p className="text-white">{medicine.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Badge */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                  <Check className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-medium">Verified Medicine</p>
                    <p className="text-slate-400 text-sm">This medicine is registered and verified by {medicine.companyName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && !medicine && (
          <section className="max-w-2xl mx-auto no-print">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Recent Searches
              </h3>
              <button
                onClick={clearHistory}
                className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {searchHistory.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(item.code)}
                  className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono text-cyan-400">{item.code}</span>
                    <div className="text-sm text-slate-400 mt-1">
                      {item.medicineName} • {item.companyName}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!medicine && !loading && !error && (
          <section className="max-w-md mx-auto text-center py-12 no-print">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Search for Medicine</h3>
            <p className="text-slate-400">
              Enter a medicine code to verify its authenticity and view complete details
            </p>
          </section>
        )}
      </main>

      {/* Copied Toast */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn z-50 no-print">
          <Check className="w-5 h-5" />
          Code copied to clipboard!
        </div>
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
