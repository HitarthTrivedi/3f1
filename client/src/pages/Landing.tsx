import { motion } from "framer-motion";
import { HeroScene } from "@/components/HeroScene";
import { AgentVisual } from "@/components/AgentVisual";
import { Footer } from "@/components/Footer";
import DebateTopicInput from "@/components/DebateTopicInput";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { useLocation } from "wouter";

import { ThemeToggle } from "@/components/ThemeToggle";
import DebateFeed, { type Message } from "@/components/DebateFeed";
import { X, ArrowRight } from "lucide-react";

// Mock debates mapped by topic focus
const getMockMessages = (topic: string): Message[] => {
  const isAgi = topic.toLowerCase().includes("agi");
  const isSocial = topic.toLowerCase().includes("social");

  if (isAgi) {
    return [
      { id: "1", agentName: "Analyst", round: 1, agentColor: "blue", message: "Analyzing current trajectory of LLM scaling laws, compute availability, and algorithmic breakthroughs. Data indicates that GPT-4 class models emerged sooner than consensus predicted. If scaling laws hold (loss ~ C*N^(-alpha)), and given the $100B+ capital influx into compute clusters (e.g., Stargate project), reaching human-level multi-modal reasoning within 7-10 years is highly probable based on current trendlines." },
      { id: "2", agentName: "Critic", round: 1, agentColor: "green", message: "The Analyst extrapolates a linear/exponential curve indefinitely, ignoring diminishing returns. Current LLMs are pattern-matchers, lacking formal reasoning, memory architectures, and causal understanding. Furthermore, we are approaching the 'data wall' where high-quality human text is exhausted. Compute alone cannot bypass fundamental architectural deficiencies in transformer models." },
      { id: "3", agentName: "Synthesizer", round: 1, agentColor: "orange", message: "Synthesis: The timeline for AGI depends entirely on whether scaling current architectures leads to emergent causal reasoning, or if a paradigm shift is required. While the Analyst correctly identifies the massive capital and compute tailwinds, the Critic rightfully points out architectural bottlenecks like the data wall and lack of true causal modeling. Conclusion: Highly capable, economically disruptive 'narrow' AI will arrive this decade, but true AGI (human-level adaptive reasoning) is not guaranteed simply by scaling transformers; it requires fundamental structural breakthroughs." }
    ];
  }

  if (isSocial) {
    return [
      { id: "1", agentName: "Analyst", round: 1, agentColor: "blue", message: "Social media platforms operate as natural monopolies due to network effects. Current self-regulation has failed to curb algorithmic radicalization and teen mental health declines (e.g., CDC data showing 57% of teen girls report persistent sadness). Like utilities or broadcasting, platforms with over 50M active users require government oversight regarding algorithmic transparency and content moderation standards." },
      { id: "2", agentName: "Critic", round: 1, agentColor: "green", message: "The Analyst's utility analogy is flawed. Regulating social media inherently infringes on free expression. Government oversight of 'algorithms' usually devolves into partisan censorship boards deciding what constitutes 'misinformation'. Furthermore, the link between social media and mental health is correlational, not strictly causal—many studies show mixed results or blame broader societal factors. Heavy regulation entrenches incumbents who can afford compliance costs." },
      { id: "3", agentName: "Synthesizer", round: 1, agentColor: "orange", message: "Synthesis: The core issue is the conflict between public health/safety and free expression. While the Critic is correct that government speech boards are dangerous and stifle competition, the Analyst's data on algorithmic harm (particularly to minors) cannot be ignored. A balanced regulatory approach should not focus on speech moderation, but rather on algorithmic transparency, data privacy (like GDPR), and design constraints (e.g., banning infinite scroll or targeted ads for minors), addressing the delivery mechanism rather than the content itself." }
    ];
  }

  // Default fallback mock debate
  return [
    { id: "1", agentName: "Analyst", round: 1, agentColor: "blue", message: "Breaking down the core premises of the topic: The historical and structural data indicates significant shifts in the underlying paradigm. Economic and social metrics from recent studies suggest a 34% shift towards the proposed outcome over the last 5 years, driven primarily by technological adoption and changing demographic preferences." },
    { id: "2", agentName: "Critic", round: 1, agentColor: "green", message: "The Analyst's perspective relies heavily on lagging indicators and assumes unhindered extrapolation. The data cited ignores the massive regulatory pushback and the fundamental physical/social constraints that limit this adoption. Furthermore, the 34% shift metric includes heavily biased datasets that overrepresent early adopters." },
    { id: "3", agentName: "Synthesizer", round: 1, agentColor: "orange", message: "Synthesis: The intersection of these viewpoints highlights a classic adoption curve dilemma. The Analyst correctly identifies the momentum and demographic tailwinds, while the Critic validly exposes the systemic friction and biased metrics. The likely reality is a bifurcated outcome: complete transformation in specific highly-adaptable sectors, but stagnant, heavily-regulated resistance in legacy systems. The absolute premise is partially true, but heavily context-dependent." },
  ];
};

export default function Landing() {
  const [topic, setTopic] = useState("");
  const [, setLocation] = useLocation();
  const [mockModalTopic, setMockModalTopic] = useState<string | null>(null);

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
          <Logo className="text-xl" />
        </div>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Global Background Infrastructure */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-1/4 left-10 text-[10px] font-black tracking-widest vertical-text select-none"><Logo className="text-[10px] inline-flex" dashClassName="w-1.5 h-[1.5px] mt-0.5" />.PROTO // SECTOR_01</div>
        <div className="absolute top-3/4 right-10 text-[10px] font-black tracking-widest vertical-text select-none"><Logo className="text-[10px] inline-flex" dashClassName="w-1.5 h-[1.5px] mt-0.5" />.PROTO // SECTOR_02</div>

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
              Triadic <br /><span className="text-primary italic">Debate</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-70">
              Engage high-performance agentic reasoning through structured conflict and synthesis. <br />
              <span className="text-foreground">Initialize the <Logo className="inline-flex text-base" dashClassName="w-2 h-[2px] mt-0.5" /> protocol below.</span>
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
                Neural <br /><span className="text-primary italic">Debate</span>
              </h2>
              <p className="text-xl md:text-2xl text-background/60 font-medium max-w-lg leading-relaxed">
                <Logo className="inline-flex text-xl" dashClassName="w-3 h-[2px] mt-0.5" /> orchestrates structured tension between three distinct intelligence agents to distill objective truth.
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

      {/* SECTION 4: EXAMPLE DEBATES */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-48 px-6 bg-background z-10 overflow-hidden"
      >
        {/* Structural Line */}
        <div className="absolute top-0 left-[10%] bottom-0 w-px bg-foreground opacity-[0.03]" />

        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          <div className="text-center space-y-6 relative z-20">
            <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40 mb-4">Debate Examples</div>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none break-words">
              Try <span className="text-primary italic">These</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground uppercase tracking-widest font-black max-w-2xl mx-auto opacity-50">
              Click any topic to trigger the three-agent dialectic cycle.
            </p>
          </div>

          {/* Marquee rows */}
          <div className="relative w-full space-y-4 md:space-y-6 overflow-hidden">

            {/* Row 1 — scrolls left */}
            <div className="relative">
              <motion.div
                className="flex gap-4 md:gap-6"
                animate={{ x: [0, -2400] }}
                transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 150, ease: "linear" } }}
                style={{ width: "fit-content" }}
              >
                {[...[
                  { topic: "Is AGI inevitable in the next decade?",       category: "Technology" },
                  { topic: "Should social media platforms be regulated?", category: "Policy" },
                  { topic: "Is remote work better than office culture?",  category: "Work" },
                  { topic: "Are electric vehicles truly sustainable?",    category: "Environment" },
                  { topic: "Did the Roman Empire fall or transform?",     category: "History" },
                  { topic: "Is crypto a revolution or a speculation?",    category: "Finance" },
                ], ...[
                  { topic: "Is AGI inevitable in the next decade?",       category: "Technology" },
                  { topic: "Should social media platforms be regulated?", category: "Policy" },
                  { topic: "Is remote work better than office culture?",  category: "Work" },
                  { topic: "Are electric vehicles truly sustainable?",    category: "Environment" },
                  { topic: "Did the Roman Empire fall or transform?",     category: "History" },
                  { topic: "Is crypto a revolution or a speculation?",    category: "Finance" },
                ]].map(({ topic, category }, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMockModalTopic(topic)}
                    className="group flex items-center gap-4 border border-foreground/10 bg-background px-6 py-4 md:px-8 md:py-5 hover:border-primary/50 hover:bg-primary/5 transition-all whitespace-nowrap shrink-0"
                  >
                    <div className="text-left space-y-0.5">
                      <p className="font-black text-[9px] uppercase tracking-[0.25em] text-primary">{category}</p>
                      <p className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{topic}</p>
                    </div>
                    <span className="font-black text-[10px] text-foreground/20 group-hover:text-primary/60 transition-colors ml-2">→</span>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Row 2 — scrolls right (reverse) */}
            <div className="relative">
              <motion.div
                className="flex gap-4 md:gap-6"
                animate={{ x: [-2400, 0] }}
                transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 150, ease: "linear" } }}
                style={{ width: "fit-content" }}
              >
                {[...[
                  { topic: "Should universities be free for everyone?",   category: "Education" },
                  { topic: "Is Mars colonisation a necessity?",           category: "Science" },
                  { topic: "Does social media harm mental health?",       category: "Society" },
                  { topic: "Is nuclear energy the future?",              category: "Energy" },
                  { topic: "Can democracy survive disinformation?",       category: "Politics" },
                  { topic: "Is AI art a threat to human creativity?",     category: "Culture" },
                ], ...[
                  { topic: "Should universities be free for everyone?",   category: "Education" },
                  { topic: "Is Mars colonisation a necessity?",           category: "Science" },
                  { topic: "Does social media harm mental health?",       category: "Society" },
                  { topic: "Is nuclear energy the future?",              category: "Energy" },
                  { topic: "Can democracy survive disinformation?",       category: "Politics" },
                  { topic: "Is AI art a threat to human creativity?",     category: "Culture" },
                ]].map(({ topic, category }, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMockModalTopic(topic)}
                    className="group flex items-center gap-4 border border-foreground/10 bg-background px-6 py-4 md:px-8 md:py-5 hover:border-primary/50 hover:bg-primary/5 transition-all whitespace-nowrap shrink-0"
                  >
                    <div className="text-left space-y-0.5">
                      <p className="font-black text-[9px] uppercase tracking-[0.25em] text-primary">{category}</p>
                      <p className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{topic}</p>
                    </div>
                    <span className="font-black text-[10px] text-foreground/20 group-hover:text-primary/60 transition-colors ml-2">→</span>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Fade overlays — identical to TechCarousel */}
            <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </motion.section>

      <Footer />

      {/* Mock Debate Modal */}
      {mockModalTopic && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 lg:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
            onClick={() => setMockModalTopic(null)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-background border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,102,0,0.2)]"
          >
            {/* Header / Fixed Top */}
            <div className="shrink-0 flex items-start justify-between p-6 sm:p-8 border-b border-foreground/10 relative z-10">
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary opacity-30 pointer-events-none" />
              
              <div className="space-y-3 pr-8">
                <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                  Simulated <span className="italic">Output</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none break-words max-w-xl">
                  {mockModalTopic}
                </h3>
              </div>

              <button 
                onClick={() => setMockModalTopic(null)}
                className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center border-l-2 border-b-2 border-foreground hover:bg-foreground hover:text-background transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Feed */}
            <div className="overflow-y-auto p-6 sm:p-8 bg-foreground/[0.02]">
              <div className="p-1 bg-background border border-foreground/10">
                <DebateFeed messages={getMockMessages(mockModalTopic)} totalRounds={1} />
              </div>
            </div>

            {/* Footer CTA / Fixed Bottom */}
            <div className="shrink-0 bg-background flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 border-t border-foreground/10 relative z-10">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground w-full sm:w-auto text-center sm:text-left leading-relaxed max-w-sm">
                This is a simulated dialectic cycle.
              </div>
              <button
                onClick={() => {
                  setMockModalTopic(null);
                  setLocation(`/debate?topic=${encodeURIComponent(mockModalTopic)}&autostart=true`);
                }}
                className="h-12 sm:h-14 px-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all flex items-center gap-3 shrink-0 w-full sm:w-auto justify-center hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(255,102,0,0.3)] hover:shadow-none"
              >
                Run Live Synthesis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
