import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  note_id?: string;
  difficulty?: string;
  created_at?: string;
}

interface FlashCardDisplayProps {
  card: FlashcardItem | null;
  flipped: boolean;
  onFlip: () => void;
}

export const FlashCardDisplay: React.FC<FlashCardDisplayProps> = React.memo(({ card, flipped, onFlip }) => {
  const { t } = useTranslation();
  
  const displayContent = useMemo(() => {
    if (!card) return null;
    return {
      front: card.question || t("review.noQuestion"),
      back: card.answer || t("review.noAnswer"),
    };
  }, [card, t]);

  if (!card || !displayContent) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 shadow-lg border-0">
        <CardContent className="p-8 min-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">{t("review.noFlashcards")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 shadow-lg border-0 cursor-pointer hover:shadow-xl transition-all duration-300 min-h-[300px] flex items-center justify-center"
      onClick={onFlip}
    >
      <CardContent className="p-8 w-full">
        <div className="text-center space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {flipped ? t("review.answer") : t("review.question")}
          </div>
          <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap break-words">
            {flipped ? displayContent.back : displayContent.front}
          </p>
          <div className="text-xs text-muted-foreground mt-4">
            {t("review.flipHint", { type: flipped ? t("review.question") : t("review.answer") })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FlashCardDisplay.displayName = 'FlashCardDisplay';