import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewProgressProps {
  currentIndex: number;
  totalCards: number;
  isFinished: boolean;
}

export const ReviewProgress: React.FC<ReviewProgressProps> = React.memo(({ 
  currentIndex, 
  totalCards, 
  isFinished 
}) => {
  const { t } = useTranslation();
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-0 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("review.progress")}</span>
            {isFinished && (
              <Badge variant="default" className="text-xs bg-green-600">
                {t("review.completed")}
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
});

ReviewProgress.displayName = 'ReviewProgress';