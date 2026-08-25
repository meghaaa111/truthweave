import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, Brain, FileCheck, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";
import HeaderBackground from "@/components/HeaderBackground";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const features = [
  { icon: Brain, title: "AI-Powered Analysis", desc: "Leverages Google Gemini to evaluate claims against real-world evidence." },
  { icon: Globe, title: "Web Evidence Search", desc: "Automatically searches trusted sources like WHO, Reuters, and CDC." },
  { icon: Lock, title: "Source Verification", desc: "Prioritizes 13+ authoritative domains for reliable fact-checking." },
  { icon: Zap, title: "Instant Results", desc: "Get detailed verdicts with confidence scores in seconds." },
];

const steps = [
  { num: "01", title: "Submit a Claim", desc: "Enter text or upload an image containing a claim to fact-check." },
  { num: "02", title: "AI Investigates", desc: "Our engine searches trusted sources and analyzes evidence." },
  { num: "03", title: "Get Your Verdict", desc: "Receive a detailed verdict with sources and confidence scoring." },
];

const Landing = () => {
  return (
    <div className="relative pt-20 bg-neuro-bg min-h-screen">
      {/* Header Background Grid */}
      <div className="absolute top-0 left-0 right-0 h-40 z-10">
        <HeaderBackground />
      </div>
      
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-neuro-bg">
        <HeroBackground />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.div custom={0} variants={fadeUp} className="neuro-badge-inset inline-flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium mb-8">
              <Shield className="h-4 w-4" />
              AI-Powered Fact Checking
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-foreground">
              Unravel the truth,{" "}
              <span className="gradient-text">one claim at a time</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              TruthWeave uses advanced AI to analyze claims against trusted sources, delivering clear verdicts with transparent evidence.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/analyze">
                <button className="neuro-btn-blue text-base px-8 py-4 font-semibold inline-flex items-center gap-2 rounded-xl">
                  Start Fact-Checking
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="neuro-btn text-base px-8 py-4 font-semibold text-foreground rounded-xl">
                  How It Works
                </button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 custom={0} variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-6 neuro-heading inline-block px-12 py-6 rounded-2xl">
              Powered by Intelligence
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto mt-4">
              A multi-layered approach to separating fact from fiction.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="neuro-card p-6 group"
              >
                <div className="neuro-icon-raised w-14 h-14 mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 custom={0} variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-6 neuro-heading inline-block px-12 py-6 rounded-2xl">
              How It Works
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-lg mt-4">
              Three simple steps to verify any claim.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative text-center neuro-card-flat p-8"
              >
                <div className="text-5xl font-extrabold gradient-text opacity-30 mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Main CTA Card */}
            <div className="neuro-card p-12 md:p-16 text-center relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-8 left-8">
                <div className="neuro-icon w-12 h-12">
                  <Shield className="h-6 w-6 text-primary/30" />
                </div>
              </div>
              <div className="absolute top-8 right-8">
                <div className="neuro-icon w-12 h-12">
                  <FileCheck className="h-6 w-6 text-primary/30" />
                </div>
              </div>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="neuro-icon w-8 h-8">
                  <Zap className="h-4 w-4 text-primary/20" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="neuro-icon-raised w-20 h-20 mx-auto"
                >
                  <FileCheck className="h-10 w-10 text-primary" />
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                    Ready to verify the{" "}
                    <span className="gradient-text">truth</span>?
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Start analyzing claims now — it's fast, free, and backed by trusted sources.
                  </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-6 max-w-md mx-auto"
                >
                  <div className="neuro-badge-inset p-4 rounded-xl">
                    <div className="text-2xl font-bold text-primary">13+</div>
                    <div className="text-xs text-muted-foreground">Trusted Sources</div>
                  </div>
                  <div className="neuro-badge-inset p-4 rounded-xl">
                    <div className="text-2xl font-bold text-primary">AI</div>
                    <div className="text-xs text-muted-foreground">Powered</div>
                  </div>
                  <div className="neuro-badge-inset p-4 rounded-xl">
                    <div className="text-2xl font-bold text-primary">Free</div>
                    <div className="text-xs text-muted-foreground">Always</div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link to="/analyze">
                    <button className="neuro-btn-blue text-lg px-10 py-4 font-semibold inline-flex items-center gap-3 rounded-xl group">
                      <FileCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Start Fact-Checking
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link to="/analyze">
                    <button className="neuro-btn text-lg px-10 py-4 font-semibold text-foreground rounded-xl inline-flex items-center gap-3 group">
                      <Brain className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Learn More
                    </button>
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-8 border-t border-border/30"
                >
                  <p className="text-sm text-muted-foreground mb-4">Trusted by researchers and fact-checkers</p>
                  <div className="flex items-center justify-center gap-6 opacity-60">
                    <div className="neuro-badge-inset px-3 py-1 text-xs font-medium">WHO</div>
                    <div className="neuro-badge-inset px-3 py-1 text-xs font-medium">Reuters</div>
                    <div className="neuro-badge-inset px-3 py-1 text-xs font-medium">CDC</div>
                    <div className="neuro-badge-inset px-3 py-1 text-xs font-medium">BBC</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 mt-20">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="neuro-card-inset p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">TruthWeave</h3>
                  <p className="text-sm text-muted-foreground">AI-Powered Truth Detection</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                Cutting-edge AI technology that analyzes claims, verifies facts, and combats misinformation. 
                Built with advanced machine learning to help you distinguish truth from fiction.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                <button className="neuro-btn-nav p-3 rounded-xl hover:text-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="neuro-btn-nav p-3 rounded-xl hover:text-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
                <button className="neuro-btn-nav p-3 rounded-xl hover:text-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button className="neuro-btn-nav p-3 rounded-xl hover:text-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.001 12.017z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="neuro-divider mb-8" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Copyright & Credits */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>© 2024 TruthWeave. All rights reserved.</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span>Website designed by</span>
                <span className="neuro-badge-inset px-3 py-1 text-xs font-semibold text-primary">
                  Megha SB
                </span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4">
              <div className="neuro-card-inset p-2 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>All systems operational</span>
                </div>
              </div>
              <div className="neuro-card-inset p-2 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span>SSL Secured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-4 right-4 opacity-10">
            <div className="neuro-card-inset p-4 rounded-2xl">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 opacity-5">
            <div className="neuro-card-inset p-6 rounded-3xl">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
