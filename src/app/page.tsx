"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuestions, getTodayReviews } from "@/lib/api";
import Link from "next/link";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function Dashboard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  // Move the image slightly towards the mouse, max 25px in any direction
  const translateX = useTransform(springX, [-1, 1], [-25, 25]);
  const translateY = useTransform(springY, [-1, 1], [-25, 25]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1 based on screen position
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const { data: questions } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: getTodayReviews,
  });

  const solvedCount = questions?.filter(q => q.progress?.[0]?.status === 'Solved').length || 0;
  const attemptedCount = questions?.filter(q => q.progress?.[0]?.status === 'Attempted').length || 0;
  const totalCount = questions?.length || 150;
  const reviewDueCount = reviews?.length || 0;

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
          <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">Dashboard</h2>
          <div className="flex items-center gap-6 ml-6">
            <AnimatedButton as={Link} href="/settings" className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">settings</span>
            </AnimatedButton>
          </div>
        </div>
      </header>
      <div className="pt-24 px-[24px] pb-[64px] max-w-[1400px] mx-auto">
      {/* Hero Section */}
      <section className="mb-[48px]">
        <div className="relative overflow-hidden rounded-2xl bg-surface p-[48px] border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left: Text Content */}
          <div className="relative z-10 w-full md:w-1/2 flex flex-col">
            <h2 className="font-display-lg text-[56px] text-on-surface mb-6 leading-[1.1] font-bold tracking-tight">
              Your interview prep <br/><span className="text-primary italic">companion.</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                Track your progress, review with spaced repetition, and generate an AI-powered study plan tailored to your timeline.
            </p>
            <div className="flex flex-wrap gap-4">
              <AnimatedButton as={Link} href="/plan" className="bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-md font-bold transition-all shadow-md shadow-primary/30">
                  Create Study Plan
              </AnimatedButton>
              <AnimatedButton as={Link} href="/questions" className="bg-surface border border-outline-variant text-on-surface flex items-center justify-center px-8 py-3.5 rounded-lg font-label-md font-bold transition-all hover:bg-surface-container-high shadow-sm">
                  View Questions
              </AnimatedButton>
            </div>
          </div>

          {/* Right: 3D Illustration */}
          <div className="relative z-10 w-full md:w-1/2 flex justify-center items-center">
            {/* Soft pink gradient backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_60%)] opacity-[0.15] blur-3xl scale-150 rounded-full mix-blend-multiply"></div>
            
            <motion.img 
              src="/hero_illustration.png" 
              alt="Interview Prep Companion" 
              className="relative z-10 w-full max-w-[500px] h-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] mix-blend-multiply"
              style={{ 
                x: translateX,
                y: translateY,
                WebkitMaskImage: 'radial-gradient(50% 50% at 50% 50%, black 40%, transparent 100%)', 
                maskImage: 'radial-gradient(50% 50% at 50% 50%, black 40%, transparent 100%)' 
              }}
              whileHover={{ scale: 1.05 }}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[48px]"
      >
        <AnimatedCard className="glass-card p-[24px] rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary">done_all</span>
            <span className="text-primary font-bold text-[12px]">Total</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Solved</p>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{solvedCount} / {totalCount}</h3>
        </AnimatedCard>
        <AnimatedCard className="glass-card p-[24px] rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary">verified</span>
            <span className="text-primary font-bold text-[12px]">In Progress</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Attempted</p>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{attemptedCount}</h3>
        </AnimatedCard>
        <AnimatedCard className="glass-card p-[24px] rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary">percent</span>
            <span className="text-primary font-bold text-[12px]">Progress</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Completion</p>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            {totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%
          </h3>
        </AnimatedCard>
        <AnimatedCard className="glass-card p-[24px] rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            <span className="text-error font-bold text-[12px]">Due</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Reviews Today</p>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{reviewDueCount}</h3>
        </AnimatedCard>
      </motion.section>

      {/* Review Queue */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Today's Reviews ({reviewDueCount})</h3>
            <p className="text-on-surface-variant font-label-md">Questions due for spaced repetition review</p>
          </div>
          <Link href="/reviews" className="flex items-center gap-2 text-primary font-bold font-label-md border-b-2 border-primary pb-1 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            START REVIEW
          </Link>
        </div>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="flex flex-col gap-4"
        >
          {reviews?.slice(0, 5).map((q) => (
            <motion.div 
              key={q.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <AnimatedCard as={Link} href={`/questions/${q.id}`} className="glass-card p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined">code</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg text-body-lg font-bold text-on-surface mb-1">{q.title}</h4>
                    <div className="flex items-center gap-4 text-[12px]">
                      <span className="text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">category</span> {q.topic}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${q.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-500' : q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'}`}>{q.difficulty}</span>
                    </div>
                  </div>
                </div>
                <span className="bg-surface-container-high text-on-surface group-hover:bg-primary group-hover:text-on-primary px-6 py-2 rounded-lg font-label-md font-bold transition-all text-center">
                  Practice
                </span>
              </AnimatedCard>
            </motion.div>
          ))}
          {(!reviews || reviews.length === 0) && (
            <div className="text-center p-8 bg-surface-container-low rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-on-surface font-bold mb-1">All caught up!</p>
              <p className="text-on-surface-variant text-sm">No reviews due right now. Great work!</p>
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  );
}
