import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraPreview: string | null;
  cameraError: string | null;
  isCapturing: boolean;
  isAnalyzing: boolean;
  ocrText: string;
  onStartCamera: () => void;
  onCapturePhoto: () => void;
  onResetCamera: () => void;
  onSaveOCR: () => void;
  onOCRResult: (text: string) => void;
}

export const CameraDialog: React.FC<CameraDialogProps> = ({
  open,
  onOpenChange,
  videoRef,
  cameraPreview,
  cameraError,
  isCapturing,
  isAnalyzing,
  ocrText,
  onStartCamera,
  onCapturePhoto,
  onResetCamera,
  onSaveOCR,
  onOCRResult,
}) => {
  const { t } = useTranslation();
  
  const handleReanalyze = async () => {
    if (!cameraPreview || isAnalyzing) return;
    toast.info(t("home.recognizing"));
    try {
      const { extractTextFromImage } = await import("@/api");
      const result = await extractTextFromImage(cameraPreview);
      onOCRResult(result.text);
      toast.success(t("home.recognitionComplete"));
    } catch (err: any) {
      toast.error(err.message || t("home.recognitionFailed"));
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const showLivePreview = cameraPreview === "live";
  const showCapturedImage = cameraPreview && cameraPreview !== "live";
  const showPlaceholder = !cameraPreview && !cameraError;
  const showError = cameraError && !cameraPreview;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[360px] rounded-2xl p-4 gap-3">
        <DialogHeader className="pb-1">
          <DialogTitle>{t("home.photoRecognitionTitle")}</DialogTitle>
        </DialogHeader>

        <div className="relative rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-900" style={{ aspectRatio: "4/3" }}>
          {showLivePreview && (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 border-4 border-white/20 pointer-events-none" />
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mb-2" />
                  <span className="text-sm text-white font-medium">{t("home.aiRecognition")}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-14 w-14 bg-white/90 hover:bg-white text-zinc-900 shadow-lg disabled:opacity-50"
                  onClick={onCapturePhoto}
                  disabled={isCapturing || isAnalyzing}
                >
                  <div className="w-10 h-10 rounded-full border-[3px] border-zinc-400" />
                </Button>
              </div>
            </>
          )}

          {showCapturedImage && (
            <>
              <img src={cameraPreview} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mb-2" />
                  <span className="text-sm text-white font-medium">{t("home.aiRecognition")}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-4 h-9 shadow-lg bg-white/90 hover:bg-white"
                  onClick={onResetCamera}
                  disabled={isAnalyzing}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  {t("home.retake")}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full px-4 h-9 shadow-lg bg-primary hover:bg-primary/90"
                  onClick={handleReanalyze}
                  disabled={isAnalyzing}
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {isAnalyzing ? t("home.recognizing") : t("home.recognize")}
                </Button>
              </div>
            </>
          )}

          {showError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <X className="w-12 h-12 text-red-400 mb-3" />
              <p className="text-sm text-zinc-400 mb-4">{cameraError}</p>
              <Button variant="secondary" size="sm" className="rounded-full" onClick={onStartCamera}>
                {t("home.retry")}
              </Button>
            </div>
          )}

          {showPlaceholder && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-400 mb-4">{t("home.captureBoardInstruction")}</p>
              <Button className="rounded-full px-6" onClick={onStartCamera}>
                {t("home.openCamera")}
              </Button>
            </div>
          )}
        </div>

        {ocrText && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t("home.recognitionResult")}
              </label>
              <Textarea
                value={ocrText}
                onChange={(e) => onOCRResult(e.target.value)}
                className="min-h-[100px] bg-zinc-50 dark:bg-zinc-800 resize-none text-sm"
                placeholder={t("home.modifyContentPlaceholder")}
              />
            </div>
            <Button className="w-full rounded-full" onClick={onSaveOCR}>
              {t("home.saveToNotes")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};