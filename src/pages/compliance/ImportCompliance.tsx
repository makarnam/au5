import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { ComplianceService } from '../../services/compliance';

type FrameworkRow = {
  code: string;
  name: string;
  version?: string | null;
  authority?: string | null;
  category?: string | null;
  description?: string | null;
};

type RequirementRow = {
  framework_code?: string; // optional when framework_id is provided in JSON mode
  framework_id?: string;   // used in JSON mode or when mapping by id
  section_code?: string | null;
  requirement_code: string;
  title: string;
  text: string;
  guidance?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'critical' | string | null;
  is_active?: boolean;
};

type JsonImportSchema = {
  framework: FrameworkRow;
  requirements: RequirementRow[];
  sections?: { code?: string | null; title: string; description?: string | null }[];
};

type ParseMode = 'csv' | 'excel' | 'json' | 'url' | 'text';
type ImportPhase = 'idle' | 'parsed' | 'valid' | 'committing' | 'done' | 'error';

type PreviewRow<T> = {
  ok: boolean;
  error?: string;
  data?: T;
};

const requiredReqColumns = ['requirement_code', 'title', 'text'];

export default function ImportCompliance() {
  const [mode, setMode] = useState<ParseMode>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [fwCodeInput, setFwCodeInput] = useState<string>('');
  const [fwNameInput, setFwNameInput] = useState<string>('');

  const [frameworkPreview, setFrameworkPreview] = useState<PreviewRow<FrameworkRow>[]>([]);
  const [requirementsPreview, setRequirementsPreview] = useState<PreviewRow<RequirementRow>[]>([]);

  const [phase, setPhase] = useState<ImportPhase>('idle');
  const [message, setMessage] = useState<string>('');
  const [rowErrors, setRowErrors] = useState<string[]>([]);

  // For optional post-import linking
  const [controls, setControls] = useState<{ id: string; name: string; code?: string | null }[]>([]);
  const [risks, setRisks] = useState<{ id: string; title: string }[]>([]);
  const [linkControlByReqCode, setLinkControlByReqCode] = useState<Record<string, string>>({});
  const [linkRiskByReqCode, setLinkRiskByReqCode] = useState<Record<string, string>>({});

  useEffect(() => {
    // Preload a small list of controls and risks for linking; ignore errors silently
    const load = async () => {
      try {
        const { data: ctrl } = await supabase.from('controls').select('id,name,code').order('name', { ascending: true });
        setControls(ctrl || []);
      } catch {}
      try {
        const { data: r } = await supabase.from('risks').select('id,title').order('title', { ascending: true });
        setRisks(r || []);
      } catch {}
    };
    load();
  }, []);

  const reset = () => {
    setFrameworkPreview([]);
    setRequirementsPreview([]);
    setPhase('idle');
    setMessage('');
    setRowErrors([]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    reset();

    // auto-switch mode by MIME/extension to reduce user error
    if (f) {
      const name = f.name.toLowerCase();
      const type = f.type.toLowerCase();
      if (name.endsWith('.json') || type.includes('json')) {
        setMode('json');
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || type.includes('sheet') || type.includes('excel')) {
        setMode('excel');
      } else if (name.endsWith('.csv') || type.includes('csv') || type.includes('text')) {
        setMode('csv');
      }
    }
  };

  const validateFramework = (f: any): PreviewRow<FrameworkRow> => {
    if (!f) return { ok: false, error: 'Missing framework object' };
    if (!f.code || !f.name) return { ok: false, error: 'Framework requires code and name' };
    return {
      ok: true,
      data: {
        code: String(f.code).trim(),
        name: String(f.name).trim(),
        version: f.version ?? null,
        authority: f.authority ?? null,
        category: f.category ?? null,
        description: f.description ?? null,
      },
    };
  };

  const normalizePriority = (p: any): RequirementRow['priority'] => {
    if (!p) return null;
    const normalized = String(p).toLowerCase();
    if (['low', 'medium', 'high', 'critical'].includes(normalized)) return normalized as any;
    return 'medium';
  };

  const validateRequirement = (r: any): PreviewRow<RequirementRow> => {
    for (const k of requiredReqColumns) {
      if (!r?.[k] || String(r[k]).trim().length === 0) {
        return { ok: false, error: `Missing required field: ${k}` };
      }
    }
    const data: RequirementRow = {
      framework_code: r.framework_code ?? undefined,
      framework_id: r.framework_id ?? undefined,
      section_code: r.section_code ?? null,
      requirement_code: String(r.requirement_code).trim(),
      title: String(r.title).trim(),
      text: String(r.text).trim(),
      guidance: r.guidance ?? null,
      priority: normalizePriority(r.priority),
      is_active: typeof r.is_active === 'boolean' ? r.is_active : true,
    };
    return { ok: true, data };
  };

  const parseCSV = async (f: File) => {
    return new Promise<any[]>((resolve, reject) => {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as any[]),
        error: (err) => reject(err),
      });
    });
  };

  const parseExcel = async (f: File) => {
    const arrayBuffer = await f.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    // prefer a sheet named "requirements" if present; otherwise first sheet
    const sheetName = wb.SheetNames.find((n: string) => n.toLowerCase().includes('requirement')) || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    // sheet_to_json infers headers from first row
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
    return rows;
  };

  // Utility: safe URL normalization and content fetch with CORS fallbacks
  const fetchUrlWithFallbacks = async (url: string): Promise<{ html?: string; text?: string; titleGuess?: string }> => {
    const normalize = (u: string) => (u.startsWith('http') ? u : `https://${u}`);
    const u = normalize(url.trim());
    const targetHost = (() => { try { return new URL(u).host; } catch { return ''; } })();
    const sameOrigin = typeof window !== 'undefined' && window.location && window.location.host === targetHost;

    const tryDirect = async () => {
      try {
        const res = await fetch(u, { mode: 'cors' });
        if (res.ok) {
          const html = await res.text();
          let titleGuess = '';
          try {
            const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            titleGuess = m ? m[1].trim() : '';
          } catch {}
          return { html, text: undefined, titleGuess } as const;
        }
      } catch {}
      return null;
    };

    // Reader proxy bypasses CORS by returning distilled text
    const tryReaderProxy = async () => {
      try {
        // Prefer local dev proxy to avoid CORS noise
        const localProxy = u.startsWith('http') ? `/reader/http://${u.replace(/^https?:\/\//, '')}` : `/reader/http://${u}`;
        let res2 = await fetch(localProxy, { mode: 'cors' });
        if (!res2.ok) {
          const fallback = u.startsWith('http') ? `https://r.jina.ai/http://${u.replace(/^https?:\/\//, '')}` : `https://r.jina.ai/http://${u}`;
          res2 = await fetch(fallback, { mode: 'cors' });
        }
        if (res2.ok) {
          const text = await res2.text();
          const firstLine = (text.split('\n').map((s) => s.trim()).find((s) => s.length > 0) || '').slice(0, 120);
          return { html: undefined, text, titleGuess: firstLine } as const;
        }
      } catch {}
      return null;
    };

    // Prefer proxy first for cross-origin to avoid noisy CORS errors
    if (!sameOrigin) {
      const viaProxy = await tryReaderProxy();
      if (viaProxy) return viaProxy;
      const direct = await tryDirect();
      if (direct) return direct;
    } else {
      const direct = await tryDirect();
      if (direct) return direct;
      const viaProxy = await tryReaderProxy();
      if (viaProxy) return viaProxy;
    }

    throw new Error('Unable to fetch URL (CORS). Try again or upload the page as a file.');
  };

  // Parse Resmi Gazete or similar legal text into requirement rows
  const parseLegalTextToRequirements = (source: { html?: string; text?: string }, defaults?: { frameworkCode?: string; frameworkName?: string }) => {
    let textContent = source.text;
    let title = '';
    if (!textContent && source.html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(source.html, 'text/html');
        title = doc.title || '';
        // Extract visible text from body keeping line breaks for block elements
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
        const blocks: string[] = [];
        while (walker.nextNode()) {
          const el = walker.currentNode as HTMLElement;
          if (['P', 'DIV', 'H1', 'H2', 'H3', 'LI'].includes(el.tagName)) {
            const t = el.innerText.trim();
            if (t) blocks.push(t);
          }
        }
        textContent = blocks.join('\n');
      } catch {
        textContent = undefined;
      }
    }
    textContent = (textContent || '').replace(/\u00A0/g, ' ').replace(/[\t ]+/g, ' ');

    // Split by articles: Turkish legal docs often use "MADDE 1 –" pattern
    const segments: { code: string; body: string }[] = [];
    const regex = /(MADDE\s+\d+\s*[–—-])/gi;
    const indices: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(textContent)) !== null) {
      indices.push(m.index);
    }
    if (indices.length === 0) {
      // Fallback: split by numbered headings or lines starting with digits and dot
      const lines = textContent.split('\n');
      let current: string[] = [];
      let currentCode = '';
      for (const line of lines) {
        const hit = line.match(/^(\d+)[\.)\-]\s+/);
        if (hit) {
          if (current.length) segments.push({ code: currentCode || `SEC-${segments.length + 1}`, body: current.join(' ') });
          current = [line];
          currentCode = `SEC-${hit[1]}`;
        } else if (line.trim()) {
          current.push(line.trim());
        }
      }
      if (current.length) segments.push({ code: currentCode || `SEC-${segments.length + 1}`, body: current.join(' ') });
    } else {
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i];
        const end = i + 1 < indices.length ? indices[i + 1] : textContent.length;
        const chunk = textContent.slice(start, end).trim();
        const codeMatch = chunk.match(/MADDE\s+(\d+)/i);
        const code = codeMatch ? `MADDE ${codeMatch[1]}` : `MADDE-${i + 1}`;
        segments.push({ code, body: chunk });
      }
    }

    // Build framework candidate
    const framework: FrameworkRow = {
      code: defaults?.frameworkCode || `RESMI-${Date.now()}`,
      name: defaults?.frameworkName || (title ? title.slice(0, 64) : 'Resmi Gazete Document'),
      version: null,
      authority: 'Resmi Gazete',
      category: 'Law/Regulation',
      description: `Imported from URL on ${new Date().toISOString()}`,
    };

    const reqs: RequirementRow[] = segments.map((seg) => {
      // Title: first sentence or up to 120 chars
      const firstSentence = (seg.body.split(/[.!?]/)[0] || '').trim();
      const title = `${seg.code}: ${firstSentence}`.slice(0, 140);
      return {
        framework_code: framework.code,
        requirement_code: seg.code,
        title: title || seg.code,
        text: seg.body,
        guidance: null,
        priority: 'medium',
        is_active: true,
      };
    });

    return { framework, reqs };
  };

  const onParse = async () => {
    if (!file) {
      if (mode !== 'url') {
        setMessage('Please select a file to import.');
        setPhase('error');
        return;
      }
    }
    try {
      setPhase('idle');
      setMessage('Parsing file...');
      setRowErrors([]);
      const fwPreview: PreviewRow<FrameworkRow>[] = [];
      let reqPreview: PreviewRow<RequirementRow>[] = [];

      if (mode === 'csv' || mode === 'excel') {
        const fileSafe = file as File | null;
        if (!fileSafe) {
          setMessage('Please select a file to import.');
          setPhase('error');
          return;
        }
        // CSV/Excel mode expects rows for requirements; optionally first row may include framework fields
        const rows = mode === 'csv' ? await parseCSV(fileSafe) : await parseExcel(fileSafe);
        if (!rows.length) {
          setMessage(`No rows found in ${mode.toUpperCase()}.`);
          setPhase('error');
          return;
        }

        // Detect framework columns if present in first row
        const r0 = rows[0] || {};
        const fwCandidate: any = {
          code: r0.framework_code || r0.frameworkCode || r0.framework || r0.Framework,
          name: r0.framework_name || r0.frameworkName || r0.FrameworkName || r0['FrameworkName'],
          version: r0.framework_version || r0.version || r0.Version || r0['Version'],
          authority: r0.framework_authority || r0.authority,
          category: r0.framework_category || r0.category,
          description: r0.framework_description || r0.description,
        };
        if (fwCandidate.code && fwCandidate.name) {
          fwPreview.push(validateFramework(fwCandidate));
        }

        // Requirements
        reqPreview = rows.map((r) => {
          // Normalize booleans and fields from excel headers (case-insensitive match via known aliases)
          const isActiveRaw = r.is_active ?? r.active ?? r.enabled ?? r.IsActive ?? r['Is Active'];
          const isActive =
            typeof isActiveRaw === 'boolean'
              ? isActiveRaw
              : typeof isActiveRaw === 'string'
              ? isActiveRaw.toLowerCase() !== 'false' && isActiveRaw !== '0' && isActiveRaw.toLowerCase() !== 'no'
              : true;

          // Map common Excel headers from user's sample:
          // Framework, FrameworkName, Version, RequirementCode, Title, RequirementText
          const frameworkFromHeaders =
            r.framework_code ||
            r.frameworkCode ||
            r.framework ||
            r.Framework ||
            fwCandidate.code ||
            undefined;

          const requirementCodeFromHeaders =
            r.requirement_code ||
            r.code ||
            r.req_code ||
            r.requirement ||
            r.RequirementCode ||
            r['RequirementCode'];

          const titleFromHeaders =
            r.title ||
            r.Title ||
            r['Title'];

          const textFromHeaders =
            r.text ||
            r.requirement_text ||
            r.RequirementText ||
            r['RequirementText'];

          const normalizedRow = {
            framework_code: frameworkFromHeaders,
            section_code: r.section_code || r.sectionCode || r.section || null,
            requirement_code: requirementCodeFromHeaders,
            title: titleFromHeaders,
            text: textFromHeaders,
            guidance: r.guidance || r.Guidance || r['Guidance'] || null,
            priority: r.priority || r.Priority || r['Priority'] || null,
            is_active: isActive,
          };
          return validateRequirement(normalizedRow);
        });
      } else if (mode === 'json') {
        const fileSafe = file as File | null;
        if (!fileSafe) {
          setMessage('Please select a JSON file to import.');
          setPhase('error');
          return;
        }
        // JSON mode
        const text = await fileSafe.text();
        const json = JSON.parse(text) as JsonImportSchema | JsonImportSchema[];
        const list = Array.isArray(json) ? json : [json];

        for (const item of list) {
          fwPreview.push(validateFramework(item.framework));
          for (const r of item.requirements || []) {
            reqPreview.push(validateRequirement({ ...r, framework_id: (item as any).framework_id, framework_code: item.framework?.code }));
          }
        }
      } else if (mode === 'url') {
        // URL mode
        if (!urlInput || urlInput.trim().length < 8) {
          setMessage('Please enter a valid URL.');
          setPhase('error');
          return;
        }
        setMessage('Fetching URL...');
        const fetched = await fetchUrlWithFallbacks(urlInput);
        const urlObj = (() => {
          try { return new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`); } catch { return null; }
        })();
        const codeGuess = urlObj ? `RESMI-${urlObj.pathname.replace(/[^\d]/g, '').slice(0, 12) || 'DOC'}` : `RESMI-${Date.now()}`;
        const nameGuess = fetched.titleGuess?.slice(0, 64) || 'Resmi Gazete Document';
        const { framework, reqs } = parseLegalTextToRequirements(fetched, { frameworkCode: codeGuess, frameworkName: nameGuess });
        fwPreview.push(validateFramework(framework));
        reqPreview.push(...reqs.map((r) => validateRequirement(r)));
      } else {
        // TEXT/HTML mode
        if (!textInput || textInput.trim().length < 20) {
          setMessage('Please paste at least 20 characters of text/HTML.');
          setPhase('error');
          return;
        }
        const htmlLike = /<\w+[^>]*>/.test(textInput);
        const source = htmlLike ? { html: textInput } : { text: textInput };
        const codeGuess = (fwCodeInput || '').trim() || `RESMI-${Date.now()}`;
        const nameGuess = (fwNameInput || '').trim() || 'Imported Document';
        const { framework, reqs } = parseLegalTextToRequirements(source, { frameworkCode: codeGuess, frameworkName: nameGuess });
        fwPreview.push(validateFramework(framework));
        reqPreview.push(...reqs.map((r) => validateRequirement(r)));
      }

      setFrameworkPreview(fwPreview);
      setRequirementsPreview(reqPreview);
      const allOk = [...fwPreview, ...reqPreview].every((x) => x.ok);
      // collect first 20 errors for quick display
      const errs: string[] = [];
      fwPreview.forEach((x, i) => { if (!x.ok) errs.push(`Framework row ${i + 1}: ${x.error}`); });
      reqPreview.forEach((x, i) => { if (!x.ok) errs.push(`Requirement row ${i + 1}: ${x.error}`); });
      setRowErrors(errs.slice(0, 20));
      setPhase(allOk ? 'valid' : 'parsed');
      setMessage(allOk ? 'Validation passed. Ready for dry-run/commit.' : 'Parsed with some validation errors. Fix source or proceed row-by-row.');
    } catch (e: any) {
      setMessage(`Parse error: ${e?.message || String(e)}`);
      setPhase('error');
    }
  };

  const dryRunSummary = useMemo(() => {
    const fwOk = frameworkPreview.filter((x) => x.ok).length;
    const fwErr = frameworkPreview.length - fwOk;
    const reqOk = requirementsPreview.filter((x) => x.ok).length;
    const reqErr = requirementsPreview.length - reqOk;
    return { fwOk, fwErr, reqOk, reqErr };
  }, [frameworkPreview, requirementsPreview]);

  const commit = async () => {
    if (dryRunSummary.fwErr > 0 || dryRunSummary.reqErr > 0) {
      setPhase('error');
      setMessage('Cannot commit while there are validation errors. Please fix the source file and re-parse.');
      return;
    }
    setPhase('committing');
    setMessage('Committing to database...');

    try {
      // Upsert frameworks first (by code)
      const frameworkIdByCode: Record<string, string> = {};

      for (const row of frameworkPreview) {
        if (!row.ok || !row.data) continue;
        const fw = row.data;

        // Try to find existing framework by code
        const existing = await supabase.from('compliance_frameworks').select('id').eq('code', fw.code).maybeSingle();
        if ((existing as any).error) throw (existing as any).error;

        if (existing.data?.id) {
          // update
          const upd = await supabase
            .from('compliance_frameworks')
            .update({
              name: fw.name,
              version: fw.version ?? null,
              authority: fw.authority ?? null,
              category: fw.category ?? null,
              description: fw.description ?? null,
              is_active: true,
            })
            .eq('id', existing.data.id)
            .select()
            .single();
          if (upd.error) throw upd.error;
          frameworkIdByCode[fw.code] = upd.data.id;
        } else {
          // insert
          const ins = await ComplianceService.createFramework({
            code: fw.code,
            name: fw.name,
            version: fw.version ?? null,
            authority: fw.authority ?? null,
            category: fw.category ?? null,
            description: fw.description ?? null,
            is_active: true,
          } as any);
          if (ins.error) throw ins.error;
          frameworkIdByCode[fw.code] = (ins.data as any).id;
        }
      }

      // Requirements upsert
      // Keep track of requirement ids by code for post-import linking
      const requirementIdByCode: Record<string, string> = {};
      for (const row of requirementsPreview) {
        if (!row.ok || !row.data) continue;
        const r = row.data;

        let framework_id = r.framework_id || undefined;
        if (!framework_id && r.framework_code) {
          // resolve by code
          if (!frameworkIdByCode[r.framework_code]) {
            const find = await supabase.from('compliance_frameworks').select('id').eq('code', r.framework_code).maybeSingle();
            if ((find as any).error) throw (find as any).error;
            if (find.data?.id) frameworkIdByCode[r.framework_code] = find.data.id;
          }
          framework_id = frameworkIdByCode[r.framework_code!];
        }

        if (!framework_id) {
          throw new Error(`Cannot resolve framework for requirement ${r.requirement_code}. Provide framework_code in CSV/JSON or include framework in JSON payload.`);
        }

        // Upsert by (framework_id, requirement_code) uniqueness constraint
        const upsert = await supabase
          .from('compliance_requirements')
          .upsert({
            framework_id,
            section_id: null, // section support can be added; table exists
            requirement_code: r.requirement_code,
            title: r.title,
            text: r.text,
            guidance: r.guidance ?? null,
            priority: r.priority ?? null,
            is_active: typeof r.is_active === 'boolean' ? r.is_active : true,
          }, { onConflict: 'framework_id,requirement_code' })
          .select()
          .single();

        if (upsert.error) throw upsert.error;
        requirementIdByCode[r.requirement_code] = upsert.data.id as string;
      }

      // Optional: create mappings to controls/risks chosen in preview
      const mappingPromises: Promise<any>[] = [];
      for (const [reqCode, ctrlId] of Object.entries(linkControlByReqCode)) {
        if (!ctrlId) continue;
        const reqId = requirementIdByCode[reqCode];
        if (reqId) mappingPromises.push(ComplianceService.mapControl(reqId, ctrlId));
      }
      for (const [reqCode, riskId] of Object.entries(linkRiskByReqCode)) {
        if (!riskId) continue;
        const reqId = requirementIdByCode[reqCode];
        if (reqId) mappingPromises.push(ComplianceService.mapRisk(reqId, riskId));
      }
      if (mappingPromises.length) await Promise.allSettled(mappingPromises);

      setPhase('done');
      setMessage('Import completed successfully.');
    } catch (e: any) {
      setPhase('error');
      // Show PG/PostgREST error details if available
      const friendly = e?.message || e?.hint || e?.details || String(e);
      setMessage(`Commit failed: ${friendly}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Compliance Importer</h1>

      <div className="border rounded p-4 bg-white space-y-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2" htmlFor="mode-csv">
            <input
              id="mode-csv"
              type="radio"
              name="mode"
              value="csv"
              checked={mode === 'csv'}
              onChange={() => setMode('csv')}
            />
            CSV
          </label>
          <label className="flex items-center gap-2" htmlFor="mode-excel">
            <input
              id="mode-excel"
              type="radio"
              name="mode"
              value="excel"
              checked={mode === 'excel'}
              onChange={() => setMode('excel')}
            />
            Excel (.xlsx/.xls)
          </label>
          <label className="flex items-center gap-2" htmlFor="mode-json">
            <input
              id="mode-json"
              type="radio"
              name="mode"
              value="json"
              checked={mode === 'json'}
              onChange={() => setMode('json')}
            />
            JSON
          </label>
          <label className="flex items-center gap-2" htmlFor="mode-url">
            <input
              id="mode-url"
              type="radio"
              name="mode"
              value="url"
              checked={mode === 'url'}
              onChange={() => setMode('url')}
            />
            URL
          </label>
          <label className="flex items-center gap-2" htmlFor="mode-text">
            <input
              id="mode-text"
              type="radio"
              name="mode"
              value="text"
              checked={mode === 'text'}
              onChange={() => setMode('text')}
            />
            Text / HTML
          </label>

          {mode !== 'url' && mode !== 'text' ? (
            <div key="file-mode-inputs" className="flex items-center gap-2">
              <input
                key="file-input"
                type="file"
                accept={
                  mode === 'csv'
                    ? '.csv,text/csv'
                    : mode === 'excel'
                    ? '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                    : '.json,application/json'
                }
                onChange={onFileChange}
                className="border p-2 rounded"
              />
              <Button onClick={onParse} disabled={!file}>Parse</Button>
            </div>
          ) : mode === 'url' ? (
            <div key="url-mode-inputs" className="flex items-center gap-2">
              <input
                key="url-input"
                type="text"
                placeholder="https://www.resmigazete.gov.tr/eskiler/2020/03/20200315-10.htm"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="border p-2 rounded w-[36rem] max-w-full"
              />
              <Button onClick={onParse} disabled={!urlInput || urlInput.length < 8}>Fetch & Parse</Button>
            </div>
          ) : (
            <div key="text-mode-inputs" className="flex flex-col gap-2 w-full">
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="Framework code (optional)"
                  value={fwCodeInput}
                  onChange={(e) => setFwCodeInput(e.target.value)}
                  className="border p-2 rounded w-56"
                />
                <input
                  type="text"
                  placeholder="Framework name (optional)"
                  value={fwNameInput}
                  onChange={(e) => setFwNameInput(e.target.value)}
                  className="border p-2 rounded w-[28rem] max-w-full"
                />
                <Button onClick={onParse} disabled={!textInput || textInput.trim().length < 20}>Parse Text</Button>
              </div>
              <textarea
                placeholder="Paste page text or HTML here (e.g., copy all from Resmi Gazete page)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="border p-2 rounded w-full min-h-[220px] font-mono"
              />
            </div>
          )}
        </div>

        {message ? (
          <div className={`text-sm ${phase === 'error' ? 'text-red-600' : 'text-gray-700'}`}>{message}</div>
        ) : null}
      </div>

      {/* Preview */}
      {(frameworkPreview.length > 0 || requirementsPreview.length > 0) && (
        <div className="space-y-4">
          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">Frameworks</div>
            <ul className="space-y-2 max-h-72 overflow-auto">
              {frameworkPreview.map((p, idx) => (
                <li key={idx} className={`p-2 rounded border ${p.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {p.ok ? (
                    <div className="text-sm">
                      <div><span className="font-semibold">{p.data!.name}</span> ({p.data!.code})</div>
                      <div className="text-xs opacity-70">{p.data!.version || '-'} · {p.data!.authority || '-'} · {p.data!.category || '-'}</div>
                      {p.data!.description ? <div className="text-xs opacity-70">{p.data!.description}</div> : null}
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">{p.error}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">Requirements</div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Text</th>
                    <th className="py-2 pr-3">Control link (optional)</th>
                    <th className="py-2 pr-3">Risk link (optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {requirementsPreview.map((p, idx) => (
                    <tr key={idx} className={`${p.ok ? '' : 'bg-red-50'} border-b align-top`}>
                      <td className="py-2 pr-3 whitespace-nowrap font-medium">{p.ok ? p.data!.requirement_code : '—'}</td>
                      <td className="py-2 pr-3 min-w-[16rem]">{p.ok ? p.data!.title : <span className="text-red-700">{p.error}</span>}</td>
                      <td className="py-2 pr-3 max-w-[40rem]">
                        <div className="max-h-28 overflow-auto whitespace-pre-wrap opacity-80">{p.ok ? p.data!.text : ''}</div>
                        <div className="text-xs opacity-60 mt-1">Framework: {p.ok ? (p.data!.framework_code || p.data!.framework_id || '(resolve on commit)') : ''}</div>
                      </td>
                      <td className="py-2 pr-3">
                        {p.ok ? (
                          <select
                            className="border rounded p-1 max-w-[18rem]"
                            value={linkControlByReqCode[p.data!.requirement_code] || ''}
                            onChange={(e) => setLinkControlByReqCode((prev) => ({ ...prev, [p.data!.requirement_code]: e.target.value }))}
                          >
                            <option value="">— none —</option>
                            {controls.map((c) => (
                              <option key={c.id} value={c.id}>{c.code ? `${c.code} · ${c.name}` : c.name}</option>
                            ))}
                          </select>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">
                        {p.ok ? (
                          <select
                            className="border rounded p-1 max-w-[18rem]"
                            value={linkRiskByReqCode[p.data!.requirement_code] || ''}
                            onChange={(e) => setLinkRiskByReqCode((prev) => ({ ...prev, [p.data!.requirement_code]: e.target.value }))}
                          >
                            <option value="">— none —</option>
                            {risks.map((r) => (
                              <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                          </select>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dry-run summary and commit */}
      {(frameworkPreview.length > 0 || requirementsPreview.length > 0) && (
        <div className="border rounded p-4 bg-white space-y-3">
          <div className="font-medium">Dry-run summary</div>
          <div className="text-sm opacity-80">
            Frameworks OK: {dryRunSummary.fwOk} · Errors: {dryRunSummary.fwErr} | Requirements OK: {dryRunSummary.reqOk} · Errors: {dryRunSummary.reqErr}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={commit}
              disabled={phase === 'committing' || dryRunSummary.reqErr > 0 || dryRunSummary.fwErr > 0}
            >
              {phase === 'committing' ? 'Committing...' : 'Commit to Supabase'}
            </Button>
            <Button variant="outline" onClick={reset}>Reset</Button>
          </div>
        </div>
      )}
    </div>
  );
}