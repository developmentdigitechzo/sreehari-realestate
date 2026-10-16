'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Send, Phone, User, Mail, Calendar, Clock, MapPin, Building2, IndianRupee } from 'lucide-react';
import { COMPANY_WHATSAPP } from '@/data/properties';

import { api } from '@/lib/api';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
  plotName?: string;
  source?: string;
  title?: string;
  subtitle?: string;
}

export default function EnquiryModal({
  isOpen,
  onClose,
  propertyName,
  plotName,
  source,
  title = 'Book a Site Visit & Plot Consultation',
  subtitle = 'Get layout blueprints, DTCP approvals, pickup assistance & price details.'
}: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    propertyName: propertyName || '',
    budget: '',
    preferredDate: '',
    preferredTime: '',
    message: plotName ? `Enquiring specifically for: ${plotName}` : '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset all fields whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        location: '',
        propertyName: propertyName || '',
        budget: '',
        preferredDate: '',
        preferredTime: '',
        message: plotName ? `Enquiring specifically for: ${plotName}` : '',
      });
      setSubmitted(false);
      setErrorMessage('');
    }
  }, [isOpen, propertyName, plotName]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resolvedSource = source || (propertyName ? 'Property Form' : 'Site Visit Modal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const resolvedProject = formData.propertyName || propertyName || 'General Enquiry';
      const notesContent = [
        formData.location ? `Location: ${formData.location}` : null,
        formData.budget ? `Budget: ${formData.budget}` : null,
        formData.message || null
      ].filter(Boolean).join(' | ');

      if (formData.preferredDate) {
        await api.submitPublicSiteVisit({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          project_name: resolvedProject,
          pickup_location: formData.location || undefined,
          visit_date: formData.preferredDate,
          visit_time: formData.preferredTime,
          preferred_plot_size: formData.budget,
          notes: notesContent,
          source: resolvedSource,
        });
      } else {
        await api.submitPublicLead({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          preferred_plot_size: formData.budget,
          message: `[${resolvedProject}] ${notesContent}`.trim(),
          source: resolvedSource,
          visit_date: formData.preferredDate,
          visit_time: formData.preferredTime,
        });
      }

      // Save lead to localStorage as well
      try {
        const existingLeads = JSON.parse(localStorage.getItem('sree_hari_leads') || '[]');
        existingLeads.unshift({
          ...formData,
          propertyName: resolvedProject,
          source: resolvedSource,
          timestamp: new Date().toISOString(),
          id: 'LEAD-' + Date.now(),
        });
        localStorage.setItem('sree_hari_leads', JSON.stringify(existingLeads));
      } catch {
        // ignore storage error
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent(
      `Hello Sree Hari Realty,\n\nName: ${formData.name}\nPhone: ${formData.phone}\nLocation: ${formData.location || 'Any'}\nProject: ${formData.propertyName || propertyName || 'All Layouts'}\nPreferred Budget: ${formData.budget || 'Flexible'}\nPreferred Visit Date: ${formData.preferredDate || 'Flexible'}${formData.preferredTime ? ` at ${formData.preferredTime}` : ''}\nMessage: ${formData.message || 'Booking Site Visit'}`
    );
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg sm:max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-auto">
        {/* Modal Header */}
        <div className="bg-[#075E43] text-white p-5 sm:px-8 sm:py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C5A869] text-xs font-bold uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>DTCP & TNRERA Certified</span>
          </div>

          <h3 className="font-heading-sc text-lg sm:text-xl font-bold text-white pr-6">
            {propertyName ? `Enquire About ${propertyName}` : title}
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">{subtitle}</p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#075E43] flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="font-heading-sc text-xl font-bold text-gray-900">
                Enquiry Received Successfully!
              </h4>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Our senior property advisor will call you shortly at <strong>{formData.phone}</strong> with the layout blueprint and price list.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Connect on WhatsApp Now
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Responsive 2-Column Grid on Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left Column: Personal & Financial Preferences */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-red-500">* (10 Digits)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="name@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Preferred Budget
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800 cursor-pointer"
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

                {/* Right Column: Location, Project, Schedule & Requirements */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full pl-9 pr-2 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800 cursor-pointer"
                        >
                          <option value="">Select Location</option>
                          <option value="Trichy">Trichy</option>
                          <option value="Pudukkottai">Pudukkottai</option>
                          <option value="Thirumayam">Thirumayam</option>
                          <option value="Thanjavur Highway">Thanjavur Highway</option>
                          <option value="Flexible / Other">Flexible / Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Property
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <select
                          value={formData.propertyName}
                          onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                          className="w-full pl-9 pr-2 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800 cursor-pointer"
                        >
                          <option value="">Select Property</option>
                          <option value="Park Avenue">Park Avenue</option>
                          <option value="Sri Amman Nagar">Sri Amman Nagar</option>
                          <option value="Aishwarya Nagar">Aishwarya Nagar</option>
                          <option value="All Projects / Flexible">All Projects</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Visit Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                        <input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Visit Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                        <input
                          type="time"
                          value={formData.preferredTime}
                          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Specific Query / Requirement
                    </label>
                    <textarea
                      rows={2}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="E.g., Looking for 1500 sq.ft East facing plot with bank loan..."
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E43] focus:bg-white text-gray-800 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA & Trust Badge */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#075E43] hover:bg-[#04432F] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{loading ? 'Submitting...' : 'Submit & Request Call Back'}</span>
                </button>

                <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#075E43]" />
                  Your information is 100% confidential. No spam guaranteed.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
