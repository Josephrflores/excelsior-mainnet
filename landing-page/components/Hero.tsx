'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface HeroProps {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
}

export const Hero = ({ eyebrow, title, subtitle, ctaText, ctaLink }: HeroProps) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 px-4 md:px-[5cm]">
            {/* Background Overlay */}
            <div className="absolute inset-0 hero-overlay pointer-events-none z-0" />

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    {/* Eyebrow */}
                    <span className="text-lg md:text-xl font-medium uppercase tracking-[0.2em] text-white/80 mb-6 font-sans">
                        {eyebrow}
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl md:text-7xl font-medium text-white mb-8 tracking-tighter leading-[1.05] font-sans">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/60 mb-12 max-w-3xl mx-auto tracking-tight font-medium font-sans">
                        {subtitle}
                    </p>

                    {/* Primary Button */}
                    <Link
                        href={ctaLink}
                        className="group relative px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-medium text-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-3 active:scale-95"
                    >
                        {ctaText}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />

                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-full bg-primary-glow/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
