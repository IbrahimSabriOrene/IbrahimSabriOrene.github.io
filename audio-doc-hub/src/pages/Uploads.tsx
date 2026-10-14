import { useState, useCallback, useEffect, useRef } from "react";
import { DropZone } from "@/components/uploads/DropZone";
import { UploadQueue } from "@/components/uploads/UploadQueue";
import { TranscriptionResults } from "@/components/uploads/TranscriptionResults";
import { TranscriptSlideOver } from "@/components/uploads/TranscriptSlideOver";
import {
  generateMockUploadFiles, loadResults, saveResults,
  generateMockResults, type UploadFile, type TranscriptionResult,
} from "@/lib/uploads-mock-data";
import { useToast } from "@/hooks/use-toast";

export default function Uploads() {
  const { toast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [viewingTranscript, setViewingTranscript] = useState<TranscriptionResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const intervalsRef = useRef<number[]>([]);

  useEffect(() => {
    setResults(loadResults());
  }, []);

  useEffect(() => {
    if (results.length > 0) saveResults(results);
  }, [results]);

  // ETA countdown
  useEffect(() => {
    if (!isTranscribing || etaSeconds <= 0) return;
    const i = setInterval(() => setEtaSeconds((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(i);
  }, [isTranscribing, etaSeconds]);

  const handleFilesSelected = useCallback((count: number) => {
    const files = generateMockUploadFiles(count);
    setUploadFiles(files);
    setSelected(new Set());
    setShowConfirm(false);
    setIsTranscribing(false);
  }, []);

  const totalHours = uploadFiles.reduce((acc, f) => acc + f.duration, 0) / 3600;

  const batchProgress = isTranscribing ? (() => {
    const complete = uploadFiles.filter(f => f.status === "complete" || f.status === "error").length;
    const total = uploadFiles.length;
    const percent = total > 0 ? Math.round((complete / total) * 100) : 0;
    return { complete, total, percent, etaSeconds };
  })() : null;

  const handleToggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === uploadFiles.length) setSelected(new Set());
    else setSelected(new Set(uploadFiles.map(f => f.id)));
  };

  const handleAssignRep = (rep: string) => {
    setUploadFiles(prev => prev.map(f => selected.has(f.id) ? { ...f, rep } : f));
  };

  const handleAssignCallType = (type: string) => {
    setUploadFiles(prev => prev.map(f => selected.has(f.id) ? { ...f, callType: type } : f));
  };

  const handleRemoveSelected = () => {
    setUploadFiles(prev => prev.filter(f => !selected.has(f.id)));
    setSelected(new Set());
  };

  const handleChangeRep = (id: string, rep: string) => {
    setUploadFiles(prev => prev.map(f => f.id === id ? { ...f, rep } : f));
  };

  const handleChangeCallType = (id: string, type: string) => {
    setUploadFiles(prev => prev.map(f => f.id === id ? { ...f, callType: type } : f));
  };

  const handleRetry = (id: string) => {
    simulateFileTranscription(id);
  };

  const simulateFileTranscription = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f));

    let progress = 0;
    const uploadInterval = window.setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "uploading", progress: 100 } : f));

        setTimeout(() => {
          setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "queued" } : f));

          setTimeout(() => {
            setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "transcribing" } : f));

            const transcribeTime = 3000 + Math.random() * 7000;
            setTimeout(() => {
              if (Math.random() < 0.05) {
                setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error" } : f));
              } else {
                setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "complete" } : f));
                const newResult = generateMockResults(1)[0];
                setResults(prev => [newResult, ...prev]);
              }
            }, transcribeTime);
          }, 500);
        }, 300);
      } else {
        setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      }
    }, 400);
    intervalsRef.current.push(uploadInterval);
  };

  const handleStartTranscription = () => {
    setShowConfirm(true);
  };

  const handleConfirmStart = () => {
    setShowConfirm(false);
    setIsTranscribing(true);
    const estMins = Math.round(uploadFiles.length * 0.47);
    setEtaSeconds(estMins * 60);
    toast({ title: "Transcription started", description: `Processing ${uploadFiles.length} files...` });

    const pending = uploadFiles.filter(f => f.status === "pending");
    pending.forEach((file, idx) => {
      setTimeout(() => simulateFileTranscription(file.id), idx * 600);
    });
  };

  return (
    <div className="h-full overflow-y-auto scroll-thin">
      <div className="p-6">
        {/* Header */}
        <div className="pb-6 mb-5 border-b border-border-dim">
          <h1 className="text-text-primary text-sm font-mono font-semibold tracking-[0.04em]">UPLOAD CALL RECORDINGS</h1>
          <p className="text-text-dim text-[10px] font-mono mt-1 tracking-[0.06em]">
            BATCH TRANSCRIPTION VIA WHISPER LARGE-V3 · MAX 500 FILES PER BATCH
          </p>
        </div>

        {/* Zone 1: Drop Zone */}
        <div className="mb-6">
          <DropZone onFilesSelected={handleFilesSelected} fileCount={uploadFiles.length} totalHours={totalHours} />
        </div>

        {/* Zone 2: Batch Metadata */}
        {uploadFiles.length > 0 && (
          <div className="mb-6">
            <div className="section-label mb-2">BATCH DEFAULTS</div>
            <div className="grid grid-cols-4 gap-3 mb-2">
              <div>
                <label className="text-[9px] font-mono text-text-dim block mb-1">DEFAULT REP</label>
                <select className="w-full h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
                  <option value="">Select rep...</option>
                  {["Sarah Chen", "Mike Rivera", "Jenna Walsh", "David Kim", "Lisa Park", "Tom Nguyen"].map(r => (
                    <option key={r} value={r} className="bg-bg-raised">{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-text-dim block mb-1">DEFAULT CALL TYPE</label>
                <select className="w-full h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
                  {["DEMO", "ONBOARDING", "SUPPORT", "ACCOUNT REVIEW", "QBR"].map(t => (
                    <option key={t} value={t} className="bg-bg-raised">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-text-dim block mb-1">DEFAULT DATE</label>
                <div className="flex gap-1">
                  <select className="flex-1 h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-1 focus:outline-none focus:border-electric transition-colors">
                    {Array.from({length: 12}, (_, i) => <option key={i} className="bg-bg-raised">{String(i + 1).padStart(2, "0")}</option>)}
                  </select>
                  <select className="flex-1 h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-1 focus:outline-none focus:border-electric transition-colors">
                    {Array.from({length: 31}, (_, i) => <option key={i} className="bg-bg-raised">{String(i + 1).padStart(2, "0")}</option>)}
                  </select>
                  <select className="flex-1 h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-1 focus:outline-none focus:border-electric transition-colors">
                    <option className="bg-bg-raised">2026</option>
                    <option className="bg-bg-raised">2025</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-mono text-text-dim block mb-1">LANGUAGE</label>
                <select className="w-full h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
                  {["EN-US", "EN-GB", "ES", "DE", "FR", "PT"].map(l => (
                    <option key={l} value={l} className="bg-bg-raised">{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] font-mono text-text-dim mb-2">
              THESE DEFAULTS APPLY TO ALL FILES. OVERRIDE PER-FILE IN THE QUEUE BELOW.
            </p>
            <button className="text-[10px] font-mono text-text-secondary border border-border-dim px-3 py-1 hover:border-border-mid hover:text-text-primary transition-colors">
              APPLY DEFAULTS TO ALL
            </button>
          </div>
        )}

        {/* Zone 3: Queue */}
        {uploadFiles.length > 0 && (
          <div className="mb-6">
            <UploadQueue
              files={uploadFiles}
              selected={selected}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onAssignRep={handleAssignRep}
              onAssignCallType={handleAssignCallType}
              onRemoveSelected={handleRemoveSelected}
              onStartTranscription={handleStartTranscription}
              onRetry={handleRetry}
              onChangeRep={handleChangeRep}
              onChangeCallType={handleChangeCallType}
              totalHours={totalHours}
              batchProgress={batchProgress}
              showConfirm={showConfirm}
              onConfirm={handleConfirmStart}
              onCancelConfirm={() => setShowConfirm(false)}
            />
          </div>
        )}

        {/* Zone 4: Completed Results */}
        {results.length > 0 && (
          <div className="mb-6">
            <TranscriptionResults
              results={results}
              onViewTranscript={setViewingTranscript}
            />
          </div>
        )}
      </div>

      {/* Transcript Slide-over */}
      {viewingTranscript && (
        <TranscriptSlideOver
          result={viewingTranscript}
          onClose={() => setViewingTranscript(null)}
        />
      )}
    </div>
  );
}
