import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { NoteItem } from "@/api";

interface NoteCardProps {
  note: NoteItem;
  onClick: (note: NoteItem) => void;
  onOrganize?: (note: NoteItem) => void;
}

const formatDate = (dateStr: string | null | undefined, t: (key: string) => string) => {
  if (!dateStr) return t("notes.justNow");
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t("notes.today");
    if (days === 1) return t("notes.yesterday");
    if (days < 7) return `${days}${t("notes.daysAgo")}`;
    return `${d.getMonth() + 1}${t("notes.month")}${d.getDate()}${t("notes.day")}`;
  } catch {
    return t("notes.justNow");
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

export const NoteCard: React.FC<NoteCardProps> = React.memo(({ note, onClick, onOrganize }) => {
  const { t } = useTranslation();
  const formattedDate = useMemo(() => formatDate(note.created_at, t), [note.created_at, t]);
  
  const handleOrganizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOrganize) {
      onOrganize(note);
    }
  };

  return (
    <Card 
      className="bg-white dark:bg-zinc-900 overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => onClick(note)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate pr-2">{note.title}</h3>
            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {note.subject || t("notes.uncategorized")}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
              {note.template && (
                <>
                  <span>•</span>
                  <span className="text-primary">{note.template === "mindmap" ? t("notes.mindmap") : t("notes.cornell")}</span>
                </>
              )}
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {note.tags?.slice(0, 3).map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-4 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {translateTag(tag, t)}
                </Badge>
              ))}
              {note.tags && note.tags.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          {!note.is_organized && onOrganize && (
            <button
              onClick={handleOrganizeClick}
              className="px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              {t("notes.organizeNote")}
            </button>
          )}
        </div>
        {note.ai_summary && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {note.ai_summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

NoteCard.displayName = 'NoteCard';