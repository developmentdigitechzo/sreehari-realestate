'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Navigation,
  Building2,
  ExternalLink,
  X,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import {
  COMPANY_PHONE,
  COMPANY_PHONE_RAW,
  COMPANY_PHONE_SECONDARY,
  COMPANY_PHONE_SECONDARY_RAW,
  COMPANY_WHATSAPP,
  COMPANY_EMAIL,
  COMPANY_ADDRESS,
  properties
} from '@/data/properties';

import { api } from '@/lib/api';

export default function ContactPage() {
  const [workingHours, setWorkingHours] = useState('Mon - Sat: 9:00 AM - 7:00 PM');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestedProject: '',
    budget: '',
    visitDate: '',
    visitTime: '',
    message: '',
  });

  const [submittedData, setSubmittedData] = useState<{
    name: string;
    phone: string;
    email: string;
    interestedProject: string;
    budget: string;
    visitDate: string;
    visitTime: string;
    message: string;
  } | null>(null);

  const [showGreeting, setShowGreeting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showGreeting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (showGreeting && countdown === 0) {
      setShowGreeting(false);
    }
    return () => clearTimeout(timer);
  }, [showGreeting, countdown]);

  useEffect(() => {
    api.getPublicSettings().then((res) => {
      if (res?.data?.working_hours) {
        setWorkingHours(res.data.working_hours);
      }
    }).catch(() => null);
  }, []);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const notesContent = [
        formData.budget ? `Budget: ${formData.budget}` : null,
        formData.interestedProject ? `Project: ${formData.interestedProject}` : null,
        formData.message || null
      ].filter(Boolean).join(' | ');

      if (formData.visitDate) {
        await api.submitPublicSiteVisit({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          project_name: formData.interestedProject || 'General Enquiry',
          visit_date: formData.visitDate,
          visit_time: formData.visitTime,
          preferred_plot_size: formData.budget,
          notes: notesContent,
          source: 'Contact Form',
        });
      } else {
        await api.submitPublicLead({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          preferred_plot_size: formData.budget,
          message: notesContent,
          source: 'Contact Form',
          visit_date: formData.visitDate,
          visit_time: formData.visitTime,
        });
      }

      // Also mirror locally
      try {
        const existing = JSON.parse(localStorage.getItem('sree_hari_leads') || '[]');
        existing.unshift({
          ...formData,
          source: 'Contact Form',
          timestamp: new Date().toISOString(),
          id: 'LEAD-CONTACT-' + Date.now(),
        });
        localStorage.setItem('sree_hari_leads', JSON.stringify(existing));
      } catch {
        // ignore
      }

      // Store submitted data for greeting modal and WhatsApp
      setSubmittedData({ ...formData });
      setShowGreeting(true);
      setCountdown(5);

      // Reset form fields immediately so after modal closes, form is fresh
      setFormData({
        name: '',
        phone: '',
        email: '',
        interestedProject: '',
        budget: '',
        visitDate: '',
        visitTime: '',
        message: '',
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppChat = () => {
    const data = submittedData || formData;
    const text = encodeURIComponent(
      `Hi Sree Hari Realty Promoters,\n\nName: ${data.name}\nPhone: ${data.phone}\nInterested Project: ${data.interestedProject || 'All Projects'}\nPreferred Budget: ${data.budget || 'Flexible'}\nVisit Date: ${data.visitDate || 'Flexible'}${data.visitTime ? ` at ${data.visitTime}` : ''}\nMessage: ${data.message || 'Looking for DTCP/RERA plot details in Trichy.'}`
    );
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-16 font-sans">
      {/* 1. Page Header WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_contact.jpg"
          alt="Sree Hari Realty Promoters Client Experience & Consultation Office"
          fill
          priority
          quality={95}
          className="object-cover object-[70%_center] sm:object-center"
        />

        {/* Balanced Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>GET IN TOUCH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Contact & Book <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Site Visit</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-[15px] font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Visit our Trichy Head Office & Plot Booking Office or schedule a guided site tour to our DTCP & RERA approved gated communities. We are open all 7 days of the week.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Official Contact & Office Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-[#006452] via-[#005243] to-[#004135] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-emerald-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-700/60">
                  <Building2 className="w-3.5 h-3.5 text-[#ffa3c8]" />
                  <span>HEAD OFFICE & BOOKING OFFICE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sree Hari Realty Promoters
                </h2>
                <p className="text-sm text-emerald-100/90 leading-relaxed">
                  Leading DTCP & RERA approved gated community plot developers in Tiruchirappalli and prime Tamil Nadu growth corridors.
                </p>
              </div>

              <div className="space-y-5 pt-3 border-t border-emerald-700/70 text-[15px]">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Office Address
                    </span>
                    <p className="text-[15px] text-white leading-snug mt-1 font-medium">
                      {COMPANY_ADDRESS}
                    </p>
                  </div>
                </div>

                {/* Primary & Secondary Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Booking Helpline Numbers
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-1">
                      <a
                        href={`tel:${COMPANY_PHONE_RAW}`}
                        className="text-[15px] font-extrabold text-white hover:text-amber-300 transition"
                      >
                        {COMPANY_PHONE}
                      </a>
                      <span className="hidden sm:inline text-emerald-400">|</span>
                      <a
                        href={`tel:${COMPANY_PHONE_SECONDARY_RAW}`}
                        className="text-[15px] font-extrabold text-white hover:text-amber-300 transition"
                      >
                        {COMPANY_PHONE_SECONDARY}
                      </a>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      WhatsApp Support
                    </span>
                    <a
                      href={`https://wa.me/${COMPANY_WHATSAPP}?text=Hi%20Sree%20Hari%20Realty%2C%20I%20want%20to%20enquire%20about%20plots.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] font-extrabold text-white hover:text-amber-300 transition mt-1 inline-flex items-center gap-1.5"
                    >
                      <span>+91 73737 13559 (Chat on WhatsApp)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Official Email
                    </span>
                    <a
                      href={`mailto:${COMPANY_EMAIL}`}
                      className="text-[15px] text-white hover:text-amber-300 transition mt-1 block"
                    >
                      {COMPANY_EMAIL}
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Working Hours
                    </span>
                    <p className="text-[15px] text-white mt-1 leading-snug">
                      {workingHours} <br />
                      <span className="text-xs text-emerald-200">(Site visits available all 7 days)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    'Sree Hari Sweets, Melapudur Main Road, Tiruchirappalli, Tamil Nadu 620001'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] font-extrabold py-3.5 px-5 rounded-full text-[14px] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  <Navigation className="w-4 h-4 text-[#006452]" />
                  <span>Get Directions to Office</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Lead & Site Visit Form */}
          <div className="lg:col-span-7 bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl shadow-sm border border-amber-100/90 space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#D61F69] uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-md border border-pink-100">
                QUICK RESPONSE FORM
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
                Send an Enquiry or Book a Site Visit
              </h3>
              <p className="text-[15px] text-gray-700">
                Fill in your details below and our plot specialists will reach out promptly with pricing and blueprint layouts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">* (10 Digits)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Preferred Budget
                    </label>
                    <div className="relative">
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                      >
                        <option value="">Select Preferred Budget</option>
                        <option value="Under 15 Lakhs">Under ₹15 Lakhs</option>
                        <option value="15 - 25 Lakhs">₹15 Lakhs - ₹25 Lakhs</option>
                        <option value="25 - 40 Lakhs">₹25 Lakhs - ₹40 Lakhs</option>
                        <option value="Above 40 Lakhs">₹40 Lakhs & Above</option>
                        <option value="Flexible">Flexible / Open to Discussion</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Project
                  </label>
                  <select
                    value={formData.interestedProject}
                    onChange={(e) =>
                      setFormData({ ...formData, interestedProject: e.target.value })
                    }
                    className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                  >
                    <option value="">Select Project</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Preferred Site Visit Date
                    </label>
                    <input
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Preferred Site Visit Time
                    </label>
                    <input
                      type="time"
                      value={formData.visitTime}
                      onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Looking for a 1200 or 1500 sq.ft DTCP/RERA plot in Trichy with immediate registration..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-900 resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] font-extrabold py-3.5 px-6 rounded-full text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4 text-[#006452]" />
                    <span>{loading ? 'Submitting...' : 'Submit Enquiry & Book Site Visit'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#006452]" />
                  <span>100% DTCP & RERA Approved Plots • Doorstep Cab Site Pickup</span>
                </div>
              </form>
          </div>
        </div>
      </section>

      {/* 3. Embedded Location Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#D61F69] uppercase tracking-wider block">
                LOCATION ON MAP
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#006452]">
                Sree Hari Realty Promoters Head Office
              </h3>
              <p className="text-[15px] text-gray-600 mt-0.5">
                {COMPANY_ADDRESS}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                'Sree Hari Sweets, Melapudur Main Road, Tiruchirappalli, Tamil Nadu 620001'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-6 py-2.5 rounded-full text-sm font-extrabold transition shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer hover:-translate-y-0.5"
            >
              <Navigation className="w-4 h-4 text-[#006452]" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-amber-200/80 shadow-inner">
            <iframe
              title="Sree Hari Realty Promoters Melapudur Trichy Office"
              src="https://maps.google.com/maps?q=Sree+Hari+Sweets,+Melapudur+Main+Road,+Tiruchirappalli,+Tamil+Nadu+620001&t=&z=17&ie=UTF8&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 4. Automated Greeting & Submission Confirmation Popup Modal */}
      {showGreeting && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 p-6 sm:p-8 space-y-5 animate-scaleUp">
            {/* Top Close Button */}
            <button
              onClick={() => setShowGreeting(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
              aria-label="Close Greeting"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon & Greeting */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006452] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-[#006452]" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#D61F69] border border-pink-100">
                🎉 Enquiry Received Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-[#006452] tracking-tight">
                Thank You, {submittedData.name}!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                Your enquiry and site visit appointment request have been registered with our senior property advisory team.
              </p>
            </div>

            {/* Submission Details Summary Box */}
            <div className="bg-gradient-to-b from-[#fffdf5] to-amber-50/50 rounded-2xl p-4 border border-amber-200/80 text-xs space-y-2 text-gray-700">
              <div className="flex justify-between items-center py-1 border-b border-amber-100">
                <span className="text-gray-500 font-medium">Interested Project:</span>
                <span className="font-bold text-[#006452]">{submittedData.interestedProject || 'All Projects / Flexible'}</span>
              </div>
              {submittedData.budget && (
                <div className="flex justify-between items-center py-1 border-b border-amber-100">
                  <span className="text-gray-500 font-medium">Preferred Budget:</span>
                  <span className="font-bold text-[#006452]">{submittedData.budget}</span>
                </div>
              )}
              {submittedData.visitDate && (
                <div className="flex justify-between items-center py-1 border-b border-amber-100">
                  <span className="text-gray-500 font-medium">Scheduled Visit:</span>
                  <span className="font-bold text-[#006452]">
                    {submittedData.visitDate} {submittedData.visitTime ? `(${submittedData.visitTime})` : ''}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Callback Mobile:</span>
                <span className="font-bold text-gray-900">{submittedData.phone}</span>
              </div>
            </div>

            {/* Auto-close Progress & Countdown */}
            <div className="space-y-1.5 text-center">
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#006452] h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Closing automatically in <strong className="text-[#006452] font-bold">{countdown}s</strong>...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleWhatsAppChat}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </button>
              <button
                onClick={() => setShowGreeting(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Close Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
