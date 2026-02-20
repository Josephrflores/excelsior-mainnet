"use client";

import React from 'react';

const AdminHero = () => {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
            {/* Content Above Video */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-12 h-1 bg-white mx-auto mb-10 opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse" />
                <h1 className="text-5xl md:text-6xl text-white leading-tight mb-6 tracking-tight px-4">
                    Two tokens. One powerful ecosystem.
                </h1>
                <p className="max-w-2xl text-white text-sm md:text-base tracking-tight leading-relaxed px-4 mx-auto">
                    Interlinking physical commerce with blockchain infrastructure.
                    Monitoring global operations and protocol integrity.
                </p>
            </div>

            {/* Video Container (The "Sun" of our orbit) */}
            <div className="relative w-full h-[500px] rounded-[4rem] overflow-hidden bg-black group border border-white/5 shadow-2xl shadow-primary/5">
                {/* Background Video */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain opacity-80 transition-opacity duration-1000 group-hover:opacity-100"
                >
                    <source src="/assets/videos/hero-background.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 opacity-30" />
            </div>
        </div>
    );
};

export default AdminHero;
