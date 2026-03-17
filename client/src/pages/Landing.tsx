import { motion } from "framer-motion";
import { HeroScene } from "@/components/HeroScene";
import { AgentVisual } from "@/components/AgentVisual";
import { Footer } from "@/components/Footer";
import DebateTopicInput from "@/components/DebateTopicInput";
import { TechCarousel } from "@/components/TechCarousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useLocation } from "wouter";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const [topic, setTopic] = useState("");
  const [, setLocation] = useLocation();

  const handleStartDebate = () => {
    if (topic.trim()) {
      setLocation(`/debate?topic=${encodeURIComponent(topic)}`);
    } else {
      setLocation("/debate");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">
      {/* Navigation / Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <div className="text-xl font-black font-logo tracking-tight">3F1</div>
        </div>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Global Background Infrastructure */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-1/4 left-10 text-[10px] font-black tracking-widest vertical-text select-none"><span className="font-logo">3F1</span>.PROTO // SECTOR_01</div>
        <div className="absolute top-3/4 right-10 text-[10px] font-black tracking-widest vertical-text select-none"><span className="font-logo">3F1</span>.PROTO // SECTOR_02</div>

        {/* Vertical lines that span full height */}
        <div className="absolute inset-y-0 left-[10%] w-px bg-foreground" />
        <div className="absolute inset-y-0 left-[90%] w-px bg-foreground" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-foreground" />
      </div>

      {/* SECTION 1: HERO */}
      <div className="relative z-10">
        <HeroScene />
      </div>

      {/* SECTION 2: THE DEMO (GENERATIVE UI IN ACTION) */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-40 px-6 border-b border-foreground/10 bg-background z-10 overflow-hidden"
      >
        {/* Background Coordinate Marker */}
        <div className="absolute top-10 right-10 text-[9px] font-black tracking-[0.4em] opacity-10 select-none">
          [COORD: 02:44:A]
        </div>

        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1 border border-primary/20 text-[10px] uppercase font-black tracking-[0.3em] text-primary bg-primary/5 mb-4">
              Module: Real-time // Interaction
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] break-words">
              Triadic <br /><span className="text-primary italic">Dialectic</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-70">
              Engage high-performance agentic reasoning through structured conflict and synthesis. <br />
              <span className="text-foreground">Initialize the <span className="font-logo">3F1</span> protocol below.</span>
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-xl" />
            <div className="relative p-6 md:p-10 lg:p-16 border-2 border-foreground bg-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] md:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] md:dark:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)] transition-all mx-2 md:mx-0">
              <div className="absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 border-l-4 border-t-4 border-primary opacity-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 md:w-12 md:h-12 border-r-4 border-b-4 border-primary opacity-20" />

              <DebateTopicInput
                topic={topic}
                onTopicChange={setTopic}
                onStartDebate={handleStartDebate}
                isDebating={false}
                startButtonText="Execute Synthesis —"
              />
            </div>

            <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-3 md:gap-4">
              {["Travel Hidden Gems", "Stocks to Watch", "Football Legends", "Global Street Food"].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  onClick={() => setTopic(tag)}
                  className="rounded-none border-foreground/20 px-4 py-2 md:px-6 md:py-3 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer bg-background"
                >
                  {tag} // 0X
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: HOW IT WORKS (SPLIT SCREEN) */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-48 px-6 border-b border-foreground/10 bg-foreground text-background z-10 overflow-hidden"
      >
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/2 inset-x-0 h-px bg-background" />
          <div className="absolute left-1/2 inset-y-0 w-px bg-background" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center relative z-10">
          <div className="space-y-12 md:space-y-16">
            <div className="space-y-6 md:space-y-8">
              <div className="text-[10px] uppercase font-black tracking-[0.5em] text-primary">System Architecture</div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] break-words">
                Neural <br /><span className="text-primary italic">Dialectic</span>
              </h2>
              <p className="text-xl md:text-2xl text-background/60 font-medium max-w-lg leading-relaxed">
                <span className="font-logo">3F1</span> orchestrates structured tension between three distinct intelligence factions to distill objective truth.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { label: "Analyst", desc: "Data extraction & logical structuring" },
                { label: "Critic", desc: "Anomaly detection & cross-verification" },
                { label: "Synthesizer", desc: "UI state generation & optimization" }
              ].map((agent, i) => (
                <div key={agent.label} className="group border border-background/10 p-8 flex items-center justify-between hover:border-primary/50 hover:bg-background/5 transition-all cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-primary opacity-50">UNIT_0{i + 1}</span>
                      <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">
                        {agent.label}
                      </h3>
                    </div>
                    <p className="text-xs text-background/40 font-bold uppercase tracking-[0.2em]">
                      {agent.desc}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 border border-background/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <div className="w-1.5 h-1.5 bg-background group-hover:bg-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square flex items-center justify-center p-1 w-full max-w-sm mx-auto lg:max-w-none">
            <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
              <AgentVisual />
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: THE TECH STACK */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-48 px-6 bg-background z-10 overflow-hidden"
      >
        {/* Structural Line */}
        <div className="absolute top-0 left-[10%] bottom-0 w-px bg-foreground opacity-[0.03]" />

        <div className="max-w-7xl mx-auto space-y-16 md:space-y-32">
          <div className="text-center space-y-6 relative z-20">
            <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40 mb-4">Core Engine</div>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none break-words">
              Built <span className="text-primary italic">With</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground uppercase tracking-widest font-black max-w-2xl mx-auto opacity-50">
              High-performance middleware powered by bleeding edge technology.
            </p>
          </div>

          <div className="relative w-full z-20">
            <TechCarousel />
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
