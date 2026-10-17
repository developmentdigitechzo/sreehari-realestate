'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  X,
  Upload,
  Sparkles
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write full article body content here...',
  minHeight = '350px'
}: RichTextEditorProps) {
  // Mode: 'visual' (Text WYSIWYG) | 'source' (Raw HTML)
  const [mode, setMode] = useState<'visual' | 'source'>('visual');
  const [sourceValue, setSourceValue] = useState(value || '');

  // Media Modal Dialog State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [altTextInput, setAltTextInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [alignment, setAlignment] = useState<'center' | 'left' | 'right' | 'full'>('center');
  const [uploading, setUploading] = useState(false);

  const visualRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sync incoming value prop to editor if not internally editing
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    setSourceValue(value || '');
    if (visualRef.current && mode === 'visual') {
      if (visualRef.current.innerHTML !== (value || '')) {
        visualRef.current.innerHTML = value || '';
      }
    }
  }, [value, mode]);

  // Handle Mode Switch
  function handleModeSwitch(newMode: 'visual' | 'source') {
    if (newMode === mode) return;
    if (newMode === 'source') {
      // Sync visual HTML into source textarea
      const currentHtml = visualRef.current ? visualRef.current.innerHTML : sourceValue;
      setSourceValue(currentHtml);
      setMode('source');
    } else {
      // Sync source textarea value into visual canvas
      setMode('visual');
      setTimeout(() => {
        if (visualRef.current) {
          visualRef.current.innerHTML = sourceValue;
        }
      }, 50);
    }
  }

  // Formatting executor using browser document.execCommand & Selection API
  function applyFormat(command: string, value: string | null = null) {
    if (mode === 'source') return;
    if (visualRef.current) {
      visualRef.current.focus();
      document.execCommand(command, false, value || undefined);
      triggerSync();
    }
  }

  function handleFormatBlockSelect(tag: string) {
    if (mode === 'source') return;
    applyFormat('formatBlock', tag ? `<${tag}>` : '<p>');
  }

  function triggerSync() {
    if (visualRef.current) {
      const html = visualRef.current.innerHTML;
      isInternalChangeRef.current = true;
      setSourceValue(html);
      onChange(html);
    }
  }

  function handleSourceChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setSourceValue(val);
    isInternalChangeRef.current = true;
    onChange(val);
  }

  // Link Insertion
  function insertLink() {
    if (mode === 'source') return;
    const url = prompt('Enter destination URL (e.g. https://sreeharirealty.com):');
    if (url && url.trim()) {
      applyFormat('createLink', url.trim());
    }
  }

  // Smart Clean Paste Handler (Strips MS Word dirty inline styles)
  function handlePaste(e: React.ClipboardEvent) {
    if (mode === 'source') return;
    e.preventDefault();

    const plainText = e.clipboardData.getData('text/plain');
    const htmlText = e.clipboardData.getData('text/html');

    if (htmlText) {
      // Clean inline styles from HTML paste
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Remove style attributes and MS Word tags
      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach((el) => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        if (el.tagName.startsWith('O:') || el.tagName.startsWith('W:')) {
          el.remove();
        }
      });

      const cleanHtml = doc.body.innerHTML;
      document.execCommand('insertHTML', false, cleanHtml);
    } else if (plainText) {
      document.execCommand('insertText', false, plainText);
    }
    triggerSync();
  }

  // Handle Local File Upload to Backend Media Storage
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia({
          imageBase64: base64,
          filename: file.name
        });

        if (res && res.success && res.fileUrl) {
          setImageUrlInput(res.fileUrl);
          setMediaTab('url');
        } else {
          alert(res.message || 'File upload failed');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Upload error: ' + err.message);
      setUploading(false);
    }
  }

  // Confirm Media Insertion into Editor Body
  function insertMediaIntoEditor() {
    if (!imageUrlInput || !imageUrlInput.trim()) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    let alignClass = 'text-center my-4';
    let imgClass = 'img-fluid rounded-xl max-w-full h-auto shadow-md';

    if (alignment === 'left') {
      alignClass = 'float-left mr-4 mb-4 max-w-xs';
    } else if (alignment === 'right') {
      alignClass = 'float-right ml-4 mb-4 max-w-xs';
    } else if (alignment === 'full') {
      imgClass = 'w-full rounded-2xl my-4 shadow-lg object-cover';
    }

    const altAttr = altTextInput ? ` alt="${altTextInput.replace(/"/g, '&quot;')}"` : ' alt="Article Media"';
    const captionHtml = captionInput
      ? `<figcaption className="text-xs text-slate-400 mt-2 italic text-center">${captionInput}</figcaption>`
      : '';

    const figureHtml = `
      <figure class="${alignClass}">
        <img src="${imageUrlInput.trim()}"${altAttr} class="${imgClass}" loading="lazy" />
        ${captionHtml}
      </figure>
    `;

    if (mode === 'visual' && visualRef.current) {
      visualRef.current.focus();
      document.execCommand('insertHTML', false, figureHtml);
      triggerSync();
    } else {
      const newSource = sourceValue + '\n' + figureHtml;
      setSourceValue(newSource);
      onChange(newSource);
    }

    // Reset Modal
    setIsMediaModalOpen(false);
    setImageUrlInput('');
    setAltTextInput('');
    setCaptionInput('');
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
      {/* Editor Toolbar Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Format & Styling Controls */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Tag Selection Dropdown */}
          <select
            onChange={(e) => handleFormatBlockSelect(e.target.value)}
            disabled={mode === 'source'}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Quote Block</option>
          </select>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Formatting Buttons */}
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            disabled={mode === 'source'}
            title="Bold (Ctrl+B)"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            disabled={mode === 'source'}
            title="Italic (Ctrl+I)"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            disabled={mode === 'source'}
            title="Underline"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => applyFormat('insertUnorderedList')}
            disabled={mode === 'source'}
            title="Bullet List"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('insertOrderedList')}
            disabled={mode === 'source'}
            title="Numbered List"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={insertLink}
            disabled={mode === 'source'}
            title="Insert Link"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Add Media Button */}
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            title="Add Media / Upload Image"
            className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Add Media
          </button>
        </div>

        {/* Dual Mode Switcher (Text WYSIWYG vs HTML Source) */}
        <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('visual')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              mode === 'visual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Text
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('source')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              mode === 'source'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> HTML
          </button>
        </div>
      </div>

      {/* Editor Body Canvas */}
      <div className="relative bg-white dark:bg-slate-950">
        {mode === 'visual' ? (
          <div
            ref={visualRef}
            contentEditable
            onInput={triggerSync}
            onBlur={triggerSync}
            onPaste={handlePaste}
            style={{ minHeight }}
            className="p-5 text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none overflow-y-auto prose dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-emerald-600 dark:prose-a:text-emerald-400"
            data-placeholder={placeholder}
          />
        ) : (
          <textarea
            value={sourceValue}
            onChange={handleSourceChange}
            style={{ minHeight }}
            className="w-full p-4 bg-slate-50 dark:bg-slate-950 text-xs font-mono leading-relaxed text-slate-900 dark:text-emerald-300 focus:outline-none border-0 resize-y"
            placeholder="Edit raw HTML code..."
          />
        )}
      </div>

      {/* MEDIA DIALOG MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Insert Media Asset</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Add responsive images or video content to article body</p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMediaTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  mediaTab === 'upload' ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/30 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  mediaTab === 'url' ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/30 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Image URL Link
              </button>
            </div>

            {mediaTab === 'upload' ? (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-950/50 space-y-2"
                >
                  <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {uploading ? 'Uploading to server...' : 'Click to select image file from computer'}
                  </p>
                  <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Image Source CDN URL</label>
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            {/* Media Metadata Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={altTextInput}
                  onChange={(e) => setAltTextInput(e.target.value)}
                  placeholder="e.g. DTCP approved plot layout plan"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Caption Text (Optional)</label>
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="e.g. Figure 1: 40ft wide internal blacktop road"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Image Alignment & Size</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlignment('center')}
                    className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      alignment === 'center'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" /> Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment('full')}
                    className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      alignment === 'full'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Full Width
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment('left')}
                    className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      alignment === 'left'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" /> Float Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment('right')}
                    className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      alignment === 'right'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" /> Float Right
                  </button>
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertMediaIntoEditor}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Insert Media
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
