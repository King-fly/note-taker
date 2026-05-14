import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Star, HelpCircle, Camera, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface RecordingCardProps {
  transcription: string;
  isTranscribing?: boolean;
  onOpenCamera: () => void;
  onStopRecording: () => void;
}

export const RecordingCard: React.FC<RecordingCardProps> = React.memo(({ transcription, isTranscribing, onOpenCamera, onStopRecording }) => {
  const { t } = useTranslation();
  
  const handleMarkPoint = () => {
    toast.success(t("home.markedAsKeyPoint"));
  };

  const handleMarkUnclear = () => {
    toast.success(t("home.markedAsUnclear"));
  };

  const handlePlayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(transcription);
    utterance.lang = "zh-CN";
    speechSynthesis.speak(utterance);
    toast.success(t("home.playingAudio"));
  };

  return (
    <Card className="mb-4 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 dark:border-red-900 animate-pulse-subtle">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-red-200/50 dark:border-red-900/50">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-medium text-red-600 dark:text-red-400">{t("home.transcribing")}</span>
        {isTranscribing && (
          <span className="text-xs text-muted-foreground ml-auto">{t("home.processing")}</span>
        )}
      </div>
      <ScrollArea className="h-20 px-4 py-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {transcription}
        </p>
      </ScrollArea>
      <div className="flex items-center justify-around p-2 border-t border-red-200/50 dark:border-red-900/50">
        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-3 gap-1 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-900/30" onClick={handleMarkPoint}>
          <Star className="h-5 w-5 fill-current" />
          <span className="text-[10px]">{t("home.keyPoint")}</span>
        </Button>
        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-3 gap-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30" onClick={handlePlayAudio}>
          <Volume2 className="h-5 w-5" />
          <span className="text-[10px]">{t("home.readAloud")}</span>
        </Button>
        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-3 gap-1 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30" onClick={handleMarkUnclear}>
          <HelpCircle className="h-5 w-5" />
          <span className="text-[10px]">{t("home.notUnderstood")}</span>
        </Button>
        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-3 gap-1 text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30" onClick={onOpenCamera}>
          <Camera className="h-5 w-5" />
          <span className="text-[10px]">{t("home.illustration")}</span>
        </Button>
        <Button size="sm" variant="destructive" className="flex flex-col h-auto py-2 px-3 gap-1" onClick={onStopRecording}>
          <span className="text-xs font-medium">{t("home.end")}</span>
          <span className="text-[10px] opacity-80">{t("home.save")}</span>
        </Button>
      </div>
    </Card>
  );
});

RecordingCard.displayName = 'RecordingCard';