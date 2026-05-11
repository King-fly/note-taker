import { useState } from "react";
import { Settings, Cloud, Bell, Trophy, BookOpen, Clock, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Profile() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  
  const [vocabList, setVocabList] = useState([
    { word: "因果", shortcut: "yg" },
    { word: "递进", shortcut: "dj" },
    { word: "转折", shortcut: "zz" },
    { word: "泰勒展开", shortcut: "tl" },
    { word: "牛顿第二定律", shortcut: "nd" },
  ]);
  const [newWord, setNewWord] = useState("");
  const [newShortcut, setNewShortcut] = useState("");

  const handleAddVocab = () => {
    if (!newWord.trim() || !newShortcut.trim()) {
      toast.error("词汇和简写不能为空");
      return;
    }
    if (vocabList.some(v => v.shortcut === newShortcut)) {
      toast.error("简写已存在");
      return;
    }
    setVocabList([{ word: newWord.trim(), shortcut: newShortcut.trim() }, ...vocabList]);
    setNewWord("");
    setNewShortcut("");
    toast.success("已添加词汇");
  };

  const handleRemoveVocab = (shortcut: string) => {
    setVocabList(vocabList.filter(v => v.shortcut !== shortcut));
    toast.success("已删除");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <header className="px-4 pt-6 pb-6 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">我的</h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 p-4 pb-10 overflow-y-auto space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
            W
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">同学 W</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              高二理科生
            </p>
          </div>
          <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 shadow-none">
            Lv.4 达人
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm text-center py-4 bg-white dark:bg-zinc-900">
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">128</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" /> 笔记数
            </div>
          </Card>
          <Card className="border-none shadow-sm text-center py-4 bg-white dark:bg-zinc-900">
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">45<span className="text-sm font-normal">h</span></div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> 专注速记
            </div>
          </Card>
          <Card className="border-none shadow-sm text-center py-4 bg-white dark:bg-zinc-900">
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">12</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" /> 成就徽章
            </div>
          </Card>
        </div>

        {/* Settings List */}
        <Card className="overflow-hidden border-zinc-200">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg dark:bg-blue-900/30">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">云端同步</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">最后同步: 刚刚</div>
                </div>
              </div>
              <Switch defaultChecked onCheckedChange={(c) => toast(c ? "云端同步已开启" : "云端同步已关闭")} />
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg dark:bg-orange-900/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">整理复盘提醒</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">课后1小时及每周晚复盘</div>
                </div>
              </div>
              <Switch defaultChecked onCheckedChange={(c) => toast(c ? "复盘提醒已开启" : "复盘提醒已关闭")} />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 active:bg-zinc-50 cursor-pointer" onClick={() => setIsVocabOpen(true)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg dark:bg-purple-900/30">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">学科词库管理</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">管理快捷打字黑话/简写</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>系统设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">深色模式</span>
              <Switch onCheckedChange={(c) => {
                if (c) {
                  document.documentElement.classList.add("dark");
                  toast.success("已切换深色模式");
                } else {
                  document.documentElement.classList.remove("dark");
                  toast.success("已切换浅色模式");
                }
              }} />
            </div>
            <div className="flex items-center justify-between">
               <span className="text-sm font-medium">护眼模式</span>
               <Switch />
            </div>
            <div className="flex items-center justify-between">
               <span className="text-sm font-medium">仅 WiFi 下自动同步</span>
               <Switch defaultChecked />
            </div>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
               <Button variant="destructive" className="w-full" onClick={() => {toast("已退出登录"); setIsSettingsOpen(false);}}>
                 退出登录
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vocabulary Management Dialog */}
      <Dialog open={isVocabOpen} onOpenChange={setIsVocabOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl p-4 flex flex-col max-h-[80vh]">
          <DialogHeader>
             <DialogTitle>学科词汇快捷输入</DialogTitle>
             <p className="text-xs text-muted-foreground mt-1">设置简写以在打字时快速补全专有名词</p>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 mt-2 pr-1">
             <div className="flex gap-2 items-center mb-4">
                 <Input 
                   placeholder="词汇 (如: 牛顿)" 
                   className="flex-1 h-9" 
                   value={newWord}
                   onChange={e => setNewWord(e.target.value)}
                 />
                 <Input 
                   placeholder="简写 (如: nd)" 
                   className="w-24 h-9" 
                   value={newShortcut}
                   onChange={e => setNewShortcut(e.target.value)}
                 />
                 <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={handleAddVocab}>
                   <Plus className="h-4 w-4" />
                 </Button>
             </div>
             
             <div className="space-y-2">
                {vocabList.map((item) => (
                  <div key={item.shortcut} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="text-sm font-medium">{item.word}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">输入 /{item.shortcut} 触发</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleRemoveVocab(item.shortcut)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
             </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
