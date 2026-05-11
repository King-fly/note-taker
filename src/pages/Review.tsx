import { useState } from "react";
import { BrainCircuit, ChevronRight, ChevronLeft, Check, X, RotateCcw, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Review() {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const flashcards = [
    { question: "牛顿第二定律公式是什么？", answer: "F = ma\n力等于质量乘以加速度。", tags: ["物理", "公式"], difficulty: "easy" },
    { question: "什么是光电效应？", answer: "光照射在金属表面时，金属中的电子吸收光子的能量而逸出表面的现象。", tags: ["物理", "概念"], difficulty: "medium" },
    { question: "五四运动的导火线是什么？", answer: "巴黎和会上中国外交的失败。", tags: ["历史", "事件"], difficulty: "hard" },
  ];

  const handleAssessment = (assessment: "easy" | "hard") => {
    toast.success(assessment === "easy" ? "已掌握，继续保持！" : "已将该卡片加入重点复习");
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 >= flashcards.length) {
        setIsFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 150);
  };

  const currentCard = flashcards[currentIndex];

  if (isFinished) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 items-center justify-center p-6">
         <div className="bg-primary/10 p-6 rounded-full mb-6">
           <Trophy className="w-16 h-16 text-primary" />
         </div>
         <h1 className="text-2xl font-bold mb-2">今日复盘完成！</h1>
         <p className="text-muted-foreground text-center text-sm mb-8">你复习了 {flashcards.length} 张卡片，知识点掌握更牢固了。</p>
         <Button onClick={() => { setIsFinished(false); setCurrentIndex(0); setFlipped(false); }} className="rounded-full px-8">
            再次复习
         </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <header className="px-4 pt-6 pb-4 bg-white dark:bg-zinc-900 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            碎片复盘
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-1.5 h-5 flex items-center shadow-none text-[10px]">
              <Flame className="w-3 h-3 mr-0.5 fill-current" /> 连续 3 天
            </Badge>
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">今天还有 {flashcards.length - currentIndex} 张卡片待复习</p>
      </header>

      <div className="flex-1 p-6 flex flex-col justify-center max-w-sm mx-auto w-full relative">
        <div className="mb-4 flex justify-between items-center text-xs text-muted-foreground">
          <span>进度: {currentIndex + 1} / {flashcards.length}</span>
          <div className="flex gap-1">
            {currentCard.tags.map(t => (
              <Badge key={t} variant="outline" className="text-[10px] h-4 py-0 font-normal">{t}</Badge>
            ))}
          </div>
        </div>

        {/* Flashcard */}
        <div 
          className="relative h-80 w-full perspective-1000 cursor-pointer group"
          onClick={() => setFlipped(!flipped)}
        >
          <div className={`w-full h-full transition-transform duration-500 preserve-3d relative ${flipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <Card className="absolute w-full h-full backface-hidden bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center p-8 text-center">
              <span className="text-muted-foreground text-xs absolute top-4 left-4">Q.</span>
              <h2 className="text-lg font-medium leading-relaxed">{currentCard.question}</h2>
              <p className="text-xs text-muted-foreground absolute bottom-4 animate-pulse">点击翻转查看答案</p>
            </Card>

            {/* Back */}
            <Card className="absolute w-full h-full backface-hidden rotate-y-180 bg-primary/5 border-2 border-primary/20 shadow-sm flex flex-col justify-center items-center p-8 text-center">
              <span className="text-primary/60 text-xs absolute top-4 left-4 font-bold">A.</span>
              <p className="text-base font-medium whitespace-pre-wrap leading-relaxed">{currentCard.answer}</p>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 gap-3 flex justify-center">
           <Button 
            variant="destructive" 
            size="lg"
            className={`rounded-full flex-1 bg-red-100 hover:bg-red-200 text-red-600 shadow-sm transition-opacity ${!flipped ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleAssessment("hard"); }}
           >
            <X className="h-5 w-5 mr-1" /> 没记住
          </Button>
          <Button 
            variant="default" 
            size="lg"
            className={`rounded-full flex-1 bg-green-100 hover:bg-green-200 text-green-600 shadow-sm transition-opacity ${!flipped ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleAssessment("easy"); }}
           >
            <Check className="h-5 w-5 mr-1" /> 已掌握
          </Button>
        </div>
        {!flipped && <div className="text-center mt-3 text-[10px] text-muted-foreground h-4"></div>}
        {flipped && <div className="text-center mt-3 text-[10px] text-muted-foreground h-4 animate-in fade-in">请评估你的掌握程度</div>}
      </div>
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
