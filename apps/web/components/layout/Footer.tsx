import Link from "next/link";
import { MapPin, ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                GCC
              </div>
              <span className="font-bold text-white text-base">BMSIT&M GCC</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Global Collaboration Cell at BMS Institute of Technology & Management. Bridging students with international universities, research fellowships, and global career opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Doddaballapur Main Road, Yelahanka, Bengaluru, Karnataka 560064</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/vision" className="hover:text-blue-400 transition-colors">Vision & Mission</Link></li>
              <li><Link href="/what-we-do" className="hover:text-blue-400 transition-colors">What We Do</Link></li>
              <li><Link href="/opportunities" className="hover:text-blue-400 transition-colors">Global Opportunities</Link></li>
              <li><Link href="/events" className="hover:text-blue-400 transition-colors">Upcoming Events</Link></li>
              <li><Link href="/collaborations" className="hover:text-blue-400 transition-colors">MOUs Showcase</Link></li>
              <li><Link href="/members" className="hover:text-blue-400 transition-colors">GCC Team Directory</Link></li>
            </ul>
          </div>

          {/* Opportunities */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Opportunities</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/opportunities?type=internship" className="hover:text-blue-400 transition-colors">International Internships</Link></li>
              <li><Link href="/opportunities?type=scholarship" className="hover:text-blue-400 transition-colors">University Scholarships</Link></li>
              <li><Link href="/opportunities?type=research" className="hover:text-blue-400 transition-colors">Research Grants & Fellowships</Link></li>
              <li><Link href="/opportunities?type=exchange" className="hover:text-blue-400 transition-colors">Student Exchange Programs</Link></li>
              <li><Link href="/opportunities?type=hackathon" className="hover:text-blue-400 transition-colors">Global Hackathons</Link></li>
            </ul>
          </div>

          {/* Member Portal Access */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-sm">GCC Members</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized GCC student representatives and faculty leads can log in to access task tracking, department desks, and operational records.
            </p>
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Member Portal Sign In
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Global Collaboration Cell (GCC), BMSIT&M. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Built for Global Excellence</span>
            <a href="https://bmsit.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 flex items-center gap-1">
              BMSIT&M Website <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
