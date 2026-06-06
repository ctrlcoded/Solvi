"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getStudyPlan, generateStudyPlan, getQuestions, StudyPlanDay } from "@/lib/api";
import Link from "next/link";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const TOPIC_ORDER = [
  "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack",
  "Binary Search", "Linked List", "Trees", "Heap / Priority Queue",
  "Backtracking", "Tries", "Graphs", "Advanced Graphs",
  "1-D Dynamic Programming", "2-D Dynamic Programming", "Greedy",
  "Intervals", "Math & Geometry", "Bit Manipulation"
];

type Rating = "Strong" | "Average" | "Weak";

export default function PlanPage() {
  const [step, setStep] = useState(1);
  const [totalDays, setTotalDays] = useState(30);
  const [ratings, setRatings] = useState<Record<string, Rating>>(() => {
    const init: Record<string, Rating> = {};
    TOPIC_ORDER.forEach(t => init[t] = "Average");
    return init;
  });
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]));
  const [apiKey, setApiKey] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    sessionStorage.setItem("gemini_api_key", val);
  };

  // Fetch existing plan
  const { data: existingPlan, isLoading: planLoading } = useQuery({
    queryKey: ['studyPlan'],
    queryFn: getStudyPlan,
  });

  // Fetch questions for topic counts
  const { data: questions } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions,
  });

  // Topic counts
  const topicCounts: Record<string, number> = {};
  questions?.forEach(q => {
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  });

  const generateMutation = useMutation({
    mutationFn: generateStudyPlan,
    onSuccess: () => {
      setStep(4);
    },
  });

  const handleGenerate = () => {
    if (!apiKey.trim()) {
      alert("Please enter your Gemini API Key.");
      return;
    }
    setStep(3); // loading
    generateMutation.mutate({ totalDays, ratings, apiKey: apiKey.trim() });
  };

  const plan: { days: StudyPlanDay[] } | null = generateMutation.data?.plan || existingPlan?.plan || null;

  const toggleDay = (day: number) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  };

  // Show existing plan
  if (planLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  // If we have an existing plan and haven't started the wizard
  if (existingPlan && step === 1 && !generateMutation.data && !isCreatingNew) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
          <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
            <div className="flex items-center gap-[8px] text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
              <span className="font-headline-md text-headline-md font-semibold tracking-tight">Study Plan</span>
            </div>
            <AnimatedButton onClick={() => setIsCreatingNew(true)} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-sm hover:brightness-110 shadow-sm">
              Create New Plan
            </AnimatedButton>
          </div>
        </header>

        <div className="pt-24 px-[24px] pb-[64px] max-w-[1000px] mx-auto w-full">
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Your {existingPlan.totalDays}-Day Plan</h2>
            <p className="text-on-surface-variant font-label-md">Created {new Date(existingPlan.createdAt!).toLocaleDateString()}</p>
          </div>

          <div className="space-y-3">
            {existingPlan.plan.days.map((day: StudyPlanDay) => (
              <AnimatedCard key={day.day} className="glass-panel rounded-xl border border-outline-variant overflow-hidden">
                <button onClick={() => toggleDay(day.day)} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <span className="bg-primary text-on-primary w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm">
                      D{day.day}
                    </span>
                    <div>
                      <p className="font-label-md text-on-surface font-bold">{day.focus}</p>
                      <p className="text-[12px] text-on-surface-variant">{day.questions.length} questions</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${openDays.has(day.day) ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {openDays.has(day.day) && (
                  <div className="border-t border-outline-variant divide-y divide-outline-variant/50">
                    {day.questions.map((q, idx) => (
                      <Link key={idx} href={`/questions/${q.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">code</span>
                          <span className="text-on-surface text-sm font-medium">{q.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-outline-variant/30 text-on-surface-variant px-2 py-0.5 rounded text-xs font-mono">{q.topic}</span>
                          <span className={`text-xs font-bold ${q.difficulty === 'Easy' ? 'text-emerald-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>{q.difficulty}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </AnimatedCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-[8px] text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
            <span className="font-headline-md text-headline-md font-semibold tracking-tight">Create Study Plan</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-8 h-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-outline-variant'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="pt-24 px-[24px] pb-[64px] max-w-[800px] mx-auto w-full">

        {/* Step 1: Days */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-12">
              <span className="material-symbols-outlined text-primary text-[48px] mb-4 block">calendar_month</span>
              <h2 className="font-headline-md text-[32px] font-bold text-on-surface mb-3">How many days do you have?</h2>
              <p className="text-on-surface-variant text-lg">We'll plan your NeetCode 150 journey accordingly.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-outline-variant mb-8">
              <div className="text-center mb-6">
                <span className="text-[64px] font-bold text-primary font-headline-md">{totalDays}</span>
                <p className="text-on-surface-variant font-label-md">days</p>
              </div>
              <input
                type="range"
                min={7}
                max={90}
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-3 text-xs text-on-surface-variant font-mono">
                <span>7 days</span>
                <span>~{Math.ceil(150 / totalDays)} questions/day</span>
                <span>90 days</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { days: 14, label: "Sprint", desc: "~11/day" },
                { days: 30, label: "Balanced", desc: "~5/day" },
                { days: 60, label: "Relaxed", desc: "~3/day" },
              ].map(preset => (
                <AnimatedButton
                  key={preset.days}
                  onClick={() => setTotalDays(preset.days)}
                  className={`p-4 rounded-xl border text-center transition-all ${totalDays === preset.days ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-outline'}`}
                >
                  <p className="font-bold text-on-surface text-lg">{preset.days}d</p>
                  <p className="text-on-surface-variant text-xs">{preset.label}</p>
                  <p className="text-on-surface-variant text-[10px]">{preset.desc}</p>
                </AnimatedButton>
              ))}
            </div>

            <div className="flex gap-4">
              {existingPlan && (
                <AnimatedButton onClick={() => setIsCreatingNew(false)} className="flex-1 border border-outline-variant text-on-surface py-4 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-colors">
                  Cancel
                </AnimatedButton>
              )}
              <AnimatedButton onClick={() => setStep(2)} className="flex-[2] bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold text-lg hover:brightness-110 shadow-md">
                Next → Rate Topics
              </AnimatedButton>
            </div>
          </div>
        )}

        {/* Step 2: Topic Ratings */}
        {step === 2 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <span className="material-symbols-outlined text-primary text-[48px] mb-4 block">tune</span>
              <h2 className="font-headline-md text-[28px] font-bold text-on-surface mb-3">Rate yourself on each topic</h2>
              <p className="text-on-surface-variant">This helps the AI prioritize what you need to practice most.</p>
            </div>

            <div className="space-y-3 mb-8">
              {TOPIC_ORDER.map(topic => (
                <AnimatedCard key={topic} className="glass-panel p-4 rounded-xl border border-outline-variant flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-on-surface font-bold text-sm truncate">{topic}</p>
                    <p className="text-[11px] text-on-surface-variant">{topicCounts[topic] || 0} questions</p>
                  </div>
                  <div className="flex gap-2">
                    {(["Weak", "Average", "Strong"] as Rating[]).map(level => (
                      <AnimatedButton
                        key={level}
                        onClick={() => setRatings(prev => ({ ...prev, [topic]: level }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          ratings[topic] === level
                            ? level === "Weak" ? "bg-rose-500 text-white"
                            : level === "Average" ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                            : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {level}
                      </AnimatedButton>
                    ))}
                  </div>
                </AnimatedCard>
              ))}
            </div>

            <div className="mb-6 p-6 glass-panel rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface font-bold text-sm mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">key</span>
                Gemini API Key
              </h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Your key is required to generate the plan. It is stored safely in your browser's session memory and is never saved on our servers.
              </p>
              <input 
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="AIzaSy..."
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex gap-4">
              <AnimatedButton onClick={() => setStep(1)} className="flex-1 border border-outline-variant text-on-surface py-4 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-colors">
                ← Back
              </AnimatedButton>
              <AnimatedButton onClick={handleGenerate} className="flex-[2] bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold text-lg hover:brightness-110 shadow-md disabled:opacity-50" disabled={!apiKey.trim()}>
                Generate Plan ✨
              </AnimatedButton>
            </div>
          </div>
        )}

        {/* Step 3: Loading */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-500">
            <span className="material-symbols-outlined animate-spin text-primary text-[64px] mb-6">auto_awesome</span>
            <h2 className="font-headline-md text-[24px] font-bold text-on-surface mb-3">AI is crafting your plan...</h2>
            <p className="text-on-surface-variant text-center max-w-md">
              Analyzing your skill levels and optimizing the order of all 150 questions across {totalDays} days. This takes about 10-15 seconds.
            </p>
            {generateMutation.isError && (
              <div className="mt-8 p-4 bg-error/10 border border-error/30 rounded-xl text-center">
                <p className="text-error font-bold mb-2">Generation failed</p>
                <p className="text-error/80 text-sm mb-4">{generateMutation.error.message}</p>
                <button onClick={() => setStep(2)} className="text-primary underline text-sm">Go back and try again</button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: View Plan */}
        {step === 4 && plan && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <span className="material-symbols-outlined text-primary text-[48px] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h2 className="font-headline-md text-[28px] font-bold text-on-surface mb-3">Your {totalDays}-Day Plan is Ready!</h2>
              <p className="text-on-surface-variant">Click any day to see the questions. Click a question to go to its detail page.</p>
            </div>

            <div className="space-y-3">
              {plan.days.map((day: StudyPlanDay) => (
                <AnimatedCard key={day.day} className="glass-panel rounded-xl border border-outline-variant overflow-hidden">
                  <button onClick={() => toggleDay(day.day)} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <span className="bg-primary text-on-primary w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm">
                        D{day.day}
                      </span>
                      <div>
                        <p className="font-label-md text-on-surface font-bold">{day.focus}</p>
                        <p className="text-[12px] text-on-surface-variant">{day.questions.length} questions</p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${openDays.has(day.day) ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openDays.has(day.day) && (
                    <div className="border-t border-outline-variant divide-y divide-outline-variant/50">
                      {day.questions.map((q, idx) => (
                        <Link key={idx} href={`/questions/${q.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-surface-container-high transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">code</span>
                            <span className="text-on-surface text-sm font-medium">{q.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="bg-outline-variant/30 text-on-surface-variant px-2 py-0.5 rounded text-xs font-mono">{q.topic}</span>
                            <span className={`text-xs font-bold ${q.difficulty === 'Easy' ? 'text-emerald-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>{q.difficulty}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
