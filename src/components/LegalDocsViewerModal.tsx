import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  ShieldAlert,
  Globe,
  Search,
  CheckCircle,
  ExternalLink,
  Edit,
  Save,
  Flag,
  List,
  Send,
  AlertCircle,
} from 'lucide-react';
import { LegalDocument, Language, UserRole } from '../types';
import { NyumbaGoService } from '../lib/supabase';

interface LegalDocsViewerModalProps {
  initialDocId?: string;
  onClose: () => void;
  lang: Language;
  currentRole: UserRole;
}

export const LegalDocsViewerModal: React.FC<LegalDocsViewerModalProps> = ({
  initialDocId = 'terms-of-service',
  onClose,
  lang,
  currentRole,
}) => {
  const [documents, setDocuments] = useState<LegalDocument[]>(
    NyumbaGoService.getLegalDocuments()
  );
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin In-Line Editing Mode (Draft pending legal review)
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editSummaryEn, setEditSummaryEn] = useState('');
  const [editSummarySw, setEditSummarySw] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [editRequiresReconsent, setEditRequiresReconsent] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Copyright Takedown Form State
  const [takedownWork, setTakedownWork] = useState('');
  const [takedownUrl, setTakedownUrl] = useState('');
  const [takedownContact, setTakedownContact] = useState('');
  const [takedownStatement, setTakedownStatement] = useState(false);
  const [takedownSubmitted, setTakedownSubmitted] = useState(false);
  const [takedownActiveTab, setTakedownActiveTab] = useState<'notice' | 'counter'>('notice');

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract Table of Contents from markdown headings
  const tableOfContents = useMemo(() => {
    const lines = currentDoc.content.split('\n');
    const headings: { id: string; title: string; level: number }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const title = match[2].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ id, title, level });
      }
    });
    return headings;
  }, [currentDoc]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditContent(currentDoc.content);
    setEditSummaryEn(currentDoc.summary_en);
    setEditSummarySw(currentDoc.summary_sw);
    setEditVersion(currentDoc.version);
    setEditRequiresReconsent(currentDoc.requires_reconsent);
  };

  const handleSaveEdits = () => {
    const allDocs = NyumbaGoService.getLegalDocuments();
    const doc = allDocs.find((d) => d.id === currentDoc.id);
    if (doc) {
      doc.content = editContent;
      doc.summary_en = editSummaryEn;
      doc.summary_sw = editSummarySw;
      doc.version = editVersion.trim() || doc.version;
      doc.requires_reconsent = editRequiresReconsent;
      doc.updated_at = new Date().toISOString();
      localStorage.setItem('nyumbago_legal_documents_v1', JSON.stringify(allDocs));
      setDocuments(allDocs);

      NyumbaGoService.logAdminAction({
        adminId: 'admin-demo',
        action: 'update_legal_doc',
        target: doc.id,
        reason: `Updated document content and summary (Version ${doc.version}).`,
      });

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `${currentDoc.title} (Version ${currentDoc.version})\nEffective Date: ${currentDoc.effective_date}\n\nSUMMARY (ENGLISH):\n${currentDoc.summary_en}\n\nMUHTASARI (SWAHILI):\n${currentDoc.summary_sw}\n\n---\n\n${currentDoc.content}`;
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NyumbaGO_${currentDoc.id}_v${currentDoc.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitTakedown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!takedownStatement) return;

    NyumbaGoService.createReport(
      'rights_holder',
      'listing',
      takedownUrl || 'unspecified_url',
      'other',
      `[Copyright Takedown Notice (${takedownActiveTab})] Work Claimed: ${takedownWork}. Contact: ${takedownContact}`
    );

    setTakedownSubmitted(true);
    setTimeout(() => {
      setTakedownSubmitted(false);
      setTakedownWork('');
      setTakedownUrl('');
    }, 4000);
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-slate-100 flex flex-col md:flex-row max-h-[92vh] overflow-hidden">
        {/* Left Sidebar: Document List & Table of Contents */}
        <div className="w-full md:w-80 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Legal & Policies
              </span>
            </div>
            <span className="text-[10px] text-slate-400">14 Documents</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Document list */}
          <div className="overflow-y-auto flex-1 space-y-1 pr-1 max-h-40 md:max-h-72 border-b border-slate-800/80 pb-3">
            {filteredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setIsEditing(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                  selectedDocId === doc.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="truncate pr-2">{doc.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">v{doc.version}</span>
              </button>
            ))}
          </div>

          {/* Table of Contents for Current Document (Part 10 Requirement) */}
          <div className="hidden md:block flex-1 overflow-y-auto space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <List className="w-3.5 h-3.5 text-cyan-400" />
              Table of Contents
            </span>
            <div className="space-y-1 pl-1">
              {tableOfContents.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left text-[11px] truncate text-slate-400 hover:text-cyan-300 hover:underline transition ${
                    item.level === 3 ? 'pl-2 text-slate-500' : 'font-medium'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Top Document Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 backdrop-blur">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {currentDoc.title}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                  Version {currentDoc.version}
                </span>

                {/* CRITICAL COMPLIANCE REQUIREMENT:
                    "mark every page 'Draft pending legal review' in the admin only
                    (never show that label to the public once I approve)" */}
                {currentRole === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    Draft pending legal review (Admin Only Notice)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Effective Date: {currentDoc.effective_date} · Governing Law: Laws of the Republic of Kenya
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Admin Edit Mode Trigger */}
              {currentRole === 'admin' && !isEditing && (
                <button
                  onClick={handleStartEditing}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Draft</span>
                </button>
              )}

              {isEditing && (
                <button
                  onClick={handleSaveEdits}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Publish</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition flex items-center gap-1"
                title="Print document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                onClick={handleDownloadText}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition flex items-center gap-1"
                title="Download Markdown/Text"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {savedNotice && (
            <div className="p-3 bg-emerald-950 border-b border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Document content updated in the database and audit logged!</span>
            </div>
          )}

          {/* Scrollable Document Text */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
            {/* Admin Live Editor View */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-950/40 border border-amber-700 rounded-2xl text-xs text-amber-300 space-y-1">
                  <strong>Admin Legal Content Editor:</strong>
                  <p>You can adjust the content, update the bracketed entity placeholders, and bump the version number.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Version Number</label>
                    <input
                      type="text"
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={editRequiresReconsent}
                        onChange={(e) => setEditRequiresReconsent(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                      />
                      <span>Require User Re-acceptance on Next Login</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Plain Language Summary (English)</label>
                  <textarea
                    rows={3}
                    value={editSummaryEn}
                    onChange={(e) => setEditSummaryEn(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Muhtasari wa Lugha Rahisi (Kiswahili)</label>
                  <textarea
                    rows={3}
                    value={editSummarySw}
                    onChange={(e) => setEditSummarySw(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Full Policy Markdown Content</label>
                  <textarea
                    rows={12}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>
            ) : (
              /* Normal Reader View */
              <>
                {/* Top Plain Language Summary Cards (English & Swahili) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Plain Language Summary (English)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentDoc.summary_en}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Muhtasari wa Lugha Rahisi (Kiswahili)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentDoc.summary_sw}
                    </p>
                  </div>
                </div>

                {/* Rendered Document Text with ID anchors for smooth TOC scrolling */}
                <div className="border-t border-slate-800/80 pt-4 space-y-4">
                  {currentDoc.content.split('\n\n').map((paragraph, pIdx) => {
                    const headingMatch = paragraph.match(/^(#{2,3})\s+(.*)$/);
                    if (headingMatch) {
                      const title = headingMatch[2].trim();
                      const anchorId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <h4
                          key={pIdx}
                          id={anchorId}
                          className="text-base font-extrabold text-white mt-6 mb-2 border-b border-slate-800 pb-1 scroll-mt-6"
                        >
                          {title}
                        </h4>
                      );
                    }
                    return (
                      <p key={pIdx} className="leading-relaxed text-slate-300">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* ========================================================================= */}
                {/* PART 1 ITEM 10: IN-PAGE COPYRIGHT TAKEDOWN & COUNTER-NOTICE FORM */}
                {/* ========================================================================= */}
                {currentDoc.id === 'copyright-takedown' && (
                  <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Flag className="w-4 h-4 text-cyan-400" />
                        Online Copyright Takedown & Counter-Notice Portal
                      </h4>
                      <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                        <button
                          onClick={() => setTakedownActiveTab('notice')}
                          className={`px-3 py-1 rounded-lg transition ${
                            takedownActiveTab === 'notice'
                              ? 'bg-cyan-600 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          Takedown Notice
                        </button>
                        <button
                          onClick={() => setTakedownActiveTab('counter')}
                          className={`px-3 py-1 rounded-lg transition ${
                            takedownActiveTab === 'counter'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          Counter-Notice
                        </button>
                      </div>
                    </div>

                    {takedownSubmitted ? (
                      <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs">
                        Thank you. Your copyright {takedownActiveTab} has been logged in our Trust & Safety queue. We will investigate within 24 hours.
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitTakedown} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                        <p className="text-slate-400 text-[11px]">
                          Submit this webform to report unauthorized property photographs, floorplans, or Viewora 360° virtual tours.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-300 block mb-1">Work Claimed to be Infringed</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 360 Virtual Tour photos of Kilimani villa"
                              value={takedownWork}
                              onChange={(e) => setTakedownWork(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 block mb-1">NyumbaGO Listing URL / ID</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. listing-nbo-01 or full link"
                              value={takedownUrl}
                              onChange={(e) => setTakedownUrl(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1">Your Legal Name & Contact Details</label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name, Phone number, Email address"
                            value={takedownContact}
                            onChange={(e) => setTakedownContact(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          />
                        </div>

                        <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            required
                            checked={takedownStatement}
                            onChange={(e) => setTakedownStatement(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                          />
                          <span className="text-[11px] text-slate-300">
                            I declare under penalty of perjury under the Copyright Act of Kenya that I am the copyright owner or authorized to act on behalf of the owner.
                          </span>
                        </label>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs transition"
                        >
                          Submit {takedownActiveTab === 'notice' ? 'Takedown Notice' : 'Counter-Notice'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Placeholders note */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-500 font-mono">
              Note for Legal Counsel: Square brackets such as [LEGAL ENTITY NAME], [REGISTERED ADDRESS], [SUPPORT EMAIL], [PHONE], and [ODPC REGISTRATION NUMBER] represent configuration placeholders.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
