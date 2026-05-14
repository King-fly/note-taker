import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { createNote, listNotes, type NoteItem } from "@/api";
import { useAuth } from "@/auth-context";
import { HomeHeader, QuickActions, RecordingCard, QuickNoteCard, CameraDialog, TypingDialog } from "@/components/Home";
import { useAudioRecorder } from "@/components/Home/useAudioRecorder";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [isTypingOpen, setIsTypingOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [recentNotes, setRecentNotes] = useState<NoteItem[]>([]);
  const [recentNotesLoading, setRecentNotesLoading] = useState(true);
  const initial = user?.display_name || user?.username || "W";

  const { 
    isRecording, 
    isTranscribing, 
    transcription, 
    recordTime,
    isTranscriptionComplete,
    startRecording, 
    stopRecording,
    getFinalText,
    clearRecording,
  } = useAudioRecorder({
    onTranscriptionComplete: (text) => {
      console.log("Transcription complete:", text);
    },
    t,
  });

  const displayedRecentNotes = useMemo(() => recentNotes.slice(0, 5), [recentNotes]);

  const loadRecentNotes = useCallback(async () => {
    setRecentNotesLoading(true);
    try {
      const res = await listNotes({ is_organized: false, page_size: 10 });
      setRecentNotes(res.items);
    } catch (err: any) {
      setRecentNotes([]);
      toast.error(err.message || t("errors.serverError"));
    } finally {
      setRecentNotesLoading(false);
    }
  }, [t]);

  useEffect(() => { loadRecentNotes(); }, [loadRecentNotes]);

  const handleOCRResult = useCallback((text: string) => {
    setOcrText(text);
    setIsAnalyzing(false);
  }, []);

  const handleCameraDialogChange = useCallback((open: boolean) => {
    setIsCameraOpen(open);
    if (!open) {
      setOcrText("");
    }
  }, []);

  const handleSaveOCR = useCallback(async () => {
    if (!ocrText.trim()) {
      toast.error(t("errors.invalidInput"));
      return;
    }
    try {
      await createNote({ title: t("notes.noteTitle"), content: ocrText, raw_content: ocrText, note_type: "ocr", tags: [t("notes.ocr")] });
      toast.success(t("notes.createSuccess"));
      setIsCameraOpen(false);
      setOcrText("");
      loadRecentNotes();
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
    }
  }, [ocrText, loadRecentNotes, t]);

  const handleSaveTyping = useCallback(async () => {
    if (!typedText.trim()) return;
    try {
      await createNote({ title: typedText.slice(0, 50), content: typedText, raw_content: typedText, note_type: "text", tags: [t("home.quickNote")] });
      toast.success(t("notes.createSuccess"));
      setTypedText("");
      loadRecentNotes();
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
    }
  }, [typedText, loadRecentNotes, t]);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleStopAndSave = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    }

    if (!isTranscriptionComplete) {
      toast.info(t("common.loading"));
      return;
    }

    const finalText = getFinalText();
    console.log("Final text for save:", finalText);

    if (!finalText || !finalText.trim()) {
      toast.error(t("errors.invalidInput"));
      clearRecording();
      return;
    }

    try {
      const title = (finalText.slice(0, 15) || t("home.recordAudio")) + "...";
      await createNote({ title, content: finalText, raw_content: finalText, note_type: "voice", tags: [t("notes.voice")] });
      toast.success(t("notes.createSuccess"));
      loadRecentNotes();
      clearRecording();
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
    }
  }, [isRecording, isTranscriptionComplete, getFinalText, loadRecentNotes, clearRecording, stopRecording, t]);

  const handleNoteCardClick = useCallback(() => navigate('/notes'), [navigate]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <HomeHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} initial={initial} />
      <ScrollArea className="flex-1 p-4">
        <QuickActions isRecording={isRecording} recordTime={recordTime} onRecordToggle={handleRecordToggle} onOpenCamera={() => setIsCameraOpen(true)} onOpenTyping={() => setIsTypingOpen(true)} />
        {(isRecording || transcription) && (
          <RecordingCard
            transcription={isTranscribing ? t("common.loading") : (transcription || t("common.loading"))}
            isTranscribing={isTranscribing}
            onOpenCamera={() => setIsCameraOpen(true)}
            onStopRecording={handleStopAndSave}
          />
        )}
        <div className="flex justify-between items-end mb-3 mt-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("home.recentNotes")}</h2>
          <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={handleNoteCardClick}>{t("notes.allNotes")}</Button>
        </div>
        <div className="space-y-3">
          {recentNotesLoading ? (
            <div className="text-center text-muted-foreground text-sm py-6">{t("common.loading")}</div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-10">
              <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t("home.noNotes")}</p>
              <p className="text-[10px]">{t("home.title")}</p>
            </div>
          ) : (
            displayedRecentNotes.map((note) => (
              <QuickNoteCard key={note.id} note={note} onClick={handleNoteCardClick} />
            ))
          )}
        </div>
      </ScrollArea>
      <CameraDialog
        open={isCameraOpen}
        onOpenChange={handleCameraDialogChange}
        videoRef={{ current: null }}
        cameraPreview={null}
        cameraError={null}
        isCapturing={false}
        isAnalyzing={isAnalyzing}
        ocrText={ocrText}
        onStartCamera={() => {}}
        onCapturePhoto={() => {}}
        onResetCamera={() => {}}
        onSaveOCR={handleSaveOCR}
        onOCRResult={handleOCRResult}
      />
      <TypingDialog open={isTypingOpen} onOpenChange={setIsTypingOpen} typedText={typedText} onTextChange={setTypedText} onSave={handleSaveTyping} />
    </div>
  );
}