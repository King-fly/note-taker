import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { NoteItem } from "@/api";
import { NoteContent } from "./NoteContent";
import { Sparkles, Save, X, PenLine } from "lucide-react";

interface NoteDetailDialogProps {
  note: NoteItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (noteId: string, data: { title: string; content: string; subject: string }) => Promise<void>;
  onOrganize: (noteId: string) => Promise<void>;
  saving?: boolean;
}

export const NoteDetailDialog: React.FC<NoteDetailDialogProps> = ({
  note,
  open,
  onOpenChange,
  onSave,
  onOrganize,
  saving = false,
}) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [isOrganizing, setIsOrganizing] = useState(false);

  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content || note.raw_content || "");
      setEditSubject(note.subject || "");
    }
  }, [note]);

  const handleSave = useCallback(async () => {
    if (!note || saving) return;
    try {
      await onSave(note.id, {
        title: editTitle.trim() || note.title,
        content: editContent.trim() || "",
        subject: editSubject || t("notes.uncategorized"),
      });
      setEditMode(false);
    } catch (err: any) {
      toast.error(err.message || t("notes.saveFailed"));
    }
  }, [note, editTitle, editContent, editSubject, onSave, saving, t]);

  const handleOrganize = useCallback(async () => {
    if (!note) return;
    setIsOrganizing(true);
    try {
      const template = note.template || "cornell";
      toast.info(t("notes.organizing"));
      await onOrganize(note.id);
      toast.success(t("notes.organizeSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("notes.organizeFailed"));
    } finally {
      setIsOrganizing(false);
    }
  }, [note, onOrganize, t]);

  const handleClose = useCallback(() => {
    setEditMode(false);
    onOpenChange(false);
  }, [onOpenChange]);

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            {editMode ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold border-none p-0 h-auto bg-transparent focus:bg-zinc-100 dark:focus:bg-zinc-800 rounded px-2 py-1"
                placeholder={t("notes.noteTitle")}
              />
            ) : (
              <DialogTitle className="text-lg font-semibold">{note.title}</DialogTitle>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {editMode ? (
            <div className="space-y-4 p-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("notes.subject")}</label>
                <Input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder={t("notes.subjectPlaceholder")}
                  className="bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("notes.content")}</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder={t("notes.contentPlaceholder")}
                  className="min-h-[300px] bg-zinc-50 dark:bg-zinc-800 resize-none"
                />
              </div>
            </div>
          ) : (
            <NoteContent note={note} />
          )}
        </div>

        <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4 flex gap-2 justify-end">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                <X className="w-4 h-4 mr-1" />
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                {saving ? t("notes.saving") : t("common.save")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <PenLine className="w-4 h-4 mr-1" />
                {t("common.edit")}
              </Button>
              {!note.is_organized && (
                <Button onClick={handleOrganize} disabled={isOrganizing}>
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isOrganizing ? t("notes.organizing") : t("notes.organizeNote")}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};