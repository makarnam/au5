import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
// Use browser build of mammoth for parsing .docx in the browser
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { ComplianceService } from '../../services/compliance';
import riskService from '../../services/riskService';
import { controlService } from '../../services/controlService';

type UUID = string;

type ParseMode = 'excel' | 'docx' | 'url' | 'text';

type ParsedRequirement = {
  requirement_code: string;
  title: string;
  text: string;
  guidance?: string | null;
  include: boolean;
  linkedControlId?: string;
  linkedRiskId?: string;
};

type FrameworkOption = { id: UUID; code: string; name: string };
type ControlOption = { id: UUID; label: string };
type RiskOption = { id: UUID; label: string };

export default function Importer2() {
  const [mode, setMode] = useState<ParseMode>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  const [message, setMessage] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [requirements, setRequirements] = useState<ParsedRequirement[]>([]);

  const [frameworks, setFrameworks] = useState<FrameworkOption[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<UUID | ''>('');

  // New framework form
  const [newFw, setNewFw] = useState({ code: '', name: '', version: '', authority: '', category: '', description: '' });
  const canCreateFramework = newFw.code.trim().length > 1 && newFw.name.trim().length > 1;

  // Inline create risk modal
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [newRiskTitle, setNewRiskTitle] = useState('');
  const [creatingRisk, setCreatingRisk] = useState(false);

  // Inline create control modal
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [controlSets, setControlSets] = useState<Array<{ id: UUID; name: string }>>([]);
  const [selectedControlSetId, setSelectedControlSetId] = useState<UUID | ''>('');
  const [newControl, setNewControl] = useState({ code: '', title: '', description: '' });
  const [creatingControl, setCreatingControl] = useState(false);

  // Lazy-load mammoth browser build only when needed to avoid bundler resolution issues
  const loadMammoth = useCallback(async () => {
    if ((window as any).mammoth) return;
    const scriptId = 'mammoth-browser-cdn';
    if (document.getElementById(scriptId)) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://unpkg.com/mammoth@1.7.2/mammoth.browser.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load mammoth'));
      document.body.appendChild(s);
    });
  }, []);

  useEffect(() => {
    const loadFw = async () => {
      const { data } = await ComplianceService.listFrameworks();
      setFrameworks((data || []).map((f: any) => ({ id: f.id, code: f.code, name: f.name })));
    };
    loadFw();
  }, []);

  const fetchControlSets = useCallback(async () => {
    const { data, error } = await supabase.from('control_sets').select('id,name').eq('is_deleted', false).order('created_at', { ascending: false });
    if (!error) setControlSets((data || []) as any);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const name = f.name.toLowerCase();
      const type = f.type.toLowerCase();
      if (name.endsWith('.xlsx') || name.endsWith('.xls') || type.includes('sheet')) setMode('excel');
      else if (name.endsWith('.docx') || type.includes('word')) setMode('docx');
    }
    setRequirements([]);
    setMessage('');
  };

  const parseExcel = async (f: File) => {
    const arrayBuffer = await f.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = wb.SheetNames.find((n: string) => n.toLowerCase().includes('require')) || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) return [] as ParsedRequirement[];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
    const out: ParsedRequirement[] = [];
    for (const r of rows) {
      const code = r.requirement_code || r.code || r.req_code || '';
      const title = r.title || '';
      const text = r.text || r.requirement_text || '';
      if (!title && !text) continue;
      out.push({
        requirement_code: (code || `REQ-${String(out.length + 1).padStart(3, '0')}`).toString(),
        title: (title || text.slice(0, 120)).toString(),
        text: text.toString(),
        guidance: r.guidance || null,
        include: true,
      });
    }
    return out;
  };

  const extractTextFromDocx = async (f: File): Promise<string> => {
    const arrayBuffer = await f.arrayBuffer();
    await loadMammoth();
    const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
    return (result.value || '').replace(/\u00A0/g, ' ').trim();
  };

  const fetchUrlWithFallbacks = async (url: string): Promise<{ html?: string; text?: string; titleGuess?: string }> => {
    const normalize = (u: string) => (u.startsWith('http') ? u : `https://${u}`);
    const u = normalize(url.trim());
    const tryDirect = async () => {
      try {
        const res = await fetch(u, { mode: 'cors' });
        if (res.ok) {
          const html = await res.text();
          const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          return { html, text: undefined, titleGuess: m ? m[1].trim() : '' } as const;
        }
      } catch {}
      return null;
    };
    const tryReaderProxy = async () => {
      try {
        const fallback = u.startsWith('http') ? `https://r.jina.ai/http://${u.replace(/^https?:\/\//, '')}` : `https://r.jina.ai/http://${u}`;
        const res2 = await fetch(fallback, { mode: 'cors' });
        if (res2.ok) {
          const text = await res2.text();
          const firstLine = (text.split('\n').map((s) => s.trim()).find((s) => s.length > 0) || '').slice(0, 120);
          return { html: undefined, text, titleGuess: firstLine } as const;
        }
      } catch {}
      return null;
    };
    return (await tryReaderProxy()) || (await tryDirect()) || Promise.reject(new Error('Unable to fetch URL'));
  };

  const segmentArticles = (content: { html?: string; text?: string }) => {
    let textContent = content.text;
    if (!textContent && content.html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content.html, 'text/html');
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
        const blocks: string[] = [];
        while (walker.nextNode()) {
          const el = walker.currentNode as HTMLElement;
          if (['P', 'DIV', 'H1', 'H2', 'H3', 'LI', 'ARTICLE', 'SECTION'].includes(el.tagName)) {
            const t = el.innerText.trim();
            if (t) blocks.push(t);
          }
        }
        textContent = blocks.join('\n');
      } catch {
        textContent = undefined;
      }
    }
    const clean = (textContent || '').replace(/\u00A0/g, ' ').replace(/[\t ]+/g, ' ');
    const segments: Array<{ code: string; body: string }> = [];
    // Split by common article markers or numbered headings
    const regex = /(MADDE\s+\d+\s*[–—-])|(Article\s+\d+\s*[-:.])|(\n\s*\d+[\.)]\s+)/gi;
    const indices: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(clean)) !== null) indices.push(m.index);
    if (indices.length === 0) {
      const lines = clean.split('\n');
      let current: string[] = [];
      let currentCode = '';
      for (const line of lines) {
        const hit = line.match(/^(\d+)[\.)\-]\s+/);
        if (hit) {
          if (current.length) segments.push({ code: currentCode || `SEC-${segments.length + 1}`, body: current.join(' ') });
          current = [line];
          currentCode = `SEC-${hit[1]}`;
        } else if (line.trim()) current.push(line.trim());
      }
      if (current.length) segments.push({ code: currentCode || `SEC-${segments.length + 1}`, body: current.join(' ') });
    } else {
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i];
        const end = i + 1 < indices.length ? indices[i + 1] : clean.length;
        const chunk = clean.slice(start, end).trim();
        const codeMatch = chunk.match(/(MADDE|Article)\s+(\d+)/i);
        const code = codeMatch ? `${codeMatch[1].toUpperCase()} ${codeMatch[2]}` : `SEC-${i + 1}`;
        segments.push({ code, body: chunk });
      }
    }
    return segments.map((seg, idx) => {
      const firstSentence = (seg.body.split(/[.!?]/)[0] || '').trim();
      const title = `${seg.code}: ${firstSentence}`.slice(0, 140) || seg.code;
      return {
        requirement_code: seg.code || `SEC-${idx + 1}`,
        title,
        text: seg.body,
        guidance: null,
        include: true,
      } as ParsedRequirement;
    });
  };

  const onParse = async () => {
    try {
      setParsing(true);
      setMessage('Parsing...');
      let parsed: ParsedRequirement[] = [];
      if (mode === 'excel') {
        if (!file) throw new Error('Select an Excel file');
        parsed = await parseExcel(file);
      } else if (mode === 'docx') {
        if (!file) throw new Error('Select a Word (.docx) file');
        const text = await extractTextFromDocx(file);
        parsed = segmentArticles({ text });
      } else if (mode === 'url') {
        if (!urlInput || urlInput.trim().length < 8) throw new Error('Enter a valid URL');
        const fetched = await fetchUrlWithFallbacks(urlInput);
        parsed = segmentArticles(fetched);
      } else {
        if (!textInput || textInput.trim().length < 20) throw new Error('Paste at least 20 characters');
        const htmlLike = /<\w+[^>]*>/.test(textInput);
        parsed = segmentArticles(htmlLike ? { html: textInput } : { text: textInput });
      }
      setRequirements(parsed);
      setMessage(`Parsed ${parsed.length} article(s).`);
    } catch (e: any) {
      setMessage(e?.message || 'Parse failed');
      setRequirements([]);
    } finally {
      setParsing(false);
    }
  };

  const includedRequirements = useMemo(() => requirements.filter((r) => r.include), [requirements]);

  const searchControls = useCallback(async (q: string): Promise<ControlOption[]> => {
    if (!q || q.length < 2) return [];
    const { data, error } = await supabase
      .from('controls')
      .select('id, title, control_code')
      .ilike('title', `%${q}%`)
      .eq('is_deleted', false)
      .limit(20);
    if (error) return [];
    return (data || []).map((c: any) => ({ id: c.id, label: `${c.control_code ? c.control_code + ' · ' : ''}${c.title}` }));
  }, []);

  const searchRisks = useCallback(async (q: string): Promise<RiskOption[]> => {
    if (!q || q.length < 2) return [];
    const { data, error } = await supabase
      .from('risks')
      .select('id, title')
      .ilike('title', `%${q}%`)
      .limit(20);
    if (error) return [];
    return (data || []).map((r: any) => ({ id: r.id, label: r.title }));
  }, []);

  const createFramework = async () => {
    const { data, error } = await ComplianceService.createFramework({
      code: newFw.code.trim(),
      name: newFw.name.trim(),
      version: newFw.version || null,
      authority: newFw.authority || null,
      category: newFw.category || null,
      description: newFw.description || null,
      is_active: true,
    } as any);
    if (error) {
      setMessage(error.message);
      return;
    }
    const row: any = data;
    setFrameworks((prev) => [{ id: row.id, code: row.code, name: row.name }, ...prev]);
    setSelectedFrameworkId(row.id);
    setNewFw({ code: '', name: '', version: '', authority: '', category: '', description: '' });
  };

  const onCommit = async () => {
    try {
      if (!selectedFrameworkId) throw new Error('Select a framework first');
      if (includedRequirements.length === 0) throw new Error('Nothing to save');
      setMessage('Saving requirements...');

      const requirementIdByCode: Record<string, string> = {};
      for (const r of includedRequirements) {
        const upsert = await supabase
          .from('compliance_requirements')
          .upsert({
            framework_id: selectedFrameworkId,
            requirement_code: r.requirement_code,
            title: r.title,
            text: r.text,
            guidance: r.guidance ?? null,
            is_active: true,
          }, { onConflict: 'framework_id,requirement_code' })
          .select()
          .single();
        if (upsert.error) throw upsert.error;
        requirementIdByCode[r.requirement_code] = upsert.data.id as string;
      }

      // Create mappings
      const mappingJobs: Promise<any>[] = [];
      for (const r of includedRequirements) {
        const reqId = requirementIdByCode[r.requirement_code];
        if (!reqId) continue;
        if (r.linkedControlId) mappingJobs.push(ComplianceService.mapControl(reqId, r.linkedControlId));
        if (r.linkedRiskId) mappingJobs.push(ComplianceService.mapRisk(reqId, r.linkedRiskId));
      }
      if (mappingJobs.length) await Promise.allSettled(mappingJobs);

      setMessage('Saved successfully.');
    } catch (e: any) {
      setMessage(e?.message || 'Save failed');
    }
  };

  const submitCreateRisk = async () => {
    if (!newRiskTitle.trim()) return;
    setCreatingRisk(true);
    try {
      const id = await riskService.createRisk({
        title: newRiskTitle.trim(),
        category: 'General',
        risk_level: 'medium',
        status: 'identified',
      } as any);
      // Attach to the first selected row without a risk
      setRequirements((prev) => {
        const idx = prev.findIndex((r) => r.include && !r.linkedRiskId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], linkedRiskId: id };
          return copy;
        }
        return prev;
      });
      setNewRiskTitle('');
      setRiskModalOpen(false);
      setMessage('Risk created');
    } catch (e: any) {
      setMessage(e?.message || 'Create risk failed');
    } finally {
      setCreatingRisk(false);
    }
  };

  const submitCreateControl = async () => {
    if (!selectedControlSetId || !newControl.title.trim() || !newControl.code.trim()) return;
    setCreatingControl(true);
    try {
      const ctl = await controlService.createControl(selectedControlSetId, {
        control_code: newControl.code.trim(),
        title: newControl.title.trim(),
        description: newControl.description || '',
        control_type: 'preventive' as any,
        frequency: 'annually' as any,
        process_area: 'General',
        testing_procedure: 'TBD',
        evidence_requirements: 'TBD',
        is_automated: false,
      } as any);
      setRequirements((prev) => {
        const idx = prev.findIndex((r) => r.include && !r.linkedControlId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], linkedControlId: ctl.id } as any;
          return copy;
        }
        return prev;
      });
      setSelectedControlSetId('');
      setNewControl({ code: '', title: '', description: '' });
      setControlModalOpen(false);
      setMessage('Control created');
    } catch (e: any) {
      setMessage(e?.message || 'Create control failed');
    } finally {
      setCreatingControl(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Compliance Importer 2</h1>
        <div className="text-sm text-gray-500">Excel · Word (.docx) · Web URL · HTML/Text</div>
      </div>

      {/* Step 1: Source */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode==='excel'} onChange={() => setMode('excel')} /> Excel</label>
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode==='docx'} onChange={() => setMode('docx')} /> Word (.docx)</label>
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode==='url'} onChange={() => setMode('url')} /> URL</label>
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode==='text'} onChange={() => setMode('text')} /> Text / HTML</label>
        </div>

        {mode === 'excel' || mode === 'docx' ? (
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept={mode==='excel' ? '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' : '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
              onChange={onFileChange}
              className="border p-2 rounded"
            />
            <Button onClick={onParse} disabled={!file || parsing}>{parsing ? 'Parsing…' : 'Parse'}</Button>
          </div>
        ) : mode === 'url' ? (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="https://example.com/law/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="border p-2 rounded w-[36rem] max-w-full"
            />
            <Button onClick={onParse} disabled={!urlInput || urlInput.length < 8 || parsing}>{parsing ? 'Parsing…' : 'Fetch & Parse'}</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              placeholder="Paste page text or HTML here"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="border p-2 rounded w-full min-h-[180px] font-mono"
            />
            <Button onClick={onParse} disabled={!textInput || textInput.trim().length < 20 || parsing}>{parsing ? 'Parsing…' : 'Parse Text'}</Button>
          </div>
        )}

        {message ? <div className={`text-sm ${requirements.length ? 'text-gray-700' : 'text-red-600'}`}>{message}</div> : null}
      </div>

      {/* Step 2: Framework selection / creation */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="font-medium">Framework</div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="border rounded p-2 min-w-64"
            value={selectedFrameworkId}
            onChange={(e) => setSelectedFrameworkId(e.target.value as UUID)}
          >
            <option value="">— Select existing framework —</option>
            {frameworks.map((f) => (
              <option key={f.id} value={f.id}>{f.code} · {f.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">or</span>
          <input placeholder="Code" className="border p-2 rounded w-36" value={newFw.code} onChange={(e) => setNewFw({ ...newFw, code: e.target.value })} />
          <input placeholder="Name" className="border p-2 rounded w-72" value={newFw.name} onChange={(e) => setNewFw({ ...newFw, name: e.target.value })} />
          <input placeholder="Version" className="border p-2 rounded w-32" value={newFw.version} onChange={(e) => setNewFw({ ...newFw, version: e.target.value })} />
          <Button onClick={createFramework} disabled={!canCreateFramework}>Create</Button>
        </div>
      </div>

      {/* Step 3: Review & link */}
      {requirements.length > 0 && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Detected Requirements</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRiskModalOpen(true)}>+ New Risk</Button>
              <Button variant="outline" onClick={async () => { await fetchControlSets(); setControlModalOpen(true); }}>+ New Control</Button>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Use</th>
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Text</th>
                  <th className="py-2 pr-3">Control</th>
                  <th className="py-2 pr-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((r, idx) => (
                  <tr key={idx} className="border-b align-top">
                    <td className="py-2 pr-3">
                      <input type="checkbox" checked={r.include} onChange={(e) => setRequirements((prev) => prev.map((x, i) => i===idx ? { ...x, include: e.target.checked } : x))} />
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <input
                        className="border rounded p-1 w-36"
                        value={r.requirement_code}
                        onChange={(e) => setRequirements((prev) => prev.map((x, i) => i===idx ? { ...x, requirement_code: e.target.value } : x))}
                      />
                    </td>
                    <td className="py-2 pr-3 min-w-[16rem]">
                      <input
                        className="border rounded p-1 w-full"
                        value={r.title}
                        onChange={(e) => setRequirements((prev) => prev.map((x, i) => i===idx ? { ...x, title: e.target.value } : x))}
                      />
                    </td>
                    <td className="py-2 pr-3 max-w-[42rem]">
                      <div className="max-h-32 overflow-auto whitespace-pre-wrap opacity-80 border rounded p-2">
                        {r.text}
                      </div>
                    </td>
                    <td className="py-2 pr-3 min-w-[18rem]">
                      <ControlSearch
                        value={r.linkedControlId || ''}
                        onSearch={searchControls}
                        onChange={(id) => setRequirements((prev) => prev.map((x, i) => i===idx ? { ...x, linkedControlId: id || undefined } : x))}
                      />
                    </td>
                    <td className="py-2 pr-3 min-w-[18rem]">
                      <RiskSearch
                        value={r.linkedRiskId || ''}
                        onSearch={searchRisks}
                        onChange={(id) => setRequirements((prev) => prev.map((x, i) => i===idx ? { ...x, linkedRiskId: id || undefined } : x))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Selected: {includedRequirements.length} / {requirements.length}</div>
            <Button onClick={onCommit} disabled={!selectedFrameworkId || includedRequirements.length === 0}>Save to Supabase</Button>
          </div>
        </div>
      )}

      {/* Create Risk modal */}
      {riskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-[520px] p-4 space-y-3">
            <div className="text-lg font-medium">Create Risk</div>
            <input
              className="border p-2 rounded w-full"
              placeholder="Risk title"
              value={newRiskTitle}
              onChange={(e) => setNewRiskTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRiskModalOpen(false)}>Cancel</Button>
              <Button onClick={submitCreateRisk} disabled={!newRiskTitle.trim() || creatingRisk}>{creatingRisk ? 'Creating…' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Control modal */}
      {controlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-[640px] p-4 space-y-3">
            <div className="text-lg font-medium">Create Control</div>
            <div className="flex flex-col gap-3">
              <select className="border p-2 rounded" value={selectedControlSetId} onChange={(e) => setSelectedControlSetId(e.target.value as UUID)}>
                <option value="">— Select Control Set —</option>
                {controlSets.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input className="border p-2 rounded w-40" placeholder="Code" value={newControl.code} onChange={(e) => setNewControl({ ...newControl, code: e.target.value })} />
                <input className="border p-2 rounded flex-1" placeholder="Title" value={newControl.title} onChange={(e) => setNewControl({ ...newControl, title: e.target.value })} />
              </div>
              <textarea className="border p-2 rounded w-full min-h-[120px]" placeholder="Description" value={newControl.description} onChange={(e) => setNewControl({ ...newControl, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setControlModalOpen(false)}>Cancel</Button>
              <Button onClick={submitCreateControl} disabled={!selectedControlSetId || !newControl.code.trim() || !newControl.title.trim() || creatingControl}>{creatingControl ? 'Creating…' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlSearch({ value, onChange, onSearch }: { value: string; onChange: (id: string | '') => void; onSearch: (q: string) => Promise<ControlOption[]> }) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<ControlOption[]>([]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (q.length < 2) { setOpts([]); return; }
      const res = await onSearch(q);
      if (!cancelled) setOpts(res);
    };
    run();
    return () => { cancelled = true; };
  }, [q, onSearch]);
  return (
    <div className="space-y-1">
      <input className="border p-1 rounded w-full" placeholder="Search controls…" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="border rounded p-1 w-full" value={value} onChange={(e) => onChange(e.target.value as any)}>
        <option value="">— none —</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

function RiskSearch({ value, onChange, onSearch }: { value: string; onChange: (id: string | '') => void; onSearch: (q: string) => Promise<RiskOption[]> }) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<RiskOption[]>([]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (q.length < 2) { setOpts([]); return; }
      const res = await onSearch(q);
      if (!cancelled) setOpts(res);
    };
    run();
    return () => { cancelled = true; };
  }, [q, onSearch]);
  return (
    <div className="space-y-1">
      <input className="border p-1 rounded w-full" placeholder="Search risks…" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="border rounded p-1 w-full" value={value} onChange={(e) => onChange(e.target.value as any)}>
        <option value="">— none —</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}


