import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { useLocation } from "wouter";

export default function MouseFollowerButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
    const [, setLocation] = useLocation();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Offset values to center the button on the cursor
    const BUTTON_WIDTH = 110;
    const BUTTON_HEIGHT = 50;

    const springConfig = { damping: 30, stiffness: 250 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - BUTTON_WIDTH / 2);
            mouseY.set(e.clientY - BUTTON_HEIGHT / 2);

            if (!isVisible) setIsVisible(true);

            const target = e.target as HTMLElement;
            // Hide if hovering over buttons, links, or specific interactive elements
            const isInteractive = !!target.closest('button, a, input, textarea, [role="button"], .interactive-element');
            setIsHoveringInteractive(isInteractive);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [isVisible, mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <motion.div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                x: springX,
                y: springY,
                pointerEvents: isHoveringInteractive ? "none" : "auto",
                zIndex: 9999,
                opacity: isHoveringInteractive ? 0 : 1,
                width: BUTTON_WIDTH,
                height: BUTTON_HEIGHT,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: isHoveringInteractive ? 0.5 : 1,
                opacity: isHoveringInteractive ? 0 : 1
            }}
            onClick={() => {
                if (!isHoveringInteractive) {
                    setLocation("/debate");
                }
            }}
        >
            <div className="w-full h-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary-foreground rounded-full text-[10px] font-black tracking-widest flex items-center justify-center cursor-pointer shadow-2xl hover:bg-primary/20 transition-all duration-300 border-dashed border-2">
                <div className="bg-background/80 px-3 py-1 rounded-full border border-primary/30 uppercase text-orange-500">
                    Start Debate
                </div>
            </div>
        </motion.div>
    );
}
