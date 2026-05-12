'use client'

import React from 'react'
import { Github, Twitter, Linkedin, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function NeoMinimalFooter() {
  return (
    <footer className="w-full bg-card/10 border-t border-white/5 flex flex-wrap pt-16 pb-8 relative overflow-hidden">
      
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />

      <div className="w-full px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
                <ShieldCheck className="text-primary fill-primary/10 animate-pulse" size={24} />
                <h2 className="text-2xl font-bold tracking-tighter text-foreground font-headline">
                    VerifyX
                </h2>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                The global standard for tamper-proof academic credentials. 
                Issue with precision, own with privacy, and verify with absolute certainty.
            </p>
            
            {/* Minimal Input */}
            <div className="flex items-center gap-2 mt-2 group">
                <div className="relative flex-1 max-w-xs">
                    <input 
                        type="email" 
                        placeholder="Subscribe to updates..." 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <button className="p-2.5 bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors">
                    <ArrowRight size={18} />
                </button>
            </div>
          </div>

          {/* Links Columns */}
          {[
            { 
              title: "Protocol", 
              links: [
                { name: "Governance", href: "#" },
                { name: "Transparency", href: "#" },
                { name: "Security", href: "#" },
                { name: "Node Network", href: "#" }
              ] 
            },
            { 
              title: "Institutions", 
              links: [
                { name: "Partners", href: "#" },
                { name: "Implementation", href: "#" },
                { name: "Compliance", href: "#" },
                { name: "API Access", href: "#" }
              ] 
            },
            { 
              title: "Connect", 
              links: [
                { name: "Twitter", href: "#" },
                { name: "GitHub", href: "#" },
                { name: "Discord", href: "#" },
                { name: "LinkedIn", href: "#" }
              ] 
            }
          ].map((section, idx) => (
             <div key={idx} className="col-span-6 md:col-span-2 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-widest font-headline">
                    {section.title}
                </h4>
                <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                        <li key={link.name}>
                            <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted/90
                                group-hover:bg-primary 
                                transition-all group-hover:w-3 duration-200" />
                                {link.name}
                            </a>
                        </li>
                    ))}
                </ul>
             </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                © {new Date().getFullYear()} VerifyX Protocol // SECURED_ON_CHAIN
            </p>

            <div className="flex items-center gap-6">
                 {/* Socials */}
                 <div className="flex gap-4 border-r border-white/10 pr-6 mr-2">
                    {[Github, Twitter, Linkedin].map((Icon, i) => (
                        <a key={i} href="#" className="text-muted-foreground hover:text-white transition-colors">
                            <Icon size={18} />
                        </a>
                    ))}
                 </div>
                 
                 {/* Status */}
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/5 border border-success/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-success/80 tracking-wider">Protocol Active</span>
                 </div>
            </div>
        </div>
      </div>
    </footer>
  )
}