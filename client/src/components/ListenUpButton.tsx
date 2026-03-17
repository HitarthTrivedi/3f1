import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Headphones, Mic, Play, Pause, Square, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "./DebateFeed";

interface AudioSegment {
    agentName: string;
    agentNumber: number;
    round: number;
    audioBase64: string;
}

interface ListenUpButtonProps {
    messages: Message[];
}

const AGENT_COLORS: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-amber-500",
};

const AGENT_VOICE_LABELS: Record<number, string> = {
    0: "George",
    1: "Henry",
    2: "Kristy",
};

const TTS_CREDIT_COST = 5;

export default function ListenUpButton({ messages }: ListenUpButtonProps) {
    const { user, getIdToken } = useAuth();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const [segments, setSegments] = useState<AudioSegment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isStoppedRef = useRef(false);
    const segmentsRef = useRef<AudioSegment[]>([]);

    const playSegment = useCallback((index: number) => {
        const segs = segmentsRef.current;
        if (index >= segs.length || isStoppedRef.current) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentSegmentIndex(-1);
            setProgress(100);
            return;
        }

        const seg = segs[index];
        setCurrentSegmentIndex(index);
        setProgress(Math.round((index / segs.length) * 100));

        const audio = new Audio(`data:audio/mp3;base64,${seg.audioBase64}`);
        audioRef.current = audio;

        audio.onended = () => {
            if (!isStoppedRef.current) {
                playSegment(index + 1);
            }
        };

        audio.onerror = () => {
            console.warn(`Audio playback error on segment ${index}, skipping...`);
            if (!isStoppedRef.current) {
                playSegment(index + 1);
            }
        };

        audio.play().catch((err) => {
            console.error("Audio play error:", err);
            if (!isStoppedRef.current) {
                playSegment(index + 1);
            }
        });
    }, []);

    const handleListenUp = async () => {
        // Credit check
        if (user && user.credits < TTS_CREDIT_COST && user.freePrompts <= 0) {
            toast({
                title: "Insufficient Credits",
                description: `Listen Up requires ${TTS_CREDIT_COST} credits. Please buy more credits to continue.`,
                variant: "destructive",
            });
            return;
        }

        if (!user) {
            toast({
                title: "Login Required",
                description: "Please login to use Listen Up.",
                variant: "destructive",
            });
            return;
        }

        setError(null);
        setIsGenerating(true);
        setProgress(0);

        try {
            const token = await getIdToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch("/api/tts/generate", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    messages: messages.map((m) => ({
                        agentName: m.agentName,
                        agentNumber: m.agentColor === "blue" ? 0 : m.agentColor === "green" ? 1 : 2,
                        round: m.round,
                        message: m.message,
                    })),
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to generate audio");
            }

            const data = await response.json();
            const audioSegments: AudioSegment[] = data.segments;

            if (!audioSegments || audioSegments.length === 0) {
                throw new Error("No audio segments returned");
            }

            setSegments(audioSegments);
            segmentsRef.current = audioSegments;
            setIsGenerating(false);
            setIsPlaying(true);
            setIsPaused(false);
            isStoppedRef.current = false;

            playSegment(0);
        } catch (err: any) {
            console.error("Listen Up error:", err);
            setError(err.message || "An error occurred");
            setIsGenerating(false);
        }
    };

    const handlePauseResume = () => {
        if (!audioRef.current) return;

        if (isPaused) {
            audioRef.current.play();
            setIsPaused(false);
        } else {
            audioRef.current.pause();
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        isStoppedRef.current = true;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSegmentIndex(-1);
        setProgress(0);
    };

    const currentSeg = currentSegmentIndex >= 0 ? segments[currentSegmentIndex] : null;

    // Not playing / no audio generated yet — show the main button
    if (!isPlaying && !isGenerating) {
        return (
            <div className="space-y-3 flex flex-col items-center sm:items-start">
                <Button
                    onClick={handleListenUp}
                    variant="outline"
                    data-testid="button-listen-up"
                    className="group relative inline-flex items-center justify-center gap-2 md:gap-3 h-14 md:h-20 px-6 md:px-16 rounded-none font-black text-sm md:text-base tracking-widest uppercase border-2 border-foreground bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-4px] translate-y-[-4px] md:translate-x-[-8px] md:translate-y-[-8px] hover:translate-x-0 hover:translate-y-0 w-full md:w-auto"
                >
                    <Headphones className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
                    <span className="relative z-10">Listen Up —</span>
                    <span className="relative z-10 text-[10px] md:text-xs font-bold border-l border-current pl-2 md:pl-3 ml-1 opacity-80">
                        {TTS_CREDIT_COST} Credits
                    </span>
                </Button>
                {error && (
                    <p className="text-[10px] uppercase font-bold tracking-widest text-destructive text-center mt-2">{error}</p>
                )}
            </div>
        );
    }

    // Generating state
    if (isGenerating) {
        return (
            <div className="p-8 border-2 border-foreground bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05] bg-[linear-gradient(rgba(255,102,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Mic className="w-8 h-8 text-primary" />
                </motion.div>
                <div className="text-center z-10">
                    <p className="font-black uppercase text-sm tracking-widest text-foreground">Initializing Sequence</p>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-2">
                        Converting {messages.length} packets to audio
                    </p>
                </div>
                <div className="w-full bg-foreground/10 h-2 overflow-hidden border border-foreground/20 z-10">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "5%" }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 30, ease: "linear" }}
                    />
                </div>
            </div>
        );
    }

    // Playing state
    return (
        <div className="w-full max-w-md mx-auto p-6 md:p-8 border-2 border-foreground bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05] bg-[linear-gradient(rgba(255,102,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
            <div className="space-y-6 relative z-10">
                {/* Now Playing */}
                <AnimatePresence mode="wait">
                    {currentSeg && (
                        <motion.div
                            key={currentSegmentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-4 border border-foreground/10 p-4 bg-foreground/5"
                        >
                            <div className="flex items-center gap-3">
                                {/* Pulsing dot indicating agent color */}
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className={`w-3 h-3 border border-foreground ${currentSeg.agentNumber === 0
                                        ? "bg-blue-500"
                                        : currentSeg.agentNumber === 1
                                            ? "bg-emerald-500"
                                            : "bg-orange-500"
                                        }`}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-black uppercase tracking-widest text-foreground">
                                        {currentSeg.agentName}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                                        Voice: {AGENT_VOICE_LABELS[currentSeg.agentNumber] || "Unknown"} | RND {currentSeg.round}
                                    </p>
                                </div>
                            </div>

                            {/* Waveform animation */}
                            <div className="flex items-end gap-[3px] h-6 ml-auto">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-[4px] bg-primary"
                                        animate={
                                            isPaused
                                                ? { height: 4 }
                                                : {
                                                    height: [4, 12 + Math.random() * 8, 6, 20, 4],
                                                }
                                        }
                                        transition={{
                                            duration: 0.8,
                                            repeat: isPaused ? 0 : Infinity,
                                            delay: i * 0.1,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress bar */}
                <div className="w-full bg-foreground/10 h-2 overflow-hidden border border-foreground/20">
                    <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    <span>Active Stream</span>
                    <span>SEG {currentSegmentIndex + 1}/{segments.length}</span>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center pt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePauseResume}
                        className="rounded-none border-foreground font-black uppercase tracking-widest text-[10px] h-10 px-6 hover:bg-foreground hover:text-background transition-colors"
                    >
                        {isPaused ? (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                            </>
                        ) : (
                            <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleStop}
                        className="rounded-none border-destructive text-destructive font-black uppercase tracking-widest text-[10px] h-10 px-6 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                        <Square className="w-4 h-4 mr-2" />
                        Kill
                    </Button>
                </div>
            </div>
        </div>
    );
}
