"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Sparkles,
  Zap,
  MessageCircle,
  Shield,
  Globe,
  Star,
} from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";

// Optimized Animated counter component
function AnimatedCounter({
  end,
  duration = 2,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (countRef.current) {
      gsap.fromTo(
        countRef.current,
        { textContent: 0 },
        {
          textContent: end,
          duration: duration,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate: function () {
            if (countRef.current) {
              countRef.current.textContent =
                Math.ceil(Number(this.targets()[0].textContent)) + suffix;
            }
          },
        }
      );
    }
  }, [end, duration, suffix]);

  return <span ref={countRef}>0{suffix}</span>;
}

// Simplified Feature card component (removed heavy 3D effects)
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group relative p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <motion.div
          className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.1, rotateY: 15 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Simplified floating orb (reduced complexity)
function FloatingOrb({
  size,
  color,
  delay,
  duration,
}: {
  size: string;
  color: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full ${size} ${color} blur-xl opacity-20`}
      animate={{
        x: [0, 50, -25, 0],
        y: [0, -50, 25, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Simplified 3D element (reduced animations)
function Simple3DElement({
  position,
  delay,
  type = "cube",
}: {
  position: string;
  delay: number;
  type?: "cube" | "sphere" | "diamond";
}) {
  const getShape = () => {
    switch (type) {
      case "sphere":
        return "rounded-full border-2 border-dashed border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10";
      case "diamond":
        return "rotate-45 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10";
      default:
        return "border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10";
    }
  };

  return (
    <motion.div
      className={`absolute ${position} w-12 h-12`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 0.15,
        scale: 1,
        rotate: [0, 360],
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
      }}
    >
      <div className={`w-full h-full ${getShape()}`} />
    </motion.div>
  );
}

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      // Simplified GSAP timeline
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
      )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-description",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".hero-buttons",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );
    }
  }, []);

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Chatbots",
      description:
        "Create intelligent chatbots with advanced AI capabilities and natural language processing.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Deploy your chatbots instantly with our optimized infrastructure and global CDN.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-grade security with end-to-end encryption and compliance certifications.",
    },
    {
      icon: Globe,
      title: "Global Scale",
      description:
        "Scale to millions of conversations with our distributed cloud architecture.",
    },
  ];

  const stats = [
    { number: 10000, suffix: "+", label: "Active Chatbots" },
    { number: 1000000, suffix: "+", label: "Conversations" },
    { number: 99, suffix: "%", label: "Uptime" },
    { number: 150, suffix: "+", label: "Countries" },
  ];

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Simplified animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb
          size="w-72 h-72"
          color="bg-gradient-to-br from-blue-400 to-purple-400"
          delay={0}
          duration={15}
        />
        <FloatingOrb
          size="w-96 h-96"
          color="bg-gradient-to-br from-purple-400 to-pink-400"
          delay={2}
          duration={18}
        />
        <FloatingOrb
          size="w-80 h-80"
          color="bg-gradient-to-br from-pink-400 to-blue-400"
          delay={4}
          duration={12}
        />
      </div>

      {/* Simplified 3D Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Simple3DElement position="top-20 left-1/4" delay={1} type="cube" />
        <Simple3DElement position="top-1/3 right-20" delay={2} type="sphere" />
        <Simple3DElement position="bottom-1/3 left-10" delay={3} type="diamond" />
        <Simple3DElement position="top-1/2 right-1/6" delay={1.5} type="cube" />
        <Simple3DElement position="bottom-20 left-1/4" delay={2.5} type="sphere" />
      </div>

      {/* Simplified decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating icons */}
        <motion.div
          className="absolute top-20 left-10 text-blue-500/20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Bot className="w-12 h-12" />
        </motion.div>

        <motion.div
          className="absolute top-40 right-20 text-purple-500/20"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        >
          <Sparkles className="w-16 h-16" />
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20 text-pink-500/20"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        >
          <MessageCircle className="w-14 h-14" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="hero-badge inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation AI Chatbot Platform
              <Star className="w-4 h-4 ml-2" />
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Build Intelligent
            </span>
            <br />
            <span className="text-foreground">Chatbots in</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Minutes
            </span>
          </h1>

          <p className="hero-description text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Create, deploy, and scale AI-powered chatbots that understand your
            customers. Upload your documents, customize the experience, and
            watch your chatbot come to life.
            <span className="block mt-2 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              No coding required. Enterprise-ready security. Global
              infrastructure.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6 group"
            >
              <Link href="/signin" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center group"
              >
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={1.2 + index * 0.1}
              />
            ))}
          </div>

        
        </div>
      </div>

     

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-30" />
    </div>
  );
};
































// "use client";

// import React, { useRef, useEffect, useState } from "react";
// import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowRight,
//   Bot,
//   Sparkles,
//   Zap,
//   MessageCircle,
//   Shield,
//   Globe,
//   Users,
//   Star,
//   Cpu,
//   Brain,
//   Layers,
// } from "lucide-react";
// import Link from "next/link";
// import { gsap } from "gsap";

// // Animated counter component
// function AnimatedCounter({
//   end,
//   duration = 2,
//   suffix = "",
// }: {
//   end: number;
//   duration?: number;
//   suffix?: string;
// }) {
//   const countRef = useRef<HTMLSpanElement>(null);

//   useEffect(() => {
//     if (countRef.current) {
//       gsap.fromTo(
//         countRef.current,
//         { textContent: 0 },
//         {
//           textContent: end,
//           duration: duration,
//           ease: "power2.out",
//           snap: { textContent: 1 },
//           onUpdate: function () {
//             if (countRef.current) {
//               countRef.current.textContent =
//                 Math.ceil(Number(this.targets()[0].textContent)) + suffix;
//             }
//           },
//         }
//       );
//     }
//   }, [end, duration, suffix]);

//   return <span ref={countRef}>0{suffix}</span>;
// }

// // Enhanced 3D Feature card component
// function FeatureCard({
//   icon: Icon,
//   title,
//   description,
//   delay = 0,
// }: {
//   icon: React.ElementType;
//   title: string;
//   description: string;
//   delay?: number;
// }) {
//   return (
//     <Interactive3DCard className="h-full">
//       <motion.div
//         initial={{ opacity: 0, y: 50, rotateX: -30 }}
//         animate={{ opacity: 1, y: 0, rotateX: 0 }}
//         transition={{ duration: 0.8, delay }}
//         className="group relative p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 h-full"
//         style={{
//           transformStyle: "preserve-3d",
//         }}
//       >
//         {/* 3D Background layers */}
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//           style={{ transform: "translateZ(-10px)" }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//           style={{ transform: "translateZ(-5px)" }}
//         />

//         <div
//           className="relative z-10"
//           style={{ transform: "translateZ(20px)" }}
//         >
//           <motion.div
//             className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl"
//             whileHover={{
//               rotateY: 180,
//               scale: 1.2,
//             }}
//             transition={{ duration: 0.6 }}
//             style={{ transformStyle: "preserve-3d" }}
//           >
//             <Icon className="h-6 w-6 text-white group-hover:drop-shadow-lg" />
//           </motion.div>
//           <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
//             {title}
//           </h3>
//           <p className="text-muted-foreground text-sm leading-relaxed">
//             {description}
//           </p>
//         </div>

//         {/* Floating particles around the card */}
//         <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
//           {[...Array(6)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute w-1 h-1 bg-primary/40 rounded-full"
//               style={{
//                 left: `${20 + i * 15}%`,
//                 top: `${30 + (i % 2) * 40}%`,
//               }}
//               animate={{
//                 y: [0, -20, 0],
//                 opacity: [0.4, 1, 0.4],
//                 scale: [1, 1.5, 1],
//               }}
//               transition={{
//                 duration: 2 + i * 0.5,
//                 repeat: Infinity,
//                 delay: i * 0.2,
//               }}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </Interactive3DCard>
//   );
// }

// // 3D Floating orb component with enhanced effects
// function FloatingOrb({
//   size,
//   color,
//   delay,
//   duration,
// }: {
//   size: string;
//   color: string;
//   delay: number;
//   duration: number;
// }) {
//   return (
//     <motion.div
//       className={`absolute rounded-full ${size} ${color} blur-xl opacity-20`}
//       animate={{
//         x: [0, 100, -50, 0],
//         y: [0, -100, 50, 0],
//         scale: [1, 1.2, 0.8, 1],
//         rotateX: [0, 360],
//         rotateY: [0, 180],
//       }}
//       transition={{
//         duration: duration,
//         delay: delay,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//       style={{
//         transformStyle: "preserve-3d",
//       }}
//     />
//   );
// }

// // 3D Cube component
// function Floating3DCube({
//   position,
//   delay,
// }: {
//   position: string;
//   delay: number;
// }) {
//   return (
//     <motion.div
//       className={`absolute ${position} w-16 h-16`}
//       initial={{ opacity: 0, scale: 0 }}
//       animate={{
//         opacity: 0.1,
//         scale: 1,
//         rotateX: [0, 360],
//         rotateY: [0, 360],
//         rotateZ: [0, 180],
//       }}
//       transition={{
//         opacity: { duration: 1, delay },
//         scale: { duration: 1, delay },
//         rotateX: { duration: 20, repeat: Infinity, ease: "linear" },
//         rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
//         rotateZ: { duration: 25, repeat: Infinity, ease: "linear" },
//       }}
//       style={{
//         transformStyle: "preserve-3d",
//         perspective: "1000px",
//       }}
//     >
//       <div
//         className="relative w-full h-full"
//         style={{ transformStyle: "preserve-3d" }}
//       >
//         {/* Cube faces */}
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
//           style={{ transform: "rotateY(0deg) translateZ(32px)" }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
//           style={{ transform: "rotateY(90deg) translateZ(32px)" }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-blue-500/20 border border-pink-500/30"
//           style={{ transform: "rotateY(180deg) translateZ(32px)" }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
//           style={{ transform: "rotateY(-90deg) translateZ(32px)" }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
//           style={{ transform: "rotateX(90deg) translateZ(32px)" }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-blue-500/20 border border-pink-500/30"
//           style={{ transform: "rotateX(-90deg) translateZ(32px)" }}
//         />
//       </div>
//     </motion.div>
//   );
// }

// // 3D Pyramid component
// function Floating3DPyramid({
//   position,
//   delay,
// }: {
//   position: string;
//   delay: number;
// }) {
//   return (
//     <motion.div
//       className={`absolute ${position} w-12 h-12`}
//       initial={{ opacity: 0, y: 50 }}
//       animate={{
//         opacity: 0.15,
//         y: 0,
//         rotateX: [0, 360],
//         rotateY: [0, -360],
//       }}
//       transition={{
//         opacity: { duration: 1, delay },
//         y: { duration: 1, delay },
//         rotateX: { duration: 18, repeat: Infinity, ease: "linear" },
//         rotateY: { duration: 22, repeat: Infinity, ease: "linear" },
//       }}
//       style={{
//         transformStyle: "preserve-3d",
//         perspective: "1000px",
//       }}
//     >
//       <div
//         className="relative w-full h-full"
//         style={{ transformStyle: "preserve-3d" }}
//       >
//         {/* Pyramid faces */}
//         <div
//           className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-transparent border-l border-r border-blue-500/40"
//           style={{
//             transform: "rotateY(0deg) rotateX(60deg) translateZ(24px)",
//             clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
//           }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent border-l border-r border-purple-500/40"
//           style={{
//             transform: "rotateY(90deg) rotateX(60deg) translateZ(24px)",
//             clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
//           }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-t from-pink-500/30 to-transparent border-l border-r border-pink-500/40"
//           style={{
//             transform: "rotateY(180deg) rotateX(60deg) translateZ(24px)",
//             clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
//           }}
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-transparent border-l border-r border-blue-500/40"
//           style={{
//             transform: "rotateY(270deg) rotateX(60deg) translateZ(24px)",
//             clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
//           }}
//         />
//       </div>
//     </motion.div>
//   );
// }

// // 3D Sphere with wireframe
// function Floating3DSphere({
//   position,
//   delay,
// }: {
//   position: string;
//   delay: number;
// }) {
//   return (
//     <motion.div
//       className={`absolute ${position} w-20 h-20`}
//       initial={{ opacity: 0, scale: 0 }}
//       animate={{
//         opacity: 0.2,
//         scale: 1,
//         rotateX: [0, 360],
//         rotateY: [0, 360],
//       }}
//       transition={{
//         opacity: { duration: 1.5, delay },
//         scale: { duration: 1.5, delay },
//         rotateX: { duration: 25, repeat: Infinity, ease: "linear" },
//         rotateY: { duration: 30, repeat: Infinity, ease: "linear" },
//       }}
//       style={{
//         transformStyle: "preserve-3d",
//       }}
//     >
//       <div className="relative w-full h-full rounded-full border-2 border-dashed border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
//         {/* Wireframe lines */}
//         <div
//           className="absolute inset-0 rounded-full border border-purple-500/20"
//           style={{ transform: "rotateX(30deg)" }}
//         />
//         <div
//           className="absolute inset-0 rounded-full border border-pink-500/20"
//           style={{ transform: "rotateX(60deg)" }}
//         />
//         <div
//           className="absolute inset-0 rounded-full border border-blue-500/20"
//           style={{ transform: "rotateY(30deg)" }}
//         />
//         <div
//           className="absolute inset-0 rounded-full border border-purple-500/20"
//           style={{ transform: "rotateY(60deg)" }}
//         />
//       </div>
//     </motion.div>
//   );
// }

// // Interactive 3D Card with mouse tracking
// function Interactive3DCard({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const cardRef = useRef<HTMLDivElement>(null);

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!cardRef.current) return;

//     const rect = cardRef.current.getBoundingClientRect();
//     const centerX = rect.left + rect.width / 2;
//     const centerY = rect.top + rect.height / 2;

//     setMousePosition({
//       x: (e.clientX - centerX) / 10,
//       y: (e.clientY - centerY) / 10,
//     });
//   };

//   const handleMouseLeave = () => {
//     setMousePosition({ x: 0, y: 0 });
//   };

//   return (
//     <motion.div
//       ref={cardRef}
//       className={`transform-gpu ${className}`}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       animate={{
//         rotateX: -mousePosition.y,
//         rotateY: mousePosition.x,
//       }}
//       transition={{
//         type: "spring",
//         stiffness: 300,
//         damping: 30,
//       }}
//       style={{
//         transformStyle: "preserve-3d",
//         perspective: "1000px",
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// }

// // Optimized Mouse-following particle system (reduced particles)
// function MouseFollowParticles() {
//   const [particles, setParticles] = useState<
//     Array<{ id: number; x: number; y: number; delay: number }>
//   >([]);

//   useEffect(() => {
//     let throttleTimer: NodeJS.Timeout;
    
//     const handleMouseMove = (e: MouseEvent) => {
//       // Throttle particle creation to reduce performance impact
//       if (throttleTimer) return;
      
//       throttleTimer = setTimeout(() => {
//         const newParticle = {
//           id: Date.now(),
//           x: e.clientX,
//           y: e.clientY,
//           delay: Math.random() * 0.3,
//         };

//         setParticles((prev) => [...prev.slice(-3), newParticle]); // Reduced from 10 to 3
//         throttleTimer = null as any;
//       }, 100); // Throttle to every 100ms
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       if (throttleTimer) clearTimeout(throttleTimer);
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 pointer-events-none z-10">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className="absolute w-1.5 h-1.5 bg-blue-400/60 rounded-full"
//           initial={{
//             x: particle.x - 3,
//             y: particle.y - 3,
//             opacity: 0.6,
//             scale: 1,
//           }}
//           animate={{
//             opacity: 0,
//             scale: 0,
//             y: particle.y - 30,
//           }}
//           transition={{
//             duration: 1.5, // Reduced duration
//             delay: particle.delay,
//             ease: "easeOut",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// // Advanced 3D DNA Helix
// function DNA3DHelix({ position, delay }: { position: string; delay: number }) {
//   return (
//     <motion.div
//       className={`absolute ${position} w-24 h-32`}
//       initial={{ opacity: 0, scale: 0 }}
//       animate={{
//         opacity: 0.15,
//         scale: 1,
//         rotateY: [0, 360],
//       }}
//       transition={{
//         opacity: { duration: 2, delay },
//         scale: { duration: 2, delay },
//         rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
//       }}
//       style={{ transformStyle: "preserve-3d" }}
//     >
//       {/* DNA strands */}
//       {[...Array(8)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/40 to-blue-500/40 rounded-full"
//           style={{
//             left: `${Math.cos(i * 0.8) * 20 + 50}%`,
//             top: `${i * 12}%`,
//             transform: `translateZ(${Math.sin(i * 0.8) * 10}px)`,
//           }}
//           animate={{
//             rotateY: [0, 360],
//             scale: [1, 1.2, 1],
//           }}
//           transition={{
//             rotateY: {
//               duration: 20,
//               repeat: Infinity,
//               ease: "linear",
//               delay: i * 0.1,
//             },
//             scale: {
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: i * 0.2,
//             },
//           }}
//         />
//       ))}
//       {[...Array(8)].map((_, i) => (
//         <motion.div
//           key={`strand2-${i}`}
//           className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/40 to-pink-500/40 rounded-full"
//           style={{
//             left: `${Math.cos(i * 0.8 + Math.PI) * 20 + 50}%`,
//             top: `${i * 12}%`,
//             transform: `translateZ(${Math.sin(i * 0.8 + Math.PI) * 10}px)`,
//           }}
//           animate={{
//             rotateY: [0, 360],
//             scale: [1, 1.2, 1],
//           }}
//           transition={{
//             rotateY: {
//               duration: 20,
//               repeat: Infinity,
//               ease: "linear",
//               delay: i * 0.1,
//             },
//             scale: {
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: i * 0.2 + 1,
//             },
//           }}
//         />
//       ))}
//     </motion.div>
//   );
// }

// // 3D Holographic Display
// function Holographic3DDisplay({
//   position,
//   delay,
// }: {
//   position: string;
//   delay: number;
// }) {
//   return (
//     <motion.div
//       className={`absolute ${position} w-32 h-20`}
//       initial={{ opacity: 0, rotateX: -90 }}
//       animate={{
//         opacity: 0.3,
//         rotateX: 0,
//       }}
//       transition={{
//         opacity: { duration: 2, delay },
//         rotateX: { duration: 2, delay },
//       }}
//       style={{ transformStyle: "preserve-3d" }}
//     >
//       {/* Holographic layers */}
//       {[...Array(5)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute inset-0 border border-cyan-400/20 rounded-lg"
//           style={{
//             transform: `translateZ(${i * 8}px)`,
//             background: `linear-gradient(45deg, rgba(6, 182, 212, ${
//               0.1 - i * 0.02
//             }) 0%, rgba(139, 92, 246, ${0.1 - i * 0.02}) 100%)`,
//           }}
//           animate={{
//             rotateY: [0, 360],
//             scale: [1, 1.05, 1],
//           }}
//           transition={{
//             rotateY: { duration: 15 + i * 2, repeat: Infinity, ease: "linear" },
//             scale: {
//               duration: 3 + i * 0.5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             },
//           }}
//         >
//           {/* Scanning lines */}
//           <motion.div
//             className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
//             animate={{
//               y: ["-100%", "200%"],
//             }}
//             transition={{
//               duration: 2 + i * 0.3,
//               repeat: Infinity,
//               ease: "linear",
//               delay: i * 0.4,
//             }}
//             style={{ height: "20%" }}
//           />
//         </motion.div>
//       ))}
//     </motion.div>
//   );
// }

// export const HeroSection = () => {
//   const heroRef = useRef<HTMLDivElement>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   // Mouse tracking for 3D effects
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({
//         x: (e.clientX / window.innerWidth - 0.5) * 2,
//         y: (e.clientY / window.innerHeight - 0.5) * 2,
//       });
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   useEffect(() => {
//     if (heroRef.current) {
//       // GSAP timeline for hero animations
//       const tl = gsap.timeline();

//       tl.fromTo(
//         ".hero-badge",
//         { opacity: 0, y: 30, scale: 0.8 },
//         { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
//       )
//         .fromTo(
//           ".hero-title",
//           { opacity: 0, y: 100, scale: 0.8 },
//           { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
//           "-=0.4"
//         )
//         .fromTo(
//           ".hero-subtitle",
//           { opacity: 0, y: 50 },
//           { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
//           "-=0.5"
//         )
//         .fromTo(
//           ".hero-description",
//           { opacity: 0, y: 30 },
//           { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
//           "-=0.3"
//         )
//         .fromTo(
//           ".hero-buttons",
//           { opacity: 0, y: 30 },
//           { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
//           "-=0.2"
//         );

//       // Floating animation for background elements
//       gsap.to(".floating-element", {
//         y: -20,
//         duration: 4,
//         ease: "power1.inOut",
//         yoyo: true,
//         repeat: -1,
//         stagger: 0.8,
//       });

//       // Rotate animation for decorative elements
//       gsap.to(".rotating-element", {
//         rotation: 360,
//         duration: 20,
//         ease: "none",
//         repeat: -1,
//       });
//     }
//   }, []);

//   const features = [
//     {
//       icon: Bot,
//       title: "AI-Powered Chatbots",
//       description:
//         "Create intelligent chatbots with advanced AI capabilities and natural language processing.",
//     },
//     {
//       icon: Zap,
//       title: "Lightning Fast",
//       description:
//         "Deploy your chatbots instantly with our optimized infrastructure and global CDN.",
//     },
//     {
//       icon: Shield,
//       title: "Enterprise Security",
//       description:
//         "Bank-grade security with end-to-end encryption and compliance certifications.",
//     },
//     {
//       icon: Globe,
//       title: "Global Scale",
//       description:
//         "Scale to millions of conversations with our distributed cloud architecture.",
//     },
//   ];



//   return (
//     <div ref={heroRef} className="relative min-h-screen overflow-hidden">
//       {/* Mouse-following particles */}
//       <MouseFollowParticles />

//       {/* Background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

//       {/* Grid pattern */}
//       <div className="absolute inset-0 bg-grid-pattern opacity-30" />

//       {/* Animated background shapes */}
//       <div className="absolute inset-0 overflow-hidden">
//         <FloatingOrb
//           size="w-72 h-72"
//           color="bg-gradient-to-br from-blue-400 to-purple-400"
//           delay={0}
//           duration={15}
//         />
//         <FloatingOrb
//           size="w-96 h-96"
//           color="bg-gradient-to-br from-purple-400 to-pink-400"
//           delay={2}
//           duration={18}
//         />
//         <FloatingOrb
//           size="w-80 h-80"
//           color="bg-gradient-to-br from-pink-400 to-blue-400"
//           delay={4}
//           duration={12}
//         />
//       </div>

//       {/* 3D Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {/* 3D Cubes */}
//         <Floating3DCube position="top-20 left-1/4" delay={1} />
//         <Floating3DCube position="top-1/3 right-20" delay={2.5} />
//         <Floating3DCube position="bottom-1/3 left-10" delay={4} />

//         {/* 3D Pyramids */}
//         <Floating3DPyramid position="top-1/2 left-1/6" delay={1.5} />
//         <Floating3DPyramid position="bottom-20 right-1/4" delay={3} />

//         {/* 3D Spheres */}
//         <Floating3DSphere position="top-40 right-1/3" delay={2} />
//         <Floating3DSphere position="bottom-40 left-1/3" delay={3.5} />

//         {/* Advanced 3D Elements */}
//         <DNA3DHelix position="top-1/3 left-1/5" delay={2.5} />
//         <Holographic3DDisplay position="bottom-1/3 right-1/5" delay={3.5} />

//         {/* Additional geometric shapes */}
//         <motion.div
//           className="absolute top-1/4 left-1/2 w-8 h-8"
//           animate={{
//             rotateX: [0, 360],
//             rotateY: [0, 360],
//             scale: [1, 1.5, 1],
//           }}
//           transition={{
//             rotateX: { duration: 12, repeat: Infinity, ease: "linear" },
//             rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
//             scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
//           }}
//           style={{ transformStyle: "preserve-3d" }}
//         >
//           <div className="w-full h-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-400/50 transform rotate-45" />
//         </motion.div>

//         <motion.div
//           className="absolute bottom-1/4 right-1/6 w-6 h-6"
//           animate={{
//             rotateZ: [0, 360],
//             scale: [1, 1.3, 1],
//             opacity: [0.3, 0.6, 0.3],
//           }}
//           transition={{
//             rotateZ: { duration: 10, repeat: Infinity, ease: "linear" },
//             scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
//             opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
//           }}
//         >
//           <div className="w-full h-full bg-gradient-to-br from-pink-400/40 to-purple-500/40 rounded-full border border-pink-400/60" />
//         </motion.div>
//       </div>

//       {/* Decorative elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {/* Floating icons */}
//         <motion.div
//           className="absolute top-20 left-10 text-blue-500/20"
//           animate={{
//             y: [0, -20, 0],
//             rotate: [0, 10, -10, 0],
//           }}
//           transition={{ duration: 6, repeat: Infinity }}
//         >
//           <Bot className="w-12 h-12" />
//         </motion.div>

//         <motion.div
//           className="absolute top-40 right-20 text-purple-500/20"
//           animate={{
//             y: [0, 20, 0],
//             rotate: [0, -15, 15, 0],
//           }}
//           transition={{ duration: 8, repeat: Infinity, delay: 1 }}
//         >
//           <Sparkles className="w-16 h-16" />
//         </motion.div>

//         <motion.div
//           className="absolute bottom-40 left-20 text-pink-500/20"
//           animate={{
//             y: [0, -15, 0],
//             rotate: [0, 20, -20, 0],
//           }}
//           transition={{ duration: 7, repeat: Infinity, delay: 2 }}
//         >
//           <MessageCircle className="w-14 h-14" />
//         </motion.div>

//         {/* Rotating rings */}
//         <div className="rotating-element absolute top-1/4 right-1/4 w-32 h-32 border-2 border-blue-500/10 rounded-full" />
//         <div
//           className="rotating-element absolute bottom-1/4 left-1/4 w-24 h-24 border-2 border-purple-500/10 rounded-full"
//           style={{ animationDelay: "-5s" }}
//         />
//       </div>

//       {/* Content */}
//       <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
//         <div className="text-center max-w-4xl mx-auto">
//           {/* Badge */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.6 }}
//             className="mb-8"
//           >
//             <span className="hero-badge inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 backdrop-blur-sm">
//               <Sparkles className="w-4 h-4 mr-2" />
//               Next-Generation AI Chatbot Platform
//               <Star className="w-4 h-4 ml-2" />
//             </span>
//           </motion.div>

//           {/* Main heading */}
//           <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
//             <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
//               Build Intelligent
//             </span>
//             <br />
//             <span className="text-foreground">Chatbots in</span>
//             <br />
//             <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
//               Minutes
//             </span>
//           </h1>

//           <p className="hero-description text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
//             Create, deploy, and scale AI-powered chatbots that understand your
//             customers. Upload your documents, customize the experience, and
//             watch your chatbot come to life.
//             <span className="block mt-2 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               No coding required. Enterprise-ready security. Global
//               infrastructure.
//             </span>
//           </p>

//           {/* CTA Buttons */}
//           <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center mb-16">
//             <Button
//               asChild
//               size="lg"
//               className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6 group"
//             >
//               <Link href="/signin" className="flex items-center">
//                 Get Started Free
//                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
//               </Link>
//             </Button>
//             {/* <Button asChild variant="outline" size="lg" className="border-2 hover:bg-accent/50 text-lg px-8 py-6 backdrop-blur-sm">
//               <Link href="#demo">
//                 <MessageCircle className="mr-2 h-5 w-5" />
//                 Watch Demo
//               </Link>
//             </Button> */}
//           </div>

       

//           {/* Features Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
//             {features.map((feature, index) => (
//               <FeatureCard
//                 key={feature.title}
//                 icon={feature.icon}
//                 title={feature.title}
//                 description={feature.description}
//                 delay={1.2 + index * 0.1}
//               />
//             ))}
//           </div>

//           {/* Trust indicators */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 1.8 }}
//             className="mt-16 pt-8 border-t border-border/50"
//           >
//             <p className="text-sm text-muted-foreground mb-6">
//               Trusted by companies worldwide
//             </p>
//             <div className="flex items-center justify-center space-x-8 opacity-50">
//               <div className="flex items-center space-x-2">
//                 <Shield className="w-5 h-5" />
//                 <span className="text-sm font-medium">SOC 2 Compliant</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Globe className="w-5 h-5" />
//                 <span className="text-sm font-medium">Global CDN</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Users className="w-5 h-5" />
//                 <span className="text-sm font-medium">24/7 Support</span>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Floating Action Button */}
//       <motion.div
//         initial={{ opacity: 0, scale: 0 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6, delay: 2 }}
//         className="fixed bottom-8 right-8 z-30"
//       >
//         <Button
//           size="lg"
//           className="rounded-full h-14 w-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-pulse-glow"
//         >
//           <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
//         </Button>
//       </motion.div>

//       {/* Scroll Indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.6, delay: 2.2 }}
//         className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
//       >
//         <div className="flex flex-col items-center space-y-2">
//           <span className="text-sm text-muted-foreground">
//             Scroll to explore
//           </span>
//           <motion.div
//             animate={{ y: [0, 10, 0] }}
//             transition={{ duration: 2, repeat: Infinity }}
//             className="h-6 w-4 border-2 border-purple-500/50 rounded-full flex justify-center"
//           >
//             <motion.div
//               animate={{ y: [0, 8, 0] }}
//               transition={{ duration: 2, repeat: Infinity }}
//               className="w-1 h-2 bg-purple-500 rounded-full mt-1"
//             />
//           </motion.div>
//         </div>
//       </motion.div>

//       {/* Bottom gradient fade */}
//       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-30" />
//     </div>
//   );
// };
