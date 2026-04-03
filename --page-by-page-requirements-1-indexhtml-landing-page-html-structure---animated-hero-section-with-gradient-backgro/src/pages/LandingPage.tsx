import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Shield, Search, Package, Clock, ChevronRight, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse -top-48 -left-48" />
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000 top-1/2 -right-48" />
        <div className="absolute w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl animate-bounce bottom-20 left-1/4" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">MedTrack</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {['features', 'how-it-works', 'portals'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === section ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              {['features', 'how-it-works', 'portals'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block w-full text-left px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fadeIn">
            Medicine Tracking
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Made Simple & Secure
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-12 animate-fadeIn delay-200">
            Track pharmaceutical shipments in real-time. Verify authenticity with unique codes.
            Connect companies and users seamlessly.
          </p>

          {/* Portal Cards */}
          <div id="portals" className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-on-scroll opacity-0">
            {/* Company Portal */}
            <Link
              to="/company/login"
              className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Company Portal</h2>
                <p className="text-white/60 mb-4">Manage your medicine inventory and generate tracking codes</p>
                <div className="flex items-center justify-center gap-2 text-cyan-400 group-hover:text-cyan-300">
                  <span>Access Portal</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* User Portal */}
            <Link
              to="/user/login"
              className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">User Portal</h2>
                <p className="text-white/60 mb-4">Search and verify medicine authenticity with tracking codes</p>
                <div className="flex items-center justify-center gap-2 text-emerald-400 group-hover:text-emerald-300">
                  <span>Track Medicine</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 animate-on-scroll opacity-0">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Why Choose <span className="text-cyan-400">MedTrack</span>?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure Tracking', desc: 'Every shipment is encrypted and verified', color: 'from-blue-500 to-indigo-600' },
              { icon: Search, title: 'Instant Search', desc: 'Find any medicine with unique codes', color: 'from-purple-500 to-pink-600' },
              { icon: Package, title: 'Real-time Updates', desc: 'Track inventory in real-time', color: 'from-emerald-500 to-teal-600' },
              { icon: Clock, title: 'History Logs', desc: 'Complete audit trail for compliance', color: 'from-orange-500 to-red-600' }
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-2"
              >
                <div className={`w-12 h-12 mb-4 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 animate-on-scroll opacity-0">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            How It <span className="text-purple-400">Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Companies register and create an account to access the dashboard' },
              { step: '02', title: 'Add Medicines', desc: 'Add medicines with auto-generated unique tracking codes' },
              { step: '03', title: 'Track & Verify', desc: 'Users search codes to verify and track medicine details' }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
                <div className="w-16 h-16 mx-auto mb-4 -mt-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">MedTrack</span>
              </div>
              <p className="text-white/60 text-sm">
                Secure medicine tracking and verification platform for companies and users.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><Link to="/company/login" className="hover:text-white transition-colors">Company Login</Link></li>
                <li><Link to="/user/login" className="hover:text-white transition-colors">User Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>support@medtrack.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Health Street, Medical District</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} MedTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
