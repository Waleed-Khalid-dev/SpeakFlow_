"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Bot, 
  Target, 
  FileText, 
  LineChart, 
  Settings,
  LogOut,
  Quote
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/students", icon: Users },
    { name: "Reading Sessions", href: "/sessions", icon: History },
    { name: "AI Agents", href: "/agents", icon: Bot },
    { name: "Practice Center", href: "/practice", icon: Target },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Progress Tracker", href: "/progress", icon: LineChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-card border-r border-border-dark">
      {/* Logo Area */}
      <div className="p-6">
        <h1 className="text-2xl font-bold font-sans text-text-primary">SpeakFlow<span className="text-accent-primary-dark">AI</span></h1>
        <p className="text-xs text-text-secondary mt-1 font-mono uppercase tracking-wider">Every reader. Every day.</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-primary-bg text-accent-primary-dark border-l-4 border-accent-primary-dark"
                      : "text-text-secondary hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Current Student Area */}
      <div className="p-4 border-t border-border-dark">
        <div className="mb-2 px-2">
          <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Current Student</span>
        </div>
        <div className="flex items-center p-2 mb-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-lg">
            AS
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold text-text-primary">Aarav Sharma</p>
            <p className="text-xs text-text-secondary">Grade 3 • Level 2</p>
          </div>
        </div>

        {/* Encouragement Card */}
        <div className="p-3 mb-4 bg-accent-secondary-bg rounded-lg border border-accent-secondary/20">
          <Quote className="w-4 h-4 text-accent-secondary mb-1" />
          <p className="text-xs text-text-primary font-medium">
            "Aarav is showing great focus today. Let's work on <span className="text-pink-500 font-bold">'dr' blends!</span>"
          </p>
        </div>

        {/* Log Out */}
        <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-text-secondary hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </button>
      </div>
    </div>
  );
}
