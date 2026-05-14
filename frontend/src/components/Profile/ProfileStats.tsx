import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { BookOpen, Trophy, Clock } from "lucide-react";

interface ProfileStatsProps {
  totalNotes: number;
  organizedNotes: number;
  totalFlashcards: number;
}

export function ProfileStats({ totalNotes, organizedNotes, totalFlashcards }: ProfileStatsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="border-none shadow-sm text-center py-4 bg-white dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">{totalNotes}</div>
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <BookOpen className="w-3 h-3" /> {t("profile.notesCount")}
        </div>
      </Card>
      <Card className="border-none shadow-sm text-center py-4 bg-white dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">{organizedNotes}</div>
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Trophy className="w-3 h-3" /> {t("profile.organized")}
        </div>
      </Card>
      <Card className="border-none shadow-sm text-center py-4 bg-white dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">{totalFlashcards}</div>
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" /> {t("profile.flashcards")}
        </div>
      </Card>
    </div>
  );
}