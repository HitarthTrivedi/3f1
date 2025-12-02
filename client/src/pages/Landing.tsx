import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-12"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 
                className="text-9xl font-black font-logo tracking-tighter mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                data-testid="text-logo"
              >
                3F1
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Three Faction Intelligence
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Watch three AI agents engage in structured debates on any topic. 
                Configure providers, observe live arguments, and download complete transcripts.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/debate">
              <Button 
                size="lg" 
                className="gap-2 px-8 text-lg h-14"
                data-testid="button-start-debate"
              >
                Start a Debate
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2 px-8 text-lg h-14"
              data-testid="button-learn-more"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="w-5 h-5" />
              Learn More
            </Button>
          </motion.div>

          <motion.div
            id="features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="space-y-3 p-6 rounded-lg border bg-card hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Provider Support</h3>
              <p className="text-muted-foreground">
                Configure agents with OpenAI, Gemini, Perplexity, or custom API endpoints
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-lg border bg-card hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded" />
              </div>
              <h3 className="text-xl font-semibold">Structured Debates</h3>
              <p className="text-muted-foreground">
                5 rounds per agent with cross-referenced arguments and diverse perspectives
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-lg border bg-card hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded" />
              </div>
              <h3 className="text-xl font-semibold">Export Transcripts</h3>
              <p className="text-muted-foreground">
                Download complete debate records in JSON or plain text format
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
