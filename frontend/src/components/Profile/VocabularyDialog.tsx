import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { listVocabulary, createVocabulary, deleteVocabulary, type VocabularyItem, type CreateVocabularyPayload } from "@/api";
import { Plus, Trash2 } from "lucide-react";

interface VocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVocabChange?: (vocabList: VocabularyItem[]) => void;
}

const defaultVocabList: VocabularyItem[] = [
  { id: "1", word: "因果", shortcut: "yg", category: null, created_at: null },
  { id: "2", word: "递进", shortcut: "dj", category: null, created_at: null },
  { id: "3", word: "转折", shortcut: "zz", category: null, created_at: null },
  { id: "4", word: "泰勒展开", shortcut: "tl", category: null, created_at: null },
  { id: "5", word: "牛顿第二定律", shortcut: "nd", category: null, created_at: null },
];

export function VocabularyDialog({ open, onOpenChange, onVocabChange }: VocabularyDialogProps) {
  const { t } = useTranslation();
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newShortcut, setNewShortcut] = useState("");

  const loadVocab = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listVocabulary();
      setVocabList(items);
    } catch (err: any) {
      console.error("Failed to load vocabulary:", err);
      toast.error(err.message || t("profile.vocabLoadFailed"));
      setVocabList(defaultVocabList);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      loadVocab();
    }
  }, [open, loadVocab]);

  const handleAdd = useCallback(async () => {
    if (!newWord.trim() || !newShortcut.trim()) {
      toast.error(t("profile.vocabEmpty"));
      return;
    }
    if (vocabList.some((v) => v.shortcut === newShortcut)) {
      toast.error(t("profile.vocabExists"));
      return;
    }
    try {
      const payload: CreateVocabularyPayload = { word: newWord.trim(), shortcut: newShortcut.trim(), category: null };
      const item = await createVocabulary(payload);
      setVocabList(prev => [item, ...prev]);
      onVocabChange?.([item, ...vocabList]);
      setNewWord("");
      setNewShortcut("");
      toast.success(t("profile.vocabAdded"));
    } catch (err: any) {
      toast.error(err.message || t("profile.vocabAddFailed"));
    }
  }, [newWord, newShortcut, vocabList, onVocabChange, t]);

  const handleRemove = useCallback(async (vocabId: string) => {
    try {
      await deleteVocabulary(vocabId);
      setVocabList(prev => prev.filter((v) => v.id !== vocabId));
      onVocabChange?.(vocabList.filter((v) => v.id !== vocabId));
      toast.success(t("profile.vocabDeleted"));
    } catch (err: any) {
      toast.error(err.message || t("profile.vocabDeleteFailed"));
    }
  }, [vocabList, onVocabChange, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl p-4 flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("profile.vocabTitle")}</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">{t("profile.vocabDesc")}</p>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1 mt-2 pr-1">
          <div className="flex gap-2 items-center mb-4">
            <Input placeholder={t("profile.vocabPlaceholder")} className="flex-1 h-9" value={newWord} onChange={e => setNewWord(e.target.value)} />
            <Input placeholder={t("profile.shortcutPlaceholder")} className="w-24 h-9" value={newShortcut} onChange={e => setNewShortcut(e.target.value)} />
            <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-muted-foreground text-sm py-4">{t("common.loading")}</div>
            ) : vocabList.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">{t("profile.noVocab")}</div>
            ) : (
              vocabList.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="text-sm font-medium">{item.word}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t("profile.vocabTrigger", { shortcut: item.shortcut })}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}