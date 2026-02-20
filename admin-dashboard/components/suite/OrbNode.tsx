'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon, Lock } from 'lucide-react';
import { cn } from '../modules/shared';

interface OrbNodeProps {
    href: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    color: string;
    locked?: boolean;
}

const shadowColors: Record<string, string> = {
    blue: 'rgba(59, 130, 246, 0.5)',
    emerald: 'rgba(16, 185, 129, 0.5)',
    purple: 'rgba(168, 85, 247, 0.5)',
    slate: 'rgba(100, 116, 139, 0.5)',
    amber: 'rgba(245, 158, 11, 0.5)',
    pink: 'rgba(236, 72, 153, 0.5)',
    rose: 'rgba(244, 63, 94, 0.5)',
    indigo: 'rgba(99, 102, 241, 0.5)',
};

export const OrbNode = ({ href, icon: Icon, title, subtitle, color, locked }: OrbNodeProps) => {
    const content = (
        <div className={cn(
            "group flex flex-col items-center gap-4 transition-all duration-500",
            locked ? "opacity-30 grayscale cursor-not-allowed" : "cursor-pointer"
        )}>
            <motion.div
                className="flex items-center justify-center transition-all duration-500 relative"
                whileHover={locked ? {} : {
                    filter: `drop-shadow(0 0 35px ${shadowColors[color] || 'rgba(255,255,255,0.4)'})`,
                    scale: 1.12
                }}
            >
                <Icon className="w-14 h-14 text-white transition-colors duration-500" />
                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                )}
            </motion.div>
            <div className="text-center transition-all duration-500">
                <p className="text-sm font-bold text-white tracking-tight whitespace-nowrap">{title}</p>
                <p className="text-[9px] text-white tracking-[0.2em]">{subtitle}</p>
            </div>
        </div>
    );

    if (locked) return content;

    return (
        <Link href={href}>
            {content}
        </Link>
    );
};
