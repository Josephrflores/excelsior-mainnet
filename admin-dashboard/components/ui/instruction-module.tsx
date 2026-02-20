
"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface InstructionModuleProps {
    title: string;
    description: string;
    steps: { title: string; content: string }[];
}

export function InstructionModule({ title, description, steps }: InstructionModuleProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-white/5 border-white/10 text-white/60 hover:text-white rounded-full px-4 h-9 text-[11px] font-medium tracking-tight transition-all">
                    <BookOpen className="h-3.5 w-3.5 opacity-40" />
                    Instruction manual
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-[#050507]/90 backdrop-blur-3xl border-l border-white/5 p-8">
                <SheetHeader>
                    <SheetTitle className="text-3xl font-medium text-white tracking-tight">{title}</SheetTitle>
                    <SheetDescription className="text-sm font-medium text-white/40 mt-4 leading-relaxed">
                        {description}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-12 space-y-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative pl-10 border-l border-white/10 pb-10 last:pb-0">
                            <div className="absolute -left-[4.5px] top-1 h-2 w-2 rounded-full bg-white/20" />
                            <h3 className="text-base font-medium text-white tracking-tight mb-3">{step.title}</h3>
                            <div className="text-white/40 text-[11px] font-medium space-y-3 whitespace-pre-wrap leading-relaxed">
                                {step.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-medium text-white tracking-tight flex items-center gap-3">
                        <span className="opacity-40">⚠️</span> Operational safety
                    </h4>
                    <p className="text-[11px] text-white/40 font-medium leading-relaxed">
                        All actions performed in this module are recorded on-chain. ensure you have the necessary role permissions before executing sensitive commands.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
