// Type definitions for UI components
declare module "@/components/ui/button" {
  import React from 'react';
  
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string;
    size?: string;
    children?: React.ReactNode;
  }
  
  export const Button: React.FC<ButtonProps>;
}

declare module "@/components/ui/input" {
  import React from 'react';
  
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
  }
  
  export const Input: React.FC<InputProps>;
}

declare module "@/components/ui/card" {
  import React from 'react';
  
  export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  
  export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  
  export const Card: React.FC<CardProps>;
  export const CardContent: React.FC<CardContentProps>;
}

declare module "@/components/ui/badge" {
  import React from 'react';
  
  export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
  
  export const Badge: React.FC<BadgeProps>;
}

declare module "@/components/ui/scroll-area" {
  import React from 'react';
  
  export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: React.ReactNode;
  }
  
  export const ScrollArea: React.FC<ScrollAreaProps>;
}

declare module "@/components/ui/tabs" {
  import React from 'react';
  
  export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    className?: string;
  }
  
  export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  
  export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    className?: string;
  }
  
  export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    className?: string;
  }
  
  export const Tabs: React.FC<TabsProps>;
  export const TabsList: React.FC<TabsListProps>;
  export const TabsTrigger: React.FC<TabsTriggerProps>;
  export const TabsContent: React.FC<TabsContentProps>;
}

declare module "@/components/ui/sheet" {
  import React from 'react';
  
  export interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }
  
  export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: 'right' | 'left' | 'top' | 'bottom';
    className?: string;
  }
  
  export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  
  export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    className?: string;
  }
  
  export interface SheetTriggerProps {
    render?: React.ReactElement;
    children?: React.ReactNode;
  }
  
  export const Sheet: React.FC<SheetProps>;
  export const SheetContent: React.FC<SheetContentProps>;
  export const SheetHeader: React.FC<SheetHeaderProps>;
  export const SheetTitle: React.FC<SheetTitleProps>;
  export const SheetTrigger: React.FC<SheetTriggerProps>;
}

declare module "@/components/ui/dialog" {
  import React from 'react';
  
  export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }
  
  export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  
  export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  
  export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    className?: string;
  }
  
  export const Dialog: React.FC<DialogProps>;
  export const DialogContent: React.FC<DialogContentProps>;
  export const DialogHeader: React.FC<DialogHeaderProps>;
  export const DialogTitle: React.FC<DialogTitleProps>;
}

declare module "@/components/ui/textarea" {
  import React from 'react';
  
  export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
  }
  
  export const Textarea: React.FC<TextareaProps>;
}

declare module "@/components/ui/switch" {
  import React from 'react';
  
  export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
  }
  
  export const Switch: React.FC<SwitchProps>;
}

declare module "@/components/ui/sonner" {
  import React from 'react';
  
  export interface ToasterProps {
    theme?: 'light' | 'dark' | 'system';
    className?: string;
    position?: string;
  }
  
  export const Toaster: React.FC<ToasterProps>;
}