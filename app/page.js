"use client"; // Add this at the very top

import React from 'react';
import Link from 'next/link';
// Make sure lucide-react is installed: npm install lucide-react
import { MoveRight, ShieldCheck, Leaf, LayoutGrid } from 'lucide-react';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      
      {/* 1. Top Mini Banner */}
      <div className="w-full bg-[#F0F9F4] py-2 flex justify-center items-center gap-2 border-b border-green-100">
        <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
        <p className="text-[13px] font-medium text-green-800">
          Reducing Food Waste by 30%
        </p>
      </div>

      {/* 2. Hero Section */}
      <main className="max-w-4xl mx-auto pt-24 pb-32 px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
          Smart Mess. <br />
          <span className="text-[#D97706]">Better Meals.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium mb-10 leading-relaxed">
          MessMate helps hostels optimize kitchen inventory using real-time 
          student polling. No more guessing, no more wasting.
        </p>

        <div className="flex items-center justify-center gap-8">
          <Link href="/dashboard">
            <button className="bg-[#1E293B] text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              Open Dashboard <MoveRight size={20} />
            </button>
          </Link>
          <button className="text-slate-600 font-semibold hover:text-slate-900 transition-colors">
            How it works
          </button>
        </div>
      </main>

      {/* 3. Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-12 text-left">
          
          {/* Smart Inventory */}
          <div className="space-y-4">
            <div className="text-orange-600">
              <LayoutGrid size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold">Smart Inventory</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically calculates raw materials based on live headcount.
            </p>
          </div>

          {/* QR Authentication */}
          <div className="space-y-4">
            <div className="text-blue-600">
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold">QR Authentication</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Secure entry using system-generated tickets for every meal.
            </p>
          </div>

          {/* Zero Waste */}
          <div className="space-y-4">
            <div className="text-green-600">
              <Leaf size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold">Zero Waste</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time data prevents overcooking and saves tons of food yearly.
            </p>
          </div>

        </div>
      </section>

      {/* Profile Icon Footer */}
      <div className="fixed bottom-6 left-6">
        <div className="bg-slate-200 h-10 w-10 rounded-full flex items-center justify-center text-slate-500 border border-slate-300">
          <span className="font-bold text-xs uppercase text-slate-600">N</span>
        </div>
      </div>
    </div>
  );
}