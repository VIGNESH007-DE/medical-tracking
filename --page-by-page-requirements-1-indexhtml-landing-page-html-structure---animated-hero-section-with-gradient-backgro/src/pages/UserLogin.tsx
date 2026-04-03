import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function UserLogin() {
  const [loading, setLoading] = useState(false);
  const { userLogin, isUserLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserLoggedIn()) {
      navigate('/user/search');
    }
  }, [navigate, isUserLoggedIn]);

  const handleDirectAccess = () => {
    setLoading(true);
    setTimeout(() => {
      userLogin();
      navigate('/user/search');
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="absolute inset-0">
          <div className="absolute w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-3xl -top-1/2 -left-1/4 animate-pulse" />
          <div className="absolute w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-3xl top-1/4 right-0 animate-pulse delay-1000" />
          <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-2000" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6 transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">User Portal</h1>
              <p className="text-white/60">Track and verify medicine authenticity</p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                { icon: '🔍', text: 'Search medicines by secret code' },
                { icon: '✅', text: 'Verify medicine authenticity' },
                { icon: '📋', text: 'View complete medicine details' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-white/80 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Direct Access Button */}
            <button
              onClick={handleDirectAccess}
              disabled={loading}
              className="w-full group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Accessing...</span>
                </>
              ) : (
                <>
                  <span>Enter Search Portal</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="mt-6 text-center text-white/40 text-sm">
              No account required. Start searching immediately.
            </p>

            {/* Back to Home */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link to="/" className="text-white/40 hover:text-white/60 text-sm transition-colors flex items-center justify-center gap-2">
                <span>←</span>
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Company Portal Link */}
            <p className="mt-4 text-center">
              <Link to="/company/login" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                Looking for Company Portal? →
              </Link>
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { value: '1M+', label: 'Searches' },
              { value: '10K+', label: 'Companies' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
