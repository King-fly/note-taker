import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, FileText, Loader2 } from "lucide-react";
import { generateFlashcardsFromNote, listNotes, type NoteItem } from "@/api";

// 辅助函数：将系统标签转换为国际化标签
const translateTag = (tag: string, t: (key: string) => string) => {
  // 检查多种可能的标签值并将其转换为标准的国际化键
  if (["OCR", "OCR识别"].includes(tag)) {
    return t("notes.ocr");
  } else if (["Audio", "语音"].includes(tag)) {
    return t("notes.voice");
  } else if (["Quick Note", "快速笔记"].includes(tag)) {
    return t("home.quickNote");
  } else {
    return tag;
  }
};

interface GenerateFlashcardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void;
}

export const GenerateFlashcardsDialog: React.FC<GenerateFlashcardsDialogProps> = ({
  open,
  onOpenChange,
  onGenerated,
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadNotes();
    } else {
      setSelectedNotes(new Set());
      setNotes([]);
    }
  }, [open]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await listNotes({ page_size: 50 });
      setNotes(res.items);
    } catch (err: any) {
      toast.error(err.message || t("review.loadNotesFailed"));
    } finally {
      setLoading(false);
    }
  };

  const toggleNote = useCallback((noteId: string) => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedNotes.size === 0) {
      toast.error(t("review.selectNoteFirst"));
      return;
    }

    setGenerating(true);
    try {
      const selectedNotesList = notes.filter(n => selectedNotes.has(n.id));
      for (const note of selectedNotesList) {
        await generateFlashcardsFromNote(note.id);
      }
      toast.success(t("review.generateSuccess", { count: selectedNotes.size }));
      onOpenChange(false);
      onGenerated?.();
    } catch (err: any) {
      toast.error(err.message || t("review.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }, [selectedNotes, notes, onOpenChange, onGenerated, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("review.generateFlashcards")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{t("review.loadingNotes")}</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("review.noNotes")}</p>
              <p className="text-xs mt-1">{t("review.createNoteFirst")}</p>
            </div>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                className={`cursor-pointer transition-all ${
                  selectedNotes.has(note.id)
                    ? "border-primary bg-primary/5"
                    : "hover:border-zinc-400"
                }`}
                onClick={() => toggleNote(note.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{note.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {note.subject || t("notes.uncategorized")}
                        </Badge>
                        {note.tags?.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {translateTag(tag, t)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedNotes.has(note.id)
                        ? "border-primary bg-primary"
                        : "border-zinc-300"
                    }`}>
                      {selectedNotes.has(note.id) && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-2 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={generating || selectedNotes.size === 0}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("review.generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("review.generate")} {selectedNotes.size > 0 && `(${selectedNotes.size})`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};