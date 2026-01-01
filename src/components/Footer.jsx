import { School, Github, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div className="space-y-6 pr-20">
            <div className="flex items-center gap-2">
              <School className="w-8 h-8 text-indigo-600" />
              <span className="font-black text-2xl text-gray-900 tracking-tight">RY-SYSTEM</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              The central hub for campus engagement. Discover communities, manage organizations, and stay updated with every event.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4">
              <li key="Browse Clubs">
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Browse Clubs</a>
              </li>
              <li key="Campus Events">
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Campus Events</a>
              </li>
              <li key="ENSAKH website">
                <a href="http://ensak.usms.ac.ma/ensak/" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">ENSAKH website</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-sm font-medium text-slate-500">
                  Ecole Nationale des Sciences Appliquées<br />
                  Bd Béni Amir, BP 77 Khouribga - Maroc.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-sm font-medium text-slate-500">+212 6 46 25 10 47</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-sm font-medium text-slate-500">ry.system@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            © {currentYear} RY-SYS Platform.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
