
import React from 'react';
import { UserState, View } from '../types';
import { playClick } from '../sound';

export const Header: React.FC<{ user: UserState; setView: (v: View) => void }> = ({ user, setView }) => (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 px-3 py-2 md:p-4 flex justify-between items-center border-b-2 border-sky-50 h-14 md:h-auto">
    <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => { playClick(); setView(View.MAP); }}>
      <span className="text-2xl md:text-4xl">🏝️</span>
      <div>
        <h1 className="text-lg md:text-xl font-black text-sky-600 leading-tight">奇幻岛</h1>
        <p className="hidden md:block text-[10px] text-sky-300 font-bold uppercase tracking-widest">Adventure Lab</p>
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-3">
      {/* New Store Button in Header */}
      <button 
        onClick={() => { playClick(); setView(View.STORE); }}
        className="bg-amber-100 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-sm active:scale-95 transition-transform"
      >
        <span className="text-xl md:text-2xl">🎁</span>
      </button>

      <div className="bg-amber-100 px-2 md:px-4 py-1 rounded-full flex items-center gap-1 md:gap-2 border-2 border-amber-200">
        <span className="text-sm md:text-xl">⭐</span>
        <span className="font-black text-amber-600 tabular-nums text-sm md:text-base">{user.stars}</span>
      </div>
      <button onClick={() => { playClick(); setView(View.PROFILE); }} className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border-2 border-sky-100 flex items-center justify-center text-xl md:text-3xl shadow-sm active:scale-95 transition-transform">
        {user.avatar}
      </button>
    </div>
  </header>
);
