import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cloud, Bell, BookOpen, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface SettingsListProps {
  onVocabClick: () => void;
  onLogoutClick: () => void;
}

export function SettingsList({ onVocabClick, onLogoutClick }: SettingsListProps) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden border-zinc-200">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg dark:bg-blue-900/30">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t("profile.cloudSync")}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t("profile.lastSync")}</div>
            </div>
          </div>
          <Switch defaultChecked onCheckedChange={(c) => toast(c ? t("profile.syncOn") : t("profile.syncOff"))} />
        </div>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg dark:bg-orange-900/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t("profile.reviewReminder")}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t("profile.reviewReminderDesc")}</div>
            </div>
          </div>
          <Switch defaultChecked onCheckedChange={(c) => toast(c ? t("profile.reminderOn") : t("profile.reminderOff"))} />
        </div>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 active:bg-zinc-50 cursor-pointer" onClick={onVocabClick}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg dark:bg-purple-900/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t("profile.vocabManagement")}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t("profile.vocabManagementDesc")}</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 active:bg-zinc-50 cursor-pointer" onClick={onLogoutClick}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg dark:bg-red-900/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t("profile.logout")}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t("profile.logoutDesc")}</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}