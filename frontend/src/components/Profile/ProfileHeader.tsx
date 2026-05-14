import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ProfileHeaderProps {
  onSettingsClick: () => void;
}

export function ProfileHeader({ onSettingsClick }: ProfileHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="px-4 pt-6 pb-6 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t("profile.title")}</h1>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onSettingsClick}>
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
}