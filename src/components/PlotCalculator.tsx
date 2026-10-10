'use client';

import React, { useState } from 'react';
import { Calculator, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PlotCalculator() {
  const [plotSqFt, setPlotSqFt] = useState(1200);
  const [ratePerSqFt, setRatePerSqFt] = useState(1850);
  const [growthRate, setGrowthRate] = useState(15); // 15% CAGR

  const initialInvestment = plotSqFt * ratePerSqFt;

  const calculateFutureValue = (years: number) => {
    return Math.round(initialInvestment * Math.pow(1 + growthRate / 100, years));
  };

  const formatLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="bg-gradient-to-br from-[#00241d] to-[#006452] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-600/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Form */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <span className="text-xs font-bold text-[#C5A869] uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Calculator className="w-4 h-4" />
              Plot Investment Tool
            </span>
            <h3 className="font-heading-sc text-xl sm:text-2xl font-bold text-white">
              Plot ROI & Appreciation Estimator
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              Calculate the projected capital growth of freehold gated land.
            </p>
          </div>

          {/* Slider 1: Area */}
          <div className="space-y-1.5 bg-black/20 p-3.5 rounded-xl border border-white/10">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-100">Plot Area:</span>
              <span className="text-[#C5A869] font-heading-sc text-sm">
                {plotSqFt.toLocaleString('en-IN')} Sq.Ft ({Math.round(plotSqFt / 435.6)} Cents)
              </span>
            </div>
            <input
              type="range"
              min="800"
              max="3600"
              step="100"
              value={plotSqFt}
              onChange={(e) => setPlotSqFt(Number(e.target.value))}
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C5A869]"
            />
          </div>

          {/* Slider 2: Rate */}
          <div className="space-y-1.5 bg-black/20 p-3.5 rounded-xl border border-white/10">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-100">Rate / Sq.Ft:</span>
              <span className="text-[#C5A869] font-heading-sc text-sm">
                ₹{ratePerSqFt.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="1150"
              max="3500"
              step="50"
              value={ratePerSqFt}
              onChange={(e) => setRatePerSqFt(Number(e.target.value))}
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C5A869]"
            />
          </div>

          {/* Slider 3: CAGR */}
          <div className="space-y-1.5 bg-black/20 p-3.5 rounded-xl border border-white/10">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-100">Expected Annual Growth (CAGR):</span>
              <span className="text-[#C5A869] font-heading-sc text-sm">{growthRate}% / year</span>
            </div>
            <input
              type="range"
              min="10"
              max="22"
              step="1"
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C5A869]"
            />
          </div>
        </div>

        {/* Right Dashboard */}
        <div className="lg:col-span-6 bg-white text-gray-900 p-6 sm:p-7 rounded-2xl shadow-xl space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
              Investment Today
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-heading-sc text-2xl sm:text-3xl font-black text-[#006452]">
                {formatLakhs(initialInvestment)}
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                (₹{initialInvestment.toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          {/* Projection Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">In 3 Years</span>
              <p className="font-heading-sc text-sm font-bold text-emerald-950 mt-0.5">
                {formatLakhs(calculateFutureValue(3))}
              </p>
            </div>

            <div className="bg-emerald-100 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-900 uppercase block">In 5 Years</span>
              <p className="font-heading-sc text-sm font-bold text-emerald-950 mt-0.5">
                {formatLakhs(calculateFutureValue(5))}
              </p>
            </div>

            <div className="bg-[#006452] text-white p-2.5 rounded-xl shadow-sm">
              <span className="text-[10px] font-bold text-[#C5A869] uppercase block">In 10 Years</span>
              <p className="font-heading-sc text-sm font-bold text-white mt-0.5">
                {formatLakhs(calculateFutureValue(10))}
              </p>
            </div>
          </div>

          <Link
            href="/properties"
            className="w-full bg-[#006452] hover:bg-[#00473a] text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
          >
            <span>Explore High-ROI Available Plots</span>
            <ArrowRight className="w-4 h-4 text-[#C5A869]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
