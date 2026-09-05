import { MapPin, Mail, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-2">
          <Mail className="w-4 h-4 text-blue-400" /> Get in Touch
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Contact <span className="gradient-text">Global Collaboration Cell</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Have questions regarding international MoUs, student exchange programs, or research fellowships? Reach out to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-white">Contact Information</h3>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Campus Location</strong>
                Global Collaboration Cell Office, Main Administrative Building,<br />
                BMS Institute of Technology & Management,<br />
                Doddaballapur Main Road, Yelahanka, Bengaluru - 560064
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <strong className="text-white block">Official Email</strong>
                <a
                  href="mailto:gccresearchandoperations@gmail.com"
                  className="hover:underline hover:text-white transition-colors break-all"
                >
                  gccresearchandoperations@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400 shrink-0" />
              <div><strong className="text-white block">Institution Website</strong> https://bmsit.ac.in</div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xl font-bold text-white">Send an Inquiry</h3>
          <form className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Your Name</label>
              <Input placeholder="Full Name" />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Email Address</label>
              <Input type="email" placeholder="email@domain.com" />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Subject</label>
              <Input placeholder="e.g. Student Exchange Inquiry" />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Message</label>
              <textarea
                className="w-full rounded-lg border border-slate-700/80 bg-slate-950/60 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="How can we assist you?"
              />
            </div>
            <Button variant="gradient" className="w-full justify-center">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}