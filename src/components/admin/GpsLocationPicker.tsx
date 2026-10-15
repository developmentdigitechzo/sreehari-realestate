'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Map as MapIcon,
  X,
  Check
} from 'lucide-react';

interface GpsLocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  label?: string;
  helpText?: string;
}

// Famous reference presets for Trichy and project regions
const LOCATION_PRESETS = [
  {
    name: 'Park Avenue (Gundur / Airport)',
    lat: '10.749500',
    lng: '78.723200'
  },
  {
    name: 'Trichy Central Bus Stand',
    lat: '10.793700',
    lng: '78.685600'
  },
  {
    name: 'Navalpattu IT Park Corridor',
    lat: '10.762100',
    lng: '78.751200'
  },
  {
    name: 'Trichy International Airport',
    lat: '10.765400',
    lng: '78.709700'
  }
];

export default function GpsLocationPicker({
  latitude,
  longitude,
  onChange,
  label = 'GPS Map Coordinates & Navigation Link',
  helpText = 'Accurate coordinates will power the public Google Maps driving direction button.'
}: GpsLocationPickerProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoSuccess, setGeoSuccess] = useState('');

  // Interactive Map Pin Selection state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempLat, setTempLat] = useState('10.749500');
  const [tempLng, setTempLng] = useState('78.723200');

  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const isValidLat = !isNaN(numLat) && numLat >= -90 && numLat <= 90;
  const isValidLng = !isNaN(numLng) && numLng >= -180 && numLng <= 180;
  const hasValidCoords = isValidLat && isValidLng && latitude.trim() !== '' && longitude.trim() !== '';

  // Listen for real-time postMessage events from Leaflet iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'GPS_PIN_MOVED') {
        if (event.data.lat && event.data.lng) {
          setTempLat(event.data.lat);
          setTempLng(event.data.lng);
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Option A: Use Current Location (Browser Geolocation)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');
    setGeoSuccess('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        onChange(lat, lng);
        setGeoLoading(false);
        setGeoSuccess(`Detected GPS: ${lat}, ${lng}`);
        setTimeout(() => setGeoSuccess(''), 4000);
      },
      (error) => {
        setGeoLoading(false);
        setGeoError(error.message || 'Unable to retrieve your current location.');
        setTimeout(() => setGeoError(''), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Option B: Select on Interactive Map
  const handleOpenMapModal = () => {
    const initLat = hasValidCoords ? numLat.toFixed(6) : '10.749500';
    const initLng = hasValidCoords ? numLng.toFixed(6) : '78.723200';
    setTempLat(initLat);
    setTempLng(initLng);
    setIsMapModalOpen(true);
  };

  const handleConfirmPinLocation = () => {
    onChange(tempLat, tempLng);
    setIsMapModalOpen(false);
    setGeoSuccess(`Pin location applied: ${tempLat}, ${tempLng}`);
    setTimeout(() => setGeoSuccess(''), 4000);
  };

  const handleApplyPreset = (preset: { lat: string; lng: string; name: string }) => {
    onChange(preset.lat, preset.lng);
    setGeoSuccess(`Applied preset: ${preset.name}`);
    setTimeout(() => setGeoSuccess(''), 3000);
  };

  const googleMapsUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude.trim()},${longitude.trim()}`
    : null;

  const osmEmbedUrl = hasValidCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${numLng - 0.005}%2C${numLat - 0.005}%2C${numLng + 0.005}%2C${numLat + 0.005}&layer=mapnik&marker=${numLat}%2C${numLng}`
    : null;

  const mapHtmlDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; font-family: system-ui, -apple-system, sans-serif; background: #0f172a; }
        .info-bar {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(15, 23, 42, 0.92);
          color: #10b981;
          padding: 7px 18px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          pointer-events: none;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="info" class="info-bar">📍 Click anywhere or drag the pin marker</div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const startLat = ${tempLat};
        const startLng = ${tempLng};
        const map = L.map('map', { zoomControl: true }).setView([startLat, startLng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);

        function report(lat, lng) {
          const fLat = lat.toFixed(6);
          const fLng = lng.toFixed(6);
          document.getElementById('info').innerText = '📍 Selected: ' + fLat + ', ' + fLng;
          window.parent.postMessage({ type: 'GPS_PIN_MOVED', lat: fLat, lng: fLng }, '*');
        }

        marker.on('dragend', function(e) {
          const p = e.target.getLatLng();
          report(p.lat, p.lng);
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          report(e.latlng.lat, e.latlng.lng);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
        <div>
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{helpText}</p>
        </div>

        {/* Dual Actions: Option A (Current Location) & Option B (Select on Map) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Option A: Detect your current GPS location via device sensors"
          >
            <Crosshair className={`w-3.5 h-3.5 text-emerald-400 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Locating...' : 'Use My Current Location'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenMapModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
            title="Option B: Open interactive map with movable pin marker"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Select on Map</span>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-[11px] font-semibold mb-1">
            Latitude (-90.0 to 90.0)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 10.749500"
              value={latitude || ''}
              onChange={(e) => onChange(e.target.value, longitude)}
              className={`w-full bg-slate-900 border rounded-xl p-2.5 text-xs text-white focus:outline-none ${
                latitude && !isValidLat
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            {latitude && !isValidLat && (
              <span className="text-[10px] text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2">
                Invalid
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-[11px] font-semibold mb-1">
            Longitude (-180.0 to 180.0)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 78.723200"
              value={longitude || ''}
              onChange={(e) => onChange(latitude, e.target.value)}
              className={`w-full bg-slate-900 border rounded-xl p-2.5 text-xs text-white focus:outline-none ${
                longitude && !isValidLng
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            {longitude && !isValidLng && (
              <span className="text-[10px] text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2">
                Invalid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Quick Regional Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {LOCATION_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Status Notifications */}
      {geoSuccess && (
        <div className="flex items-center gap-2 p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{geoSuccess}</span>
        </div>
      )}

      {geoError && (
        <div className="flex items-center gap-2 p-2 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Preview & Google Maps Link */}
      {hasValidCoords && (
        <div className="space-y-2 pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location Verified ({numLat.toFixed(4)}, {numLng.toFixed(4)})</span>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenMapModal}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Adjust Pin
              </button>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  <span>Test in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {osmEmbedUrl && (
            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
              <iframe
                title="GPS Pin Location Preview"
                src={osmEmbedUrl}
                className="w-full h-full border-0 pointer-events-none"
              />
            </div>
          )}
        </div>
      )}

      {/* OPTION B: INTERACTIVE MAP PIN SELECTION MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 flex-shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interactive Map Pin Selection
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Click anywhere on the map or drag the marker to position the exact GPS pin.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 font-bold">
                  <span>{tempLat}</span>, <span>{tempLng}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
                  title="Close Map"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map iframe */}
            <div className="relative flex-1 min-h-[420px] bg-slate-950">
              <iframe
                title="Interactive Leaflet Pin Picker"
                srcDoc={mapHtmlDoc}
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Selected Coordinates:</span>
                <span className="font-mono text-emerald-400 font-bold">{tempLat}, {tempLng}</span>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPinLocation}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Save Pin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
