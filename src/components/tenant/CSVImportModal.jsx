import React, { useState } from 'react';
import { UploadCloud, FileText, ArrowRight, CheckCircle2, AlertCircle, Database, Phone, Mail, User, Sparkles, RefreshCw } from 'lucide-react';
import { sanitizePhoneE164, sanitizeCsvContacts, buildPostgresBatchInsertQuery } from '../../utils/csvImportPipeline';
import { useTenantStore } from '../../store/useTenantStore';

const SAMPLE_DEMO_CSV = `First Name,Last Name,Phone Number,Email Address
Arthur,Pendelton,(555) 912-3456,arthur.p@example.com
Claire,Dunphy,555.789.0123,claire.d@example.com
Victor,Frankenstein,15554321098,victor.f@example.com
Nora,Helmer,5556543210,nora.h@example.com
Gavin,Belson,555-888-9900,gavin.b@example.com`;

export function CSVImportModal({ isOpen, onClose }) {
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const tenants = useTenantStore((state) => state.tenants);
  const bulkImportContacts = useTenantStore((state) => state.bulkImportContacts);

  const activeTenant = tenants.find((t) => t.id === activeTenantId);

  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns, 3: Review & Batch Insert
  const [csvRawText, setCsvRawText] = useState('');
  const [headers, setHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Column mapping state
  const [mapping, setMapping] = useState({
    firstNameKey: '',
    lastNameKey: '',
    phoneKey: '',
    emailKey: ''
  });

  const parseCsvText = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    const firstLine = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    setHeaders(firstLine);

    // Auto-detect columns
    const fnKey = firstLine.find(h => /first|name/i.test(h)) || firstLine[0] || '';
    const lnKey = firstLine.find(h => /last/i.test(h)) || firstLine[1] || '';
    const phoneKey = firstLine.find(h => /phone|mobile|cell/i.test(h)) || firstLine[2] || '';
    const emailKey = firstLine.find(h => /email|mail/i.test(h)) || firstLine[3] || '';

    setMapping({
      firstNameKey: fnKey,
      lastNameKey: lnKey,
      phoneKey: phoneKey,
      emailKey: emailKey
    });

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const rowObj = {};
      firstLine.forEach((header, idx) => {
        rowObj[header] = values[idx] || '';
      });
      rows.push(rowObj);
    }

    setCsvRawText(text);
    setParsedRows(rows);
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      parseCsvText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleLoadDemoCSV = () => {
    parseCsvText(SAMPLE_DEMO_CSV);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        parseCsvText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  const sanitizedPreviewList = sanitizeCsvContacts(parsedRows, mapping, activeTenantId);
  const sqlBatchBatchPayload = buildPostgresBatchInsertQuery(sanitizedPreviewList, activeTenantId);

  const handleConfirmImport = () => {
    bulkImportContacts(sanitizedPreviewList);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#090d16] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>CSV Contact Import & Reactivation Engine</span>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  PostgreSQL UNNEST Batch
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Targeting tenant: <strong className="text-cyan-300 font-mono">{activeTenant?.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-3 font-mono">
          <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
            <span>Select CSV</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">2</span>
            <span>Map Columns</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">3</span>
            <span>E.164 Preview & Batch Ingest</span>
          </div>
        </div>

        {/* Step 1: Upload Zone */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <FileText className="w-10 h-10 text-cyan-400 mx-auto mb-3 opacity-80" />
              <h4 className="text-sm font-bold text-white">Drag & drop your CSV file here</h4>
              <p className="text-xs text-slate-400 mt-1">Supports standard CSV files containing old customer lists</p>

              <label className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors border border-slate-700">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Browse Local Computer</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Want to test immediately with sample reactivation data?</span>
              </div>
              <button
                onClick={handleLoadDemoCSV}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 transition-colors"
              >
                Load Sample Demo CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapper */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Map CSV Headers to Database Fields</h4>
              <p className="text-xs text-slate-400">Select which CSV column maps to each PostgreSQL field:</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">First Name</label>
                  <select
                    value={mapping.firstNameKey}
                    onChange={(e) => setMapping({ ...mapping, firstNameKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:border-cyan-500"
                  >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Last Name</label>
                  <select
                    value={mapping.lastNameKey}
                    onChange={(e) => setMapping({ ...mapping, lastNameKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:border-cyan-500"
                  >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-cyan-400 font-semibold">Phone Number (E.164 Sanitized)</label>
                  <select
                    value={mapping.phoneKey}
                    onChange={(e) => setMapping({ ...mapping, phoneKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-cyan-300 font-semibold rounded-xl px-3 py-2 focus:border-cyan-500"
                  >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email Address</label>
                  <select
                    value={mapping.emailKey}
                    onChange={(e) => setMapping({ ...mapping, emailKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:border-cyan-500"
                  >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20"
              >
                Proceed to E.164 Preview & SQL Inspection
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Batch Ingest */}
        {step === 3 && (
          <div className="space-y-4">
            
            {/* Sanitized Preview Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider">
                  Sanitized E.164 Import Preview ({sanitizedPreviewList.length} Rows)
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  All rows forced to tenant_id: {activeTenantId} | status: 'lead' | source: 'csv_import'
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Raw Phone → E.164 Standard</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Tag Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {sanitizedPreviewList.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-200 font-sans font-bold">{c.first_name} {c.last_name}</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">{c.phone}</td>
                        <td className="py-2 px-3 text-slate-400">{c.email}</td>
                        <td className="py-2 px-3 text-cyan-400">csv_import</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PostgreSQL UNNEST Query Inspection Box */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> High-Performance PostgreSQL UNNEST Batch Insert
                </span>
                <span className="text-slate-500 font-mono text-[10px]">1 Query Roundtrip</span>
              </div>
              <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg overflow-x-auto leading-relaxed border border-slate-800/80">
{sqlBatchBatchPayload.queryText.trim()}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95"
              >
                Execute Bulk Ingestion ({sanitizedPreviewList.length} Contacts)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
