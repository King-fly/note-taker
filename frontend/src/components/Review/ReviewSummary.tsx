import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles, BrainCircuit } from "lucide-react";

interface ReviewSummaryProps {
  totalCards: number;
  onRestart: () => void;
  onGenerateMore: () => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = React.memo(({
  totalCards,
  onRestart,
  onGenerateMore,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-8 text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary">{t("review.completedTitle")}</h2>
          <p className="text-muted-foreground">
            {t("review.completedDesc", { count: totalCards })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <Button onClick={onRestart} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("review.restart")}
          </Button>
          <Button onClick={onGenerateMore} variant="secondary" className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            {t("review.generateMore")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ReviewSummary.displayName = 'ReviewSummary';