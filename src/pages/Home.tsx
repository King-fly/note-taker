import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Camera, FileText, Search, Star, HelpCircle, PenTool, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState("00:00");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [isTypingOpen, setIsTypingOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [transcription, setTranscription] = useState("");
  const [recentNotes, setRecentNotes] = useState([
    { title: "数学分析：泰勒展开", time: "上午 10:30", type: "语音+图片", tags: ["重点", "微积分"] },
    { title: "大学物理：热力学第二定律", time: "昨天 14:00", type: "快速打字", tags: ["公式多"] },
  ]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (isRecording) {
      timerInterval = setInterval(() => {
        setRecordTime((prev) => {
          const [min, sec] = prev.split(":").map(Number);
          const totalSecs = min * 60 + sec + 1;
          const newMin = Math.floor(totalSecs / 60).toString().padStart(2, "0");
          const newSec = (totalSecs % 60).toString().padStart(2, "0");
          return `${newMin}:${newSec}`;
        });
        
        // Simulating live transcription adding text every few seconds
        if (Math.random() > 0.6) {
          setTranscription(prev => prev + " 刚才讲的点很重要...");
        }
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isRecording]);

  const handleRecordToggle = () => {
    if (!isRecording) {
      toast.success("开始课堂录音转写");
      setIsRecording(true);
      setRecordTime("00:01");
      setTranscription("各位同学，我们今天讲...");
    } else {
      toast.info("录音已保存至速记本");
      setIsRecording(false);
      setRecordTime("00:00");
      setRecentNotes([{ title: (transcription.slice(0, 15) || "课堂录音") + "...", time: "刚刚", type: "语音", tags: ["录音"] }, ...recentNotes]);
    }
  };

  const handleAction = (msg: string) => {
    toast(msg);
  };

  const simulateOCR = () => {
    setOcrText("识别中...");
    setTimeout(() => {
      setOcrText("牛顿第二定律\n\nF = m * a\n力等于质量乘以加速度");
      toast.success("识别成功！");
    }, 1500);
  };

  const handleSaveOCR = () => {
    toast.success("已保存到速记本");
    setIsCameraOpen(false);
    setRecentNotes([{ title: "板书识别内容", time: "刚刚", type: "拍照", tags: ["OCR"] }, ...recentNotes]);
    setOcrText("");
  };

  const handleSaveTyping = () => {
    if(!typedText.trim()) return;
    toast.success("已保存速记");
    setIsTypingOpen(false);
    setRecentNotes([{ title: typedText.slice(0, 15) + "...", time: "刚刚", type: "打字", tags: ["速记"] }, ...recentNotes]);
    setTypedText("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">课堂速记</h1>
          <Avatar />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索关键词、知识点..." 
            className="pl-9 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <ScrollArea className="flex-1 p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button 
            variant="outline" 
            className={`h-28 flex flex-col items-center justify-center gap-3 border-2 ${isRecording ? "bg-red-50 border-red-200 dark:bg-red-950/30" : "bg-white dark:bg-zinc-900 hover:border-primary/50"}`}
            onClick={handleRecordToggle}
          >
            <div className={`p-3 rounded-full ${isRecording ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"}`}>
              {isRecording ? <div className="h-6 w-6 rounded-sm bg-red-600 animate-pulse" /> : <Mic className="h-6 w-6" />}
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">{isRecording ? recordTime : "语音转写"}</span>
              <span className="block text-[10px] text-muted-foreground">{isRecording ? "点击结束" : "实时识别中英"}</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-28 flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 hover:border-primary/50 border-2"
            onClick={() => setIsCameraOpen(true)}
          >
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
              <Camera className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">拍照OCR</span>
              <span className="block text-[10px] text-muted-foreground">提取板书/PPT</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-28 flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 hover:border-primary/50 border-2"
            onClick={() => setIsTypingOpen(true)}
          >
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
              <PenTool className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">快捷打字</span>
              <span className="block text-[10px] text-muted-foreground">学科词汇预测</span>
            </div>
          </Button>
        </div>

        {/* Live Marking (Only visible when recording) */}
        {isRecording && (
           <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 animate-in slide-in-from-top-4 flex flex-col pt-3">
             <ScrollArea className="h-24 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                {transcription}
             </ScrollArea>
             <CardContent className="p-3 mt-2 border-t border-blue-200/50 dark:border-blue-900/50 flex items-center justify-around">
                <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-4 gap-1 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700" onClick={() => handleAction("已打星标")}>
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-[10px]">考点</span>
                </Button>
                <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-4 gap-1 text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => handleAction("已打问号")}>
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-[10px]">没听懂</span>
                </Button>
                <Button size="sm" variant="ghost" className="flex flex-col h-auto py-2 px-4 gap-1 text-purple-600 hover:bg-purple-100 hover:text-purple-700" onClick={() => { handleAction("抓拍黑板"); simulateOCR(); setIsCameraOpen(true); }}>
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px]">插图</span>
                </Button>
             </CardContent>
           </Card>
        )}

        {/* Recent Quick Notes */}
        <div className="flex justify-between items-end mb-3 mt-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">近期速记 (未整理)</h2>
          <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => navigate('/notes')}>查看全部</Button>
        </div>

        <div className="space-y-3">
          {recentNotes
            .filter((n: any) => !searchQuery || n.title.includes(searchQuery) || n.tags.join().includes(searchQuery))
            .map((note: any, i: number) => (
            <Card key={i} className="bg-white dark:bg-zinc-900 overflow-hidden border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-zinc-500">10月</span>
                  <span className="text-sm font-black -mt-1 text-zinc-700 dark:text-zinc-300">2{i+4}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{note.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                    <span className="flex items-center gap-1"><Mic className="h-3 w-3"/> {note.type}</span>
                    <span>•</span>
                    <span>{note.time}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {note.tags.map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">{t}</Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" variant="default" className="self-center h-8 text-xs px-3 shadow-none rounded-full" onClick={() => navigate('/notes')}>
                  去整理
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Camera OCR Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => {setIsCameraOpen(open); if(!open) setOcrText("");}}>
         <DialogContent className="max-w-[340px] rounded-2xl p-4">
           <DialogHeader>
             <DialogTitle>拍照识别板书</DialogTitle>
           </DialogHeader>
           <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl relative flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden">
             {!ocrText ? (
                <div className="text-center text-muted-foreground text-sm cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" onClick={simulateOCR}>
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  点击模拟拍摄
                </div>
             ) : (
                <div className="absolute inset-0 p-4">
                  <img src="https://images.unsplash.com/photo-1633519808465-4f76aa0e9e7b?w=400&q=80" alt="Blackboard" className="w-full h-full object-cover rounded-lg opacity-40 absolute inset-0 mix-blend-overlay" />
                  <ScrollArea className="h-full z-10 relative">
                     <div className="text-sm font-mono whitespace-pre-wrap">{ocrText}</div>
                  </ScrollArea>
                </div>
             )}
           </div>
           {ocrText && (
             <Button className="w-full mt-2" onClick={handleSaveOCR}>
               提现至速记本
             </Button>
           )}
         </DialogContent>
      </Dialog>

      {/* Quick Typing Dialog */}
      <Dialog open={isTypingOpen} onOpenChange={setIsTypingOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl p-4 flex flex-col gap-3">
          <DialogHeader>
             <DialogTitle>分秒必争，快捷打字</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 pb-1 overflow-x-auto">
             {["因果", "递进", "转折", "公式", "举例"].map(word => (
               <Badge key={word} variant="secondary" className="cursor-pointer whitespace-nowrap" onClick={() => setTypedText(prev => prev + `【${word}】`)}>
                 {word}
               </Badge>
             ))}
          </div>
          <Textarea 
             className="min-h-[160px] text-base resize-none"
             placeholder="正在输入..."
             value={typedText}
             onChange={e => setTypedText(e.target.value)}
             autoFocus
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSaveTyping} className="rounded-full shadow-none" size="sm">
              <Send className="w-4 h-4 mr-2" /> 保存速记
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function Avatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
      W
    </div>
  );
}
