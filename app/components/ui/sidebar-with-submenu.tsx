"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Layers, 
  Settings, 
  LogOut, 
  BrainCircuit, 
  ChevronDown 
} from "lucide-react";

type MenuItem = { name: string; href: string; icon?: React.ReactNode };

const Menu = ({ children, items }: { children: React.ReactNode; items: MenuItem[] }) => {
  const [isOpened, setIsOpened] = useState(false);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between text-gray-600 p-2 rounded-lg hover:bg-gray-50 duration-150"
        onClick={() => setIsOpened((v) => !v)}
      >
        <div className="flex items-center gap-x-2">{children}</div>
        <ChevronDown className={`w-4 h-4 duration-150 ${isOpened ? "rotate-180" : ""}`} />
      </button>
      {isOpened && (
        <ul className="mx-4 px-2 border-l text-sm font-medium space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>
              <a href={item.href} className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-50">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Sidebar = ({ onStartQuiz }: { onStartQuiz: () => void }) => {
  const navigation = [
    { href: "#", name: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "#", name: "Interactive Map", icon: <MapIcon className="w-5 h-5" /> },
  ];

  const nestedNav = [
    { name: "1206 - Их Монгол Улс", href: "#" },
    { name: "1271 - Юань Гүрэн", href: "#" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-72 h-full border-r bg-white flex flex-col z-50">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1599408162165-8b829bc296e1?w=100" className="w-10 h-10 rounded-full" alt="User" />
          <div>
            <span className="block text-gray-700 text-sm font-bold uppercase tracking-tight">Munkhtsetseg</span>
            <span className="block text-gray-500 text-xs">Software Engineer</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <button 
          onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-semibold"
        >
          <BrainCircuit className="w-5 h-5" />
          Quiz Эхлүүлэх
        </button>

        <ul className="space-y-1">
          {navigation.map((item, idx) => (
            <li key={idx}>
              <a href={item.href} className="flex items-center gap-2 text-gray-600 p-2 rounded-lg hover:bg-gray-50">
                {item.icon} {item.name}
              </a>
            </li>
          ))}
          <li>
            <Menu items={nestedNav}>
              <Layers className="w-5 h-5 text-gray-500" /> Түүхэн Атлас
            </Menu>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-2 text-red-500 p-2 rounded-lg hover:bg-red-50 text-sm font-medium">
          <LogOut className="w-5 h-5" /> Гарах
        </button>
      </div>
    </nav>
  );
};