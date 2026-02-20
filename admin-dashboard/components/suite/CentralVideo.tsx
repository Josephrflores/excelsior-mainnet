'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const CentralVideo = () => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-[85vw] max-w-[1000px] aspect-square flex items-center justify-center p-8 z-10"
    >
        <video
            autoPlay
            muted
            loop
            playsInline
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
        >
            <source src="/assets/videos/hero-background.mp4" type="video/mp4" />
        </video>
    </motion.div>
);
