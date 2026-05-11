import { useState } from "react";
import { Search, FileText, Filter, ListTree, MoreHorizontal, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Notes() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const [notes, setNotes] = useState([
    { title: "集合与函数概念", subject: "数学", date: "今天", isOrganized: true, type: "康奈尔" },
    { title: "中国近现代史：五四运动", subject: "历史", date: "昨天", isOrganized: true, type: "思维导图" },
    { title: "物质的量", subject: "化学", date: "周一", isOrganized: false, type: "速记" },
    { title: "Unit 4 核心词汇", subject: "英语", date: "上周", isOrganized: true, type: "单词卡" },
  ]);

  const handleCreateNew = (template: string) => {
    toast.success(`开始使用 ${template} 创建笔记`);
    setIsSheetOpen(false);
    setNotes([{ title: "新笔记草稿", subject: "未分类", date: "刚刚", isOrganized: false, type: template }, ...notes]);
  };

  const filteredNotes = notes.filter(note => {
    // text search
    if (searchQuery && !note.title.includes(searchQuery) && !note.subject.includes(searchQuery)) {
      return false;
    }
    // tab filter
    if (activeTab === "todo" && note.isOrganized) return false;
    if (activeTab === "math" && note.subject !== "数学" && note.subject !== "物理" && note.subject !== "化学") return false;
    if (activeTab === "arts" && note.subject !== "语文" && note.subject !== "英语" && note.subject !== "历史" && note.subject !== "政治") return false;
    
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <header className="px-4 pt-6 pb-2 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">我的笔记</h1>
        </div>
        
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索标题、内容、标签..." 
              className="pl-9 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full h-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="icon" className="rounded-full w-9 h-9 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9 bg-transparent p-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs">全部</TabsTrigger>
            <TabsTrigger value="todo" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs relative">
              待整理
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </TabsTrigger>
            <TabsTrigger value="math" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs">理科</TabsTrigger>
            <TabsTrigger value="arts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-xs">文科</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-muted-foreground">共 {filteredNotes.length} 篇笔记</span>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" className="h-7 text-xs rounded-full inline-flex gap-1 border-primary/30 text-primary" />}>
              + 新建整理
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 max-w-md mx-auto h-[60vh]">
              <SheetHeader>
                <SheetTitle className="text-left">选择整理框架</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card className="border border-zinc-200 cursor-pointer hover:border-primary" onClick={() => handleCreateNew("康奈尔")}>
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-28">
                    <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                    <span className="font-medium text-sm">康奈尔模板</span>
                  </CardContent>
                </Card>
                <Card className="border border-zinc-200 cursor-pointer hover:border-primary" onClick={() => handleCreateNew("思维导图")}>
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-28">
                    <ListTree className="h-8 w-8 text-green-500" />
                    <span className="font-medium text-sm">思维导图</span>
                  </CardContent>
                </Card>
                <Card className="border border-zinc-200 cursor-pointer hover:border-primary" onClick={() => handleCreateNew("理科公式")}>
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-28">
                     <div className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-bold font-mono">x²+y²</div>
                    <span className="font-medium text-sm">理科（公式）</span>
                  </CardContent>
                </Card>
                <Card className="border border-zinc-200 cursor-pointer hover:border-primary" onClick={() => handleCreateNew("文科框架")}>
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-28">
                     <FileText className="h-8 w-8 text-purple-500" />
                    <span className="font-medium text-sm">文科（框架）</span>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-10">空空如也</div>
          ) : filteredNotes.map((note, i) => (
            <Card key={i} className="bg-white dark:bg-zinc-900 overflow-hidden border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedNote(note)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-1 h-12 rounded-full ${note.isOrganized ? 'bg-primary' : 'bg-orange-400'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm truncate flex-1 pr-2">{note.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{note.date}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-normal rounded-sm">
                        {note.subject}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-normal bg-zinc-100 text-zinc-600 dark:bg-zinc-800 rounded-sm">
                        {note.type}
                      </Badge>
                    </div>
                    {note.isOrganized ? (
                      <span className="text-[10px] text-green-600 font-medium">已整理</span>
                    ) : (
                      <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-1.5 rounded cursor-pointer hover:bg-orange-100" onClick={(e) => {
                        e.stopPropagation();
                        const newNotes = [...notes];
                        const idx = newNotes.findIndex(n => n.title === note.title);
                        if(idx >= 0) {
                          newNotes[idx].isOrganized = true;
                          setNotes(newNotes);
                          toast.success("整理完成");
                        }
                      }}>
                        一键整理
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Note Detail Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="max-w-[340px] rounded-2xl p-5 h-[75vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-left leading-tight">{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-2 items-center text-[10px]">
             <span className="text-muted-foreground mr-1">{selectedNote?.date}</span>
             <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{selectedNote?.subject}</Badge>
             <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-zinc-100 dark:bg-zinc-800">{selectedNote?.type}</Badge>
             <Badge variant="default" className={`text-[10px] px-1 py-0 h-4 shadow-none ${selectedNote?.isOrganized ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300" : "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300"}`}>
               {selectedNote?.isOrganized ? "已整理" : "待整理"}
             </Badge>
          </div>
          <ScrollArea className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
             {selectedNote?.type === '思维导图' ? (
                <div className="flex flex-col items-center justify-center p-6 text-muted-foreground h-full min-h-[200px]">
                   <ListTree className="w-12 h-12 mb-3 opacity-20 text-green-600" />
                   <p className="text-xs">思维导图可视化加载中...</p>
                </div>
             ) : selectedNote?.type === '康奈尔' ? (
                <div className="space-y-4">
                  <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
                    <h4 className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1"><Search className="w-3 h-3"/> 线索区 (Cues)</h4>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-zinc-700 dark:text-zinc-300">
                      <li>集合的定义是什么？</li>
                      <li>函数的映射关系？</li>
                    </ul>
                  </div>
                  <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
                    <h4 className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3"/> 笔记区 (Notes)</h4>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      1. 集合是指具有某种特定性质的具体的或抽象的对象汇总而成的集体。<br/>
                      2. 函数：设A，B是非空的数集，如果按照某种确定的对应关系f，使对于集合A中的任意一个数x，在集合B中都有唯一确定的数f(x)和它对应，那么就称f:A→B为从集合A到集合B的一个函数。
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1"><Search className="w-3 h-3"/> 总结区 (Summary)</h4>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      集合是基础，函数是建立在两个特殊集合（数集）之间的一种对应关系。重点理解"唯一确定"。
                    </p>
                  </div>
                </div>
             ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                   {selectedNote?.isOrganized ? "整理后的详细内容...\n\n- 重点一：...\n- 重点二：..." : "这是课堂速记原始内容...\n\n识别到多条零散信息，点击下方按钮一键AI整理成结构化笔记。"}
                </div>
             )}
          </ScrollArea>
          {!selectedNote?.isOrganized && (
            <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
               <Button className="w-full rounded-full shadow-none" onClick={() => {
                 const newNotes = [...notes];
                 const idx = newNotes.findIndex(n => n.title === selectedNote.title);
                 if(idx >= 0) {
                   newNotes[idx].isOrganized = true;
                   setNotes(newNotes);
                   toast.success("AI 智能整理完成 ✨");
                   setSelectedNote({...selectedNote, isOrganized: true});
                 }
               }}>
                 ✨ 一键智能整理
               </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
