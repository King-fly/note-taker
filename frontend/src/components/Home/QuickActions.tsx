import React from "react";
import { useTranslation } from "react-i18next";
import { Mic, Camera, PenTool, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  isRecording: boolean;
  recordTime: string;
  onRecordToggle: () => void;
  onOpenCamera: () => void;
  onOpenTyping: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = React.memo(({
  isRecording,
  recordTime,
  onRecordToggle,
  onOpenCamera,
  onOpenTyping,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <Button
        variant="outline"
        className={`h-24 flex flex-col items-center justify-center gap-2 border-2 transition-all ${
          isRecording 
            ? "bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-700 shadow-md" 
            : "bg-white dark:bg-zinc-900 hover:border-primary/50 hover:shadow-sm"
        }`}
        onClick={onRecordToggle}
      >
        <div className={`p-2.5 rounded-full transition-colors ${
          isRecording 
            ? "bg-red-100 text-red-600" 
            : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
        }`}>
          {isRecording ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </div>
        <div className="text-center">
          <span className={`block text-sm font-semibold ${isRecording ? "text-red-600" : ""}`}>
            {isRecording ? recordTime : t("home.recordAudio")}
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {isRecording ? t("common.close") : t("home.localWhisper")}
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:border-primary/50 hover:shadow-sm border-2"
        onClick={onOpenCamera}
      >
        <div className="p-2.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
          <Camera className="h-6 w-6" />
        </div>
        <div className="text-center">
          <span className="block text-sm font-semibold">{t("home.takePhoto")}</span>
          <span className="block text-[10px] text-muted-foreground">{t("home.localAIOCR")}</span>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:border-primary/50 hover:shadow-sm border-2"
        onClick={onOpenTyping}
      >
        <div className="p-2.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
          <PenTool className="h-6 w-6" />
        </div>
        <div className="text-center">
          <span className="block text-sm font-semibold">{t("home.typeNote")}</span>
          <span className="block text-[10px] text-muted-foreground">{t("home.vocabulary")}</span>
        </div>
      </Button>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';