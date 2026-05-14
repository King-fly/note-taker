import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BrainCircuit, ChevronLeft, ChevronRight, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getDueFlashcards, assessFlashcard, type FlashcardItem } from "@/api";
import { 
  FlashCardDisplay, 
  ReviewProgress, 
  GenerateFlashcardsDialog,
  ReviewSummary 
} from "@/components/Review";

export default function Review() {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDialogOpen, setIsGeneratingDialogOpen] = useState(false);

  // Memoize current card and hasCards
  const currentCard = useMemo(() => {
    return flashcards[currentIndex];
  }, [flashcards, currentIndex]);

  const hasCards = useMemo(() => {
    return flashcards.length > 0;
  }, [flashcards]);

  // Load flashcards from API
  const loadFlashcards = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFlipped(false);
    setCurrentIndex(0);
    setIsFinished(false);
    try {
      const res = await getDueFlashcards();
      if (res.items.length === 0) {
        toast.info(t("review.noDueCards"));
      } else {
        setFlashcards(res.items);
      }
    } catch (err: any) {
      console.error("Failed to load flashcards:", err);
      setError(err.message || t("errors.serverError"));
      setFlashcards([]);
      toast.error(err.message || t("errors.serverError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  // Handle assessment
  const handleAssessment = useCallback(async (assessment: "easy" | "hard") => {
    if (!currentCard) return;

    try {
      const apiDifficulty: "easy" | "medium" = assessment === "easy" ? "easy" : "medium";
      await assessFlashcard(currentCard.id, apiDifficulty);

      if (assessment === "easy") {
        toast.success(t("review.correct"));
      } else {
        toast.info(t("review.markHard"));
      }

      setFlipped(false);
      setTimeout(() => {
        if (currentIndex + 1 >= flashcards.length) {
          setIsFinished(true);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 200);
    } catch (err: any) {
      toast.error(err.message || t("errors.serverError"));
    }
  }, [currentCard, currentIndex, flashcards.length, t]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, flashcards.length]);

  const handleFlip = useCallback(() => {
    setFlipped(prev => !prev);
  }, []);

  const handleRestart = useCallback(() => {
    setIsFinished(false);
    setCurrentIndex(0);
    setFlipped(false);
    loadFlashcards();
  }, [loadFlashcards]);

  const handleGenerateMore = useCallback(() => {
    setIsGeneratingDialogOpen(true);
  }, []);

  const handleGenerated = useCallback(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <header className="px-4 pt-6 pb-2 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            {t("review.title")}
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs rounded-full"
            onClick={() => setIsGeneratingDialogOpen(true)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {t("review.generateFlashcards")}
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">{t("common.loading")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={loadFlashcards}>
                  {t("common.back")}
                </Button>
              </div>
            </div>
          ) : !hasCards ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4 max-w-md">
                <BrainCircuit className="w-16 h-16 mx-auto text-muted-foreground/30" />
                <div>
                  <h3 className="font-medium mb-2">{t("review.noCards")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("review.selectNote")}
                  </p>
                </div>
                <Button onClick={handleGenerateMore}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("review.generateFlashcards")}
                </Button>
              </div>
            </div>
          ) : isFinished ? (
            <ReviewSummary
              totalCards={flashcards.length}
              onRestart={handleRestart}
              onGenerateMore={handleGenerateMore}
            />
          ) : (
            <div className="space-y-6">
              <ReviewProgress
                currentIndex={currentIndex}
                totalCards={flashcards.length}
                isFinished={isFinished}
              />

              <FlashCardDisplay
                card={currentCard}
                flipped={flipped}
                onFlip={handleFlip}
              />

              {flipped && (
                <div className="flex gap-3 justify-center max-w-md mx-auto w-full">
                  <Button
                    onClick={() => handleAssessment("hard")}
                    variant="outline"
                    className="flex-1 h-14 text-lg font-medium"
                  >
                    <X className="w-5 h-5 mr-2" />
                    {t("review.markHard")}
                  </Button>
                  <Button
                    onClick={() => handleAssessment("easy")}
                    className="flex-1 h-14 text-lg font-medium bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {t("review.markEasy")}
                  </Button>
                </div>
              )}

              {!flipped && (
                <div className="flex justify-between items-center max-w-md mx-auto w-full text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t("common.back")}
                  </Button>
                  <span>{t("review.flip")}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === flashcards.length - 1}
                  >
                    {t("common.next")}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <GenerateFlashcardsDialog
        open={isGeneratingDialogOpen}
        onOpenChange={setIsGeneratingDialogOpen}
        onGenerated={handleGenerated}
      />
    </div>
  );
}