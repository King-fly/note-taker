import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListTree, FileSpreadsheet } from "lucide-react";

interface NewNoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNote: (template: string) => void;
}

export const NewNoteSheet: React.FC<NewNoteSheetProps> = ({
  open,
  onOpenChange,
  onCreateNote,
}) => {
  const { t } = useTranslation();
  
  const templates = [
    {
      id: "mindmap",
      name: t("notes.mindmap"),
      icon: ListTree,
      description: t("notes.mindmapDesc"),
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: "cornell",
      name: t("notes.cornell"),
      icon: FileSpreadsheet,
      description: t("notes.cornellDesc"),
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  const handleCreate = useCallback((template: string) => {
    onCreateNote(template);
    onOpenChange(false);
  }, [onCreateNote, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger 
        render={
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs rounded-full inline-flex gap-1 border-primary/30 text-primary" 
          />
        }
      >
        + {t("notes.newNote")}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 max-w-md mx-auto h-[60vh]">
        <SheetHeader>
          <SheetTitle className="text-left">{t("notes.selectTemplate")}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="border border-zinc-200 cursor-pointer hover:border-primary transition-colors p-4"
                onClick={() => handleCreate(template.id)}
              >
                <div className={`w-12 h-12 rounded-lg ${template.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${template.color}`} />
                </div>
                <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};