import { motion } from 'motion/react';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { translations, type Language } from '../i18n';

interface NavbarProps {
  onNavigate?: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export default function Navbar({ onNavigate, lang, setLang }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang].nav;

  const handleNavClick = () => {
    setIsOpen(false);
    if (onNavigate) onNavigate();
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[110] glass">
      <div className="max-w-[1600px] mx-auto px-4 h-20 flex items-center justify-between">
        <motion.button 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            handleNavClick();
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold tracking-tighter hover:text-white/60 transition-colors"
        >
          DO STUDIO<span className="text-white/40">.</span>
        </motion.button>

        <div className="hidden md:flex items-center space-x-12">
          {[
            { label: t.work, id: 'work' },
            { label: t.about, id: 'about' },
            { label: t.contact, id: 'contact' }
          ].map((item, i) => (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              onClick={handleNavClick}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-sm uppercase tracking-widest font-medium text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
          
          <motion.button
            onClick={toggleLang}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-2 text-xs font-bold tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full"
          >
            <Globe size={12} />
            <span>{lang === 'en' ? 'EN' : '中'}</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-6 md:hidden">
          <button
            onClick={toggleLang}
            className="text-xs font-bold tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-2 py-1 rounded-full"
          >
            {lang === 'en' ? 'EN' : '中'}
          </button>
          <button 
            className="text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-black border-b border-white/10 p-6 flex flex-col space-y-6"
        >
          {[
            { label: t.work, id: 'work' },
            { label: t.about, id: 'about' },
            { label: t.contact, id: 'contact' }
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-lg uppercase tracking-widest font-medium"
              onClick={handleNavClick}
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
