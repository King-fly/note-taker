import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/auth-context";
import { ProfileHeader, ProfileStats, SettingsList, SettingsDialog, VocabularyDialog } from "@/components/Profile";

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, stats, logout, loading: authLoading } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);

  const displayName = user?.display_name || user?.username || t("profile.defaultName");
  const grade = user?.grade || "";
  const initial = displayName.charAt(0).toUpperCase();

  const memoizedStats = useMemo(() => ({
    totalNotes: stats?.total_notes ?? 0,
    organizedNotes: stats?.organized_notes ?? 0,
    totalFlashcards: stats?.total_flashcards ?? 0
  }), [stats]);

  const handleLogout = useCallback(() => {
    logout();
    setIsSettingsOpen(false);
    toast.success(t("auth.logoutSuccess"));
    navigate("/auth", { replace: true });
  }, [logout, navigate, t]);

  if (authLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground mt-3">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <ProfileHeader onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="flex-1 p-4 pb-10 overflow-y-auto space-y-6">
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
            {initial}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">{grade || t("profile.gradeNotSet")}</p>
          </div>
          <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 shadow-none">Lv.4 {t("profile.expert")}</Badge>
        </div>
        <ProfileStats totalNotes={memoizedStats.totalNotes} organizedNotes={memoizedStats.organizedNotes} totalFlashcards={memoizedStats.totalFlashcards} />
        <SettingsList onVocabClick={() => setIsVocabOpen(true)} onLogoutClick={() => setIsSettingsOpen(true)} />
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onLogout={handleLogout} />
      <VocabularyDialog open={isVocabOpen} onOpenChange={setIsVocabOpen} />
    </div>
  );
}