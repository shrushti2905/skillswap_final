import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  Repeat2,
  BookOpen,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  Code,
  Palette,
  TrendingUp,
  Globe,
  Music,
  Camera,
  ChevronRight,
} from "lucide-react";
import { useEffect } from "react";

const SKILL_CATEGORIES = [
  { label: "Programming", icon: Code, color: "text-blue-400" },
  { label: "Design", icon: Palette, color: "text-pink-400" },
  { label: "Marketing", icon: TrendingUp, color: "text-green-400" },
  { label: "Languages", icon: Globe, color: "text-yellow-400" },
  { label: "Music", icon: Music, color: "text-purple-400" },
  { label: "Photography", icon: Camera, color: "text-orange-400" },
];

const FEATURES = [
  {
    icon: Repeat2,
    title: "Peer-to-Peer Exchange",
    description:
      "Trade skills directly with others. Teach what you know, learn what you need — no money required.",
  },
  {
    icon: Zap,
    title: "Smart Matching",
    description:
      "Our platform surfaces users whose offered skills match what you want to learn, and vice versa.",
  },
  {
    icon: Shield,
    title: "Trusted Community",
    description:
      "Ratings, profiles, and a moderated admin system ensure every interaction is safe and reliable.",
  },
  {
    icon: BookOpen,
    title: "Track Progress",
    description:
      "Manage your swap requests end-to-end — from pending to accepted to completed — all in one place.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up and list the skills you can teach plus the ones you want to learn.",
  },
  {
    number: "02",
    title: "Discover & Connect",
    description:
      "Browse other users, filter by skill category, and send swap requests with a personal message.",
  },
  {
    number: "03",
    title: "Exchange & Grow",
    description:
      "Accept requests, start learning, and mark swaps complete when you're done.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Data Scientist",
    skill: "Python → React",
    quote: "I taught Python and got React lessons in return. Best trade I've ever made!",
    avatar: "PS",
  },
  {
    name: "Rohan Mehta",
    role: "Full-Stack Developer",
    skill: "TypeScript → Design",
    quote: "SkillSwap helped me break into UI design without spending a rupee on courses.",
    avatar: "RM",
  },
  {
    name: "Aisha Khan",
    role: "Graphic Designer",
    skill: "Branding → JavaScript",
    quote: "Connected with amazing developers who taught me code while I helped with design.",
    avatar: "AK",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (user) {
      setLocation("/discover");
    }
  }, [user, setLocation]);

  const openAuth = (tab: "signin" | "signup" = "signin") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              SS
            </div>
            <span className="font-bold text-lg tracking-tight">SkillSwap</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => openAuth("signin")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => openAuth("signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 md:py-28 subtle-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
        <div className="relative max-w-4xl mx-auto space-y-6">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1 text-sm font-medium gap-2">
            <Star className="h-3 w-3 fill-current" />
            100% Free · No subscriptions · Pure knowledge exchange
          </Badge>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Exchange Skills,
            <br />
            <span className="gradient-text">Build Community</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with talented people across India. Teach what you know, learn what you need.
            No money involved — just pure peer-to-peer skill sharing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 px-8" onClick={() => openAuth("signup")}>
              Start Swapping Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuth("signin")}>
              Sign In to Explore
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto w-full">
          {[
            { value: "500+", label: "Active Users" },
            { value: "80+", label: "Skills Listed" },
            { value: "200+", label: "Swaps Completed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Getting started takes less than two minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-card/20 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete platform built for seamless skill exchange.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-2xl bg-card border border-border/50 card-hover"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Categories */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Popular Skill Categories</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            From coding to creativity, every skill has a learner.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => openAuth("signup")}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 card-hover cursor-pointer"
              >
                <cat.icon className={`h-7 w-7 ${cat.color}`} />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-card/20 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">What Our Users Say</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Real stories from the SkillSwap community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-card border border-border/50 flex flex-col gap-4 card-hover">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.skill}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold">
            Ready to start <span className="gradient-text">learning?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join hundreds of people already exchanging skills every day. It's completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 px-10" onClick={() => openAuth("signup")}>
              Create Your Free Account <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
            {["No credit card", "Free forever", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
              SS
            </div>
            <span className="font-medium text-foreground">SkillSwap</span>
          </div>
          <p>© {new Date().getFullYear()} SkillSwap. Built for learners, by learners.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => openAuth("signin")} className="hover:text-foreground transition-colors">
              Sign In
            </button>
            <button onClick={() => openAuth("signup")} className="hover:text-foreground transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
