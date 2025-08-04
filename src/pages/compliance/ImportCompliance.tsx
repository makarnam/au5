import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
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

type ParseMode = 'csv' | 'json';
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

  const [frameworkPreview, setFrameworkPreview] = useState<PreviewRow<FrameworkRow>[]>([]);
  const [requirementsPreview, setRequirementsPreview] = useState<PreviewRow<RequirementRow>[]>([]);

  const [phase, setPhase] = useState<ImportPhase>('idle');
  const [message, setMessage] = useState<string>('');

  const reset = () => {
    setFrameworkPreview([]);
    setRequirementsPreview([]);
    setPhase('idle');
    setMessage('');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    reset();
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

  const onParse = async () => {
    if (!file) {
      setMessage('Please select a file to import.');
      setPhase('error');
      return;
    }
    try {
      setPhase('idle');
      setMessage('Parsing file...');
      let fwPreview: PreviewRow<FrameworkRow>[] = [];
      let reqPreview: PreviewRow<RequirementRow>[] = [];

      if (mode === 'csv') {
        // CSV mode expects rows for requirements; optionally first row may include framework fields
        const rows = await parseCSV(file);
        if (!rows.length) {
          setMessage('No rows found in CSV.');
          setPhase('error');
          return;
        }

        // Detect framework columns if present in first row
        const fwCandidate: any = {
          code: rows[0].framework_code || rows[0].frameworkCode || rows[0].framework,
          name: rows[0].framework_name || rows[0].frameworkName,
          version: rows[0].framework_version,
          authority: rows[0].framework_authority,
          category: rows[0].framework_category,
          description: rows[0].framework_description,
        };
        if (fwCandidate.code && fwCandidate.name) {
          fwPreview.push(validateFramework(fwCandidate));
        }

        // Requirements
        reqPreview = rows.map((r) => {
          // Allow framework_code in each row for mapping
          const normalizedRow = {
            framework_code: r.framework_code || r.frameworkCode || fwCandidate.code || undefined,
            section_code: r.section_code || r.sectionCode || null,
            requirement_code: r.requirement_code || r.code || r.req_code,
            title: r.title,
            text: r.text || r.requirement_text,
            guidance: r.guidance || null,
            priority: r.priority || null,
            is_active: typeof r.is_active === 'string' ? r.is_active.toLowerCase() !== 'false' : true,
          };
          return validateRequirement(normalizedRow);
        });
      } else {
        // JSON mode
        const text = await file.text();
        const json = JSON.parse(text) as JsonImportSchema | JsonImportSchema[];
        const list = Array.isArray(json) ? json : [json];

        for (const item of list) {
          fwPreview.push(validateFramework(item.framework));
          for (const r of item.requirements || []) {
            reqPreview.push(validateRequirement({ ...r, framework_id: (item as any).framework_id, framework_code: item.framework?.code }));
          }
        }
      }

      setFrameworkPreview(fwPreview);
      setRequirementsPreview(reqPreview);
      const allOk = [...fwPreview, ...reqPreview].every((x) => x.ok);
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
    setPhase('committing');
    setMessage('Committing to database...');

    try {
      // Upsert frameworks first (by code)
      let frameworkIdByCode: Record<string, string> = {};

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
      }

      setPhase('done');
      setMessage('Import completed successfully.');
    } catch (e: any) {
      setPhase('error');
      setMessage(`Commit failed: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Compliance Importer</h1>

      <div className="border rounded p-4 bg-white space-y-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="csv"
              checked={mode === 'csv'}
              onChange={() => setMode('csv')}
            />
            CSV
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="json"
              checked={mode === 'json'}
              onChange={() => setMode('json')}
            />
            JSON
          </label>

          <input
            type="file"
            accept={mode === 'csv' ? '.csv,text/csv' : '.json,application/json'}
            onChange={onFileChange}
            className="border p-2 rounded"
          />

          <Button onClick={onParse} disabled={!file}>Parse</Button>
        </div>

        {message ? (
          <div className={`text-sm ${phase === 'error' ? 'text-red-600' : 'text-gray-700'}`}>{message}</div>
        ) : null}
      </div>

      {/* Preview */}
      {(frameworkPreview.length > 0 || requirementsPreview.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <ul className="space-y-2 max-h-96 overflow-auto">
              {requirementsPreview.map((p, idx) => (
                <li key={idx} className={`p-2 rounded border ${p.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {p.ok ? (
                    <div className="text-sm">
                      <div className="font-semibold">{p.data!.requirement_code} - {p.data!.title}</div>
                      <div className="text-xs opacity-80">{p.data!.text}</div>
                      <div className="text-xs opacity-60 mt-1">
                        Framework: {p.data!.framework_code || p.data!.framework_id || '(resolved on commit)'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">{p.error}</div>
                  )}
                </li>
              ))}
            </ul>
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