import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { listNotes, createNote, organizeNote, updateNote, type NoteItem, type NoteQueryParams } from "@/api";
import { 
  NoteCard, 
  NotesHeader, 
  NoteDetailDialog, 
  NewNoteSheet 
} from "@/components/Notes";

export default function Notes() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Memoize filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (activeTab === "todo" && note.is_organized) return false;
      
      // 定义科目分类的国际化映射
      const mathSubjects = [
        t("notes.math"), // "理科"
        "数学", "物理", "化学", 
        "Mathematics", "Physics", "Chemistry"
      ];
      const artsSubjects = [
        t("notes.arts"), // "文科"
        "语文", "英语", "历史", "政治", 
        "Chinese", "English", "History", "Politics"
      ];
      
      if (activeTab === "math" && !mathSubjects.includes(note.subject || "")) return false;
      if (activeTab === "arts" && !artsSubjects.includes(note.subject || "")) return false;
      return true;
    });
  }, [notes, activeTab, t]);

  // Load notes from API
  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const queryParams: NoteQueryParams = {
        page: 1,
        page_size: 50,
      };
      if (searchQuery) {
        queryParams.search = searchQuery;
      }
      if (activeTab === "todo") {
        queryParams.is_organized = false;
      }
      const res = await listNotes(queryParams);
      setNotes(res.items);
    } catch (err: any) {
      console.error("Failed to load notes:", err);
      setNotes([]);
      toast.error(err.message || t("errors.serverError"));
    } finally {
      setNotesLoading(false);
    }
  }, [activeTab, searchQuery, t]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Handle creating new note
  const handleCreateNew = useCallback(async (template: string) => {
    try {
      const note = await createNote({
        title: `${t("notes.newNote")} - ${template}`,
        content: "",
        raw_content: `${t("notes.newNote")}`,
        note_type: "text",
        subject: t("notes.noteType"),
        tags: [template],
      });
      setNotes(prev => [note, ...prev]);
      setSelectedNote(note);
      toast.success(t("notes.createSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
    }
  }, [t]);

  // Handle marking note as organized
  const handleMarkOrganized = useCallback(async ({ note, template }: { note: NoteItem; template?: string }) => {
    try {
      const selectedTemplate = template || note.template || "Cornell";
      // Optimistic UI update
      setNotes(prev => prev.map((n: NoteItem) =>
        n.id === note.id ? { ...n, is_organized: false, organize_status: "processing" } : n
      ));
      toast.info(t("notes.organizing"));
      await organizeNote(note.id, { template: selectedTemplate });
      await loadNotes();
      toast.success(t("notes.organizeSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
      await loadNotes();
    }
  }, [loadNotes, t]);

  // Handle AI organize from dialog
  const handleAIOrganize = useCallback(async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      const template = note?.template || "Cornell";
      toast.info(t("notes.organizing"));
      await organizeNote(noteId, { template: template });
      await loadNotes();
      const updatedNote = notes.find(n => n.id === noteId);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
      toast.success(t("notes.organizeSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
      await loadNotes();
    }
  }, [notes, loadNotes, t]);

  // Handle opening note detail
  const handleOpenNote = useCallback((note: NoteItem) => {
    setSelectedNote(note);
  }, []);

  // Handle saving note
  const handleSaveNote = useCallback(async (noteId: string, data: { title: string; content: string; subject: string }) => {
    setSaving(true);
    try {
      await updateNote(noteId, {
        title: data.title.trim() || undefined,
        content: data.content.trim() || undefined,
        raw_content: data.content.trim() || undefined,
        subject: data.subject || t("notes.noteType"),
      });
      toast.success(t("notes.updateSuccess"));
      await loadNotes();
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
      throw err;
    } finally {
      setSaving(false);
    }
  }, [loadNotes, t]);

  // Count notes in todo tab
  const todoNotesCount = useMemo(() => {
    return notes.filter(n => !n.is_organized).length;
  }, [notes]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <NotesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notesCount={todoNotesCount}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-muted-foreground">
            {t("notes.allNotes")} {filteredNotes.length} {t("notes.items")}
          </span>
          <NewNoteSheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onCreateNote={handleCreateNew}
          />
        </div>

        {notesLoading ? (
          <div className="text-center text-muted-foreground text-sm py-10">
            {t("common.loading")}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-10">
            <p>{t("notes.allNotes")}</p>
            <p className="text-xs mt-1">{t("notes.newNote")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={handleOpenNote}
                onOrganize={handleMarkOrganized}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <NoteDetailDialog
        note={selectedNote}
        open={!!selectedNote}
        onOpenChange={(open) => !open && setSelectedNote(null)}
        onSave={handleSaveNote}
        onOrganize={handleAIOrganize}
        saving={saving}
      />
    </div>
  );
}