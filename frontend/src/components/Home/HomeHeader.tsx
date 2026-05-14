import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "../LanguageSelector";

interface HomeHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  initial: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = React.memo(({ searchQuery, onSearchChange, initial }) => {
  const { t } = useTranslation();
  
  return (
    <header className="px-4 pt-6 pb-2 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("home.title")}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {initial}
          </div>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("notes.searchPlaceholder")}
          className="pl-9 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full h-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  );
});

HomeHeader.displayName = 'HomeHeader';