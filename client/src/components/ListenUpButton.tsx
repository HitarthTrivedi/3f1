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
            <div className="space-y-3">
                <button
                    onClick={handleListenUp}
                    data-testid="button-listen-up"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm tracking-wide text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                        background: "linear-gradient(135deg, hsl(263, 70%, 50%) 0%, hsl(240, 60%, 55%) 50%, hsl(263, 55%, 40%) 100%)",
                        boxShadow: "0 4px 24px -4px hsla(263, 70%, 50%, 0.35), 0 1px 3px hsla(0, 0%, 0%, 0.1), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)",
                    }}
                >
                    {/* Subtle shimmer on hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                    <Headphones className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Listen Up</span>
                    <span className="relative z-10 text-white/60 text-xs font-normal border-l border-white/20 pl-3 ml-1">
                        {TTS_CREDIT_COST} Credits
                    </span>
                </button>
                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}
            </div>
        );
    }

    // Generating state
    if (isGenerating) {
        return (
            <Card className="p-6 border-violet-500/20" style={{
                background: "linear-gradient(135deg, hsla(263, 70%, 50%, 0.08) 0%, hsla(240, 60%, 55%, 0.06) 100%)",
            }}>
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Mic className="w-7 h-7 text-violet-400" />
                    </motion.div>
                    <div className="text-center">
                        <p className="font-semibold text-sm">Generating voices...</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Converting {messages.length} messages to speech
                        </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(90deg, hsl(263, 70%, 55%), hsl(240, 60%, 55%))" }}
                            initial={{ width: "5%" }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 30, ease: "linear" }}
                        />
                    </div>
                </div>
            </Card>
        );
    }

    // Playing state
    return (
        <Card className="p-6 border-violet-500/20" style={{
            background: "linear-gradient(135deg, hsla(263, 70%, 50%, 0.08) 0%, hsla(240, 60%, 55%, 0.06) 100%)",
        }}>
            <div className="space-y-4">
                {/* Now Playing */}
                <AnimatePresence mode="wait">
                    {currentSeg && (
                        <motion.div
                            key={currentSegmentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3"
                        >
                            {/* Pulsing dot */}
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentSeg.agentNumber === 0
                                    ? AGENT_COLORS.blue
                                    : currentSeg.agentNumber === 1
                                        ? AGENT_COLORS.green
                                        : AGENT_COLORS.orange
                                    }`}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    {currentSeg.agentName}{" "}
                                    <span className="text-xs text-muted-foreground font-normal">
                                        — Voice: {AGENT_VOICE_LABELS[currentSeg.agentNumber] || "Unknown"} · Round {currentSeg.round}
                                    </span>
                                </p>
                            </div>
                            {/* Waveform animation */}
                            <div className="flex items-end gap-[2px] h-5">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-[3px] bg-violet-500 rounded-full"
                                        animate={
                                            isPaused
                                                ? { height: 4 }
                                                : {
                                                    height: [4, 12 + Math.random() * 8, 6, 16, 4],
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
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, hsl(263, 70%, 55%), hsl(240, 60%, 55%))" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    Segment {currentSegmentIndex + 1} of {segments.length}
                </p>

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePauseResume}
                        className="min-w-[100px] gap-2"
                    >
                        {isPaused ? (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                Resume
                            </>
                        ) : (
                            <>
                                <Pause className="w-3.5 h-3.5" />
                                Pause
                            </>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleStop}
                        className="min-w-[100px] gap-2"
                    >
                        <Square className="w-3.5 h-3.5" />
                        Stop
                    </Button>
                </div>
            </div>
        </Card>
    );
}
