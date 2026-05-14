import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotesHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  notesCount: number;
}

export const NotesHeader: React.FC<NotesHeaderProps> = React.memo(({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  notesCount,
}) => {
  const { t } = useTranslation();
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <header className="px-4 pt-6 pb-2 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t("notes.title")}</h1>
      </div>

      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("notes.searchPlaceholder")}
            className="pl-9 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full h-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full w-9 h-9 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800"
          aria-label={t("notes.filter")}
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={onTabChange} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 h-9 bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs"
          >
            {t("notes.allNotes")}
          </TabsTrigger>
          <TabsTrigger 
            value="todo" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs relative"
          >
            {t("notes.pending")}
            {notesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="math" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs"
          >
            {t("notes.math")}
          </TabsTrigger>
          <TabsTrigger 
            value="arts" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs"
          >
            {t("notes.arts")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
});

NotesHeader.displayName = 'NotesHeader';