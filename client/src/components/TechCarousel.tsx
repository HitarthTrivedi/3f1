import React from "react";
import { motion } from "framer-motion";
import {
    Atom,
    Zap,
    Wind,
    Box,
    Database,
    Server,
    Cpu,
    Layers
} from "lucide-react";

const technologies = [
    { name: "React", icon: Atom, color: "text-blue-400" },
    { name: "Vite", icon: Zap, color: "text-yellow-400" },
    { name: "Tailwind", icon: Wind, color: "text-cyan-400" },
    { name: "Framer", icon: Layers, color: "text-pink-400" },
    { name: "Drizzle", icon: Database, color: "text-emerald-400" },
    { name: "Express", icon: Server, color: "text-gray-400" },
    { name: "TypeScript", icon: Cpu, color: "text-blue-500" },
    { name: "Lucide", icon: Box, color: "text-orange-400" },
];

export const TechCarousel = () => {
    return (
        <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden perspective-1000">
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                {/* Animated Carousel Container */}
                <motion.div
                    className="flex gap-8 md:gap-16"
                    animate={{
                        x: [-1600, 0],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                    style={{ width: "fit-content" }}
                >
                    {/* Double the list for infinite scroll effect */}
                    {[...technologies, ...technologies, ...technologies].map((tech, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center justify-center min-w-[120px] md:min-w-[180px] group"
                        >
                            <div className="relative p-6 md:p-10 border border-foreground/10 bg-background/50 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300">
                                {/* Corner markers */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />

                                <tech.icon className={`w-10 h-10 md:w-16 md:h-16 ${tech.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                            </div>
                            <span className="mt-4 text-[10px] uppercase font-black tracking-[0.3em] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Fade Overlays */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
    );
};
