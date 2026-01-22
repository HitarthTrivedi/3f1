import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { AgentVisual } from "@/components/AgentVisual";
import { Footer } from "@/components/Footer";
import MouseFollowerButton from "@/components/MouseFollowerButton";

export default function Landing() {
  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Section 1: Hero */}
      <section className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="max-w-5xl w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-16"
          >
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1
                  className="text-9xl font-black font-logo tracking-tighter mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                  data-testid="text-logo"
                >
                  3F1
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                  Three Faction Intelligence
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  Watch three AI agents engage in structured debates on any topic
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/debate">
                <Button
                  size="lg"
                  className="gap-3 px-10 text-lg h-16 shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-start-debate"
                >
                  Start a Debate
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-3 px-10 text-lg h-16"
                onClick={scrollToNext}
              >
                Learn More
                <ChevronDown className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToNext}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </section>

      {/* Section 2: How It Works (Split Screen) */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-card/10">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                  How It Works
                </h2>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 font-light">
                  Three distinct AI personalities debate any topic through structured rounds, creating a dynamic 3D conversation.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    number: "A",
                    title: "The Analyst",
                    color: "from-blue-500 to-cyan-500",
                    description: "Breaks down topics logic and data.",
                  },
                  {
                    number: "C",
                    title: "The Critic",
                    color: "from-purple-500 to-pink-500",
                    description: "Challenges assumptions and finds flaws.",
                  },
                  {
                    number: "S",
                    title: "The Synthesizer",
                    color: "from-orange-500 to-amber-500",
                    description: "Unifies perspectives into solutions.",
                  },
                ].map((agent, index) => (
                  <motion.div
                    key={agent.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-6 p-4 rounded-xl border bg-card/40 hover:bg-card/60 transition-colors"
                  >
                    <span className={`text-4xl font-bold bg-gradient-to-r ${agent.color} bg-clip-text text-transparent w-16 text-center`}>
                      {agent.number}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{agent.title}</h3>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center lg:justify-end"
            >
              {/* 
                 We wrap AgentVisual to ensure it fits nicely. 
                 The component itself has max-width logic, but we can constrain it here if needed.
               */}
              <div className="w-full max-w-2xl transform scale-90 lg:scale-100">
                <AgentVisual />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 3: About the Project */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-20"
          >
            <div className="text-center space-y-6">
              <h2 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                About the Project
              </h2>
              <p className="text-2xl text-muted-foreground font-light">
                A new way to explore ideas through AI collaboration
              </p>
            </div>

            <div className="space-y-10">
              <div className="p-12 rounded-2xl border bg-card space-y-8">
                <p className="text-xl text-foreground leading-relaxed font-light">
                  3F1 (Three Faction Intelligence) is an experimental platform that brings together
                  three AI agents with distinct personalities to debate any topic you choose.
                  Each agent brings a unique perspective, creating a rich, multi-dimensional
                  exploration of ideas.
                </p>
                <p className="text-xl text-foreground leading-relaxed font-light">
                  Through 5 structured rounds, watch as the Analyst breaks down complex topics,
                  the Critic challenges assumptions, and the Synthesizer weaves insights together
                  into actionable conclusions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Multi-Provider",
                    description: "OpenAI, Gemini, Perplexity, or custom APIs",
                  },
                  {
                    title: "5 Rounds",
                    description: "Structured debate format per agent",
                  },
                  {
                    title: "Export Ready",
                    description: "Download transcripts in JSON or text",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-8 rounded-xl border bg-card/50 space-y-3 text-center"
                  >
                    <h4 className="text-xl font-semibold">{feature.title}</h4>
                    <p className="text-base text-muted-foreground font-light">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Team */}
      <section className="py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-12"
          >
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                Meet the Team
              </h2>
              <p className="text-2xl text-muted-foreground font-light">
                Built with passion and curiosity
              </p>
            </div>

            <div className="p-10 rounded-2xl border bg-card space-y-6">
              <div className="space-y-4">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                  Alpha.kore
                </h3>
                <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
                  A passionate developer exploring the intersection of AI and collaborative
                  intelligence. 3F1 is an experiment in creating meaningful AI interactions
                  that go beyond simple question-and-answer.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Contact */}
      <section className="py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-12"
          >
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                Get in Touch
              </h2>
              <p className="text-2xl text-muted-foreground font-light">
                Questions, feedback, or just want to chat?
              </p>
            </div>

            <div className="p-10 rounded-2xl border bg-card space-y-8">
              <p className="text-xl text-muted-foreground font-light">
                Have ideas for improvements? Found a bug? Or just want to share your
                experience? I'd love to hear from you.
              </p>

              <a
                href="mailto:hitartht318@gmail.com"
                className="inline-block"
              >
                <Button
                  size="lg"
                  className="gap-3 px-10 text-xl h-16 shadow-lg hover:shadow-xl transition-all"
                >
                  hitartht318@gmail.com
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <MouseFollowerButton />
      {/* Footer */}
      <Footer />
    </div>
  );
}
