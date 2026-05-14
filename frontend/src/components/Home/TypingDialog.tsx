import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TypingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typedText: string;
  onTextChange: (text: string) => void;
  onSave: () => void;
}

export const TypingDialog: React.FC<TypingDialogProps> = ({
  open,
  onOpenChange,
  typedText,
  onTextChange,
  onSave,
}) => {
  const { t } = useTranslation();
  
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{t("home.quickTypingTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={typedText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={t("home.typingPlaceholder")}
            className="min-h-[300px] bg-zinc-50 dark:bg-zinc-800 resize-none"
            autoFocus
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!typedText.trim()}>
              {t("home.saveQuickNote")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};