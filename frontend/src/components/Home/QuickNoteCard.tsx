import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import type { NoteItem } from "@/api";

interface QuickNoteCardProps {
  note: NoteItem;
  onClick: () => void;
}

const formatDate = (dateStr: string | null | undefined, t: (key: string) => string) => {
  if (!dateStr) return t("common.justNow");
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t("common.today");
    if (days === 1) return t("common.yesterday");
    return `${d.getMonth() + 1}${t("common.month")}${d.getDate()}${t("common.day")}`;
  } catch {
    return t("common.justNow");
  }
};

// 辅助函数：将系统标签转换为国际化标签
const translateTag = (tag: string, t: (key: string) => string) => {
  // 检查多种可能的标签值并将其转换为标准的国际化键
  if (["OCR", "OCR识别"].includes(tag)) {
    return t("notes.ocr");
  } else if (["Audio", "语音"].includes(tag)) {
    return t("notes.voice");
  } else if (["Quick Note", "快速笔记"].includes(tag)) {
    return t("home.quickNote");
  } else {
    return tag;
  }
};

export const QuickNoteCard: React.FC<QuickNoteCardProps> = React.memo(({ note, onClick }) => {
  const { t } = useTranslation();
  const formattedDate = useMemo(() => formatDate(note.created_at, t), [note.created_at, t]);
  
  const monthStr = note.created_at
    ? new Date(note.created_at).toLocaleDateString('zh-CN', { month: 'short' }).replace('月', '')
    : t("common.defaultMonth");
  const dayNum = note.created_at ? new Date(note.created_at).getDate() : t("common.defaultDay");

  return (
    <Card 
      className="bg-white dark:bg-zinc-900 overflow-hidden border-zinc-200 dark:border-zinc-800"
      onClick={onClick}
    >
      <CardContent className="p-4 flex gap-3">
        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-zinc-500 leading-none">{monthStr}</span>
          <span className="text-sm font-black -mt-1 text-zinc-700 dark:text-zinc-300 leading-none">{dayNum}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{note.title}</h3>
          <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
            <span className="flex items-center gap-1">
              <Mic className="h-3 w-3" /> 
              {note.note_type}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex gap-1 mt-2">
            {note.tags?.slice(0, 3).map((tag: string) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
              >
                {translateTag(tag, t)}
              </Badge>
            ))}
          </div>
        </div>
        <Button 
          size="sm" 
          variant="default" 
          className="self-center h-8 text-xs px-3 shadow-none rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {t("home.goOrganize")}
        </Button>
      </CardContent>
    </Card>
  );
});

QuickNoteCard.displayName = 'QuickNoteCard';