import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

export function SettingsDialog({ open, onOpenChange, onLogout }: SettingsDialogProps) {
  const { t } = useTranslation();
  
  const handleDarkModeToggle = useCallback((checked: boolean) => {
    if (checked) {
      document.documentElement.classList.add("dark");
      toast.success(t("profile.darkModeOn"));
    } else {
      document.documentElement.classList.remove("dark");
      toast.success(t("profile.darkModeOff"));
    }
  }, [t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>{t("profile.settings")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("profile.darkMode")}</span>
            <Switch onCheckedChange={handleDarkModeToggle} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("profile.eyeCare")}</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("profile.wifiOnly")}</span>
            <Switch defaultChecked />
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="destructive" className="w-full" onClick={onLogout}>
              {t("profile.logout")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}