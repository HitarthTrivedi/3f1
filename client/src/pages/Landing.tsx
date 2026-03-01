import { motion } from "framer-motion";
import { HeroScene } from "@/components/HeroScene";
import { AgentVisual } from "@/components/AgentVisual";
import { Footer } from "@/components/Footer";
import DebateTopicInput from "@/components/DebateTopicInput";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useLocation } from "wouter";

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
      {/* Global Background Infrastructure */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-1/4 left-10 text-[10px] font-black tracking-widest vertical-text select-none">3F1.PROTO // SECTOR_01</div>
        <div className="absolute top-3/4 right-10 text-[10px] font-black tracking-widest vertical-text select-none">3F1.PROTO // SECTOR_02</div>

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
      <section className="relative py-40 px-6 border-b border-foreground/10 bg-background z-10 overflow-hidden">
        {/* Background Coordinate Marker */}
        <div className="absolute top-10 right-10 text-[9px] font-black tracking-[0.4em] opacity-10 select-none">
          [COORD: 02:44:A]
        </div>

        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1 border border-primary/20 text-[10px] uppercase font-black tracking-[0.3em] text-primary bg-primary/5 mb-4">
              Module: Real-time // Interaction
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              Experience <br /><span className="text-stroke">Generative UI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-70">
              Transform static responses into adaptive, high-performance interfaces. <br />
              <span className="text-foreground">Pick a blueprint below to initialize.</span>
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-xl" />
            <div className="relative p-10 md:p-16 border-2 border-foreground bg-background shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] dark:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-primary opacity-20" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-primary opacity-20" />

              <DebateTopicInput
                topic={topic}
                onTopicChange={setTopic}
                onStartDebate={handleStartDebate}
                isDebating={false}
                startButtonText="Initialize API —"
              />
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {["Travel Hidden Gems", "Stocks to Watch", "Football Legends", "Global Street Food"].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  onClick={() => setTopic(tag)}
                  className="rounded-none border-foreground/20 px-6 py-3 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer bg-background"
                >
                  {tag} // 0X
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS (SPLIT SCREEN) */}
      <section className="relative py-48 px-6 border-b border-foreground/10 bg-foreground text-background z-10 overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/2 inset-x-0 h-px bg-background" />
          <div className="absolute left-1/2 inset-y-0 w-px bg-background" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
          <div className="space-y-16">
            <div className="space-y-8">
              <div className="text-[10px] uppercase font-black tracking-[0.5em] text-primary">System Architecture</div>
              <h2 className="text-7xl font-black tracking-tighter uppercase leading-[0.85]">
                Neural <br /><span className="text-primary italic">Convergence</span>
              </h2>
              <p className="text-2xl text-background/60 font-medium max-w-lg leading-relaxed">
                3F1 bridges the gap between raw LLM outputs and premium user experiences through a deterministic UI protocol.
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
                  <div className="w-12 h-12 border border-background/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <div className="w-1.5 h-1.5 bg-background group-hover:bg-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square flex items-center justify-center p-1 bg-background border border-background/10 shadow-[40px_40px_0px_-10px_rgba(255,102,0,0.1)] transition-transform hover:scale-[1.02] duration-500">
            <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 p-8 flex items-center justify-center border border-foreground/5">
              <AgentVisual />
            </div>
            {/* Coordinate markers in card corners */}
            <span className="absolute top-4 left-4 text-[8px] font-black font-mono opacity-20">X: 104.2 / Y: 88.1</span>
            <span className="absolute bottom-4 right-4 text-[8px] font-black font-mono opacity-20">SEQ: 009827-X</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: BENTO FEATURES (BUILT FOR DEVELOPERS) */}
      <section className="relative py-48 px-6 bg-background z-10 overflow-hidden">
        {/* Structural Line */}
        <div className="absolute top-0 left-[10%] bottom-0 w-px bg-foreground opacity-[0.03]" />

        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-6">
            <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40 mb-4">Functional Specifications</div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              Dev <span className="text-stroke">Protocol</span>
            </h2>
            <p className="text-xl text-muted-foreground uppercase tracking-widest font-black max-w-2xl mx-auto opacity-50">
              Low-latency components for high-stakes implementations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-foreground/5 p-1 border border-foreground/10">
            {[
              { title: "Universal AI Stack", desc: "OpenAI-compatible endpoints optimized for rapid interface layering." },
              { title: "Dynamic Scaling", desc: "Native responsiveness with zero layout shift during real-time generation." },
              { title: "Tool Convergence", desc: "Direct integration for file-handling, code execution, and data visualization." },
              { title: "Component Foundry", desc: "Native React support with hot-swappable design tokens and modules." },
              { title: "Unified Workflows", desc: "Integrated state management for complex multi-turn AI interactions." },
              { title: "Core Resilience", desc: "Industrial-grade stability with built-in streaming fault tolerance." }
            ].map((feature, i) => (
              <Card key={feature.title} className="rounded-none border-none p-12 space-y-10 hover:bg-foreground hover:text-background transition-all group relative overflow-hidden bg-background">
                {/* ID Marker */}
                <div className="absolute top-6 right-6 text-[9px] font-black opacity-10 group-hover:text-primary group-hover:opacity-100 transition-all">
                  DEV-ID: 0{i + 1}
                </div>

                <div className="w-10 h-10 border border-foreground/10 group-hover:border-background/20 flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 bg-primary group-hover:scale-150 transition-transform" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight">{feature.title}</h4>
                  <p className="text-xs uppercase font-bold tracking-[0.1em] opacity-50 group-hover:opacity-80 leading-relaxed">{feature.desc}</p>
                </div>

                <div className="pt-8 border-t border-foreground/[0.05] group-hover:border-background/10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black tracking-widest">ENABLED</span>
                  <div className="w-12 h-px bg-primary" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
