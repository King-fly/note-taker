import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, FileText, ListTree, FileSpreadsheet } from "lucide-react";
import type { NoteItem } from "@/api";

interface NoteContentProps {
  note: NoteItem;
}

export const NoteContent: React.FC<NoteContentProps> = React.memo(({ note }) => {
  const { t } = useTranslation();
  
  const renderMindMapContent = useMemo(() => {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground h-full min-h-[200px]">
        {note.is_organized ? (
          <>
            <ListTree className="w-12 h-12 mb-3 opacity-20 text-green-600" />
            <p className="text-xs">{t("notes.mindmapLoading")}</p>
          </>
        ) : (
          <>
            <ListTree className="w-12 h-12 mb-3 opacity-20 text-green-600" />
            <p className="text-xs">{t("notes.addContentInstruction")}</p>
          </>
        )}
      </div>
    );
  }, [note.is_organized, t]);

  const renderCornellContent = useMemo(() => {
    if (note.content) {
      const lines = note.content.split('\n').filter((l: string) => l.trim());
      const cues = lines.slice(0, 5);
      const notes = lines.slice(5);

      return (
        <div className="space-y-4 p-4">
          <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
            <h4 className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Search className="w-3 h-3" />
              {t("notes.cuesSection")} (Cues)
            </h4>
            <ul className="text-sm space-y-1 list-disc pl-4 text-zinc-700 dark:text-zinc-300">
              {cues.map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
            <h4 className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {t("notes.notesSection")} (Notes)
            </h4>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {notes.join('\n') || note.content}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Search className="w-3 h-3" />
              {t("notes.summarySection")} (Summary)
            </h4>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {note.ai_summary || t("notes.aiSummaryPlaceholder")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground h-full min-h-[200px]">
        <FileSpreadsheet className="w-12 h-12 mb-3 opacity-20 text-blue-500" />
        <p className="text-xs">{t("notes.cornellTemplate")}</p>
        <p className="text-[10px] mt-1 text-center px-4">
          {t("notes.cornellInstruction")}
        </p>
      </div>
    );
  }, [note.content, note.ai_summary, t]);

  const renderDefaultContent = useMemo(() => {
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 p-4">
        {note.content || note.raw_content || t("notes.defaultContent")}
      </div>
    );
  }, [note.content, note.raw_content, t]);

  // 创建一个辅助函数，将API返回的模板名称映射为对应的类型
  const isMindMapTemplate = (template: string | null) => {
    // 映射中文模板名称到对应的标识
    return template === '思维导图' || template === t("notes.mindmap");
  };

  const isCornellTemplate = (template: string | null) => {
    // 映射中文模板名称到对应的标识
    return template === '康奈尔' || template === t("notes.cornell");
  };

  if (isMindMapTemplate(note.template)) {
    return renderMindMapContent;
  }

  if (isCornellTemplate(note.template)) {
    return renderCornellContent;
  }

  return renderDefaultContent;
});

NoteContent.displayName = 'NoteContent';