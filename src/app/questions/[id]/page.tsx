"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuestion } from "@/lib/api";

export default function QuestionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [markSuccess, setMarkSuccess] = useState(false);

  const { data: question, isLoading, isError, error } = useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestion(id),
  });

  const markMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/questions/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      setMarkSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setTimeout(() => setMarkSuccess(false), 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex h-screen items-center justify-center flex-col text-error">
        <span className="material-symbols-outlined text-4xl mb-4">error</span>
        <p>{error?.message || "Question not found"}</p>
        <Link href="/questions" className="mt-4 text-primary underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-[16px]">
            <Link href="/questions" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="h-4 w-[1px] bg-outline-variant"></div>
            <div className="flex items-center gap-[8px] text-on-surface-variant font-label-md text-sm">
              <Link href="/questions" className="hover:text-on-surface transition-colors">Problems</Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-on-surface">{question.title}</span>
            </div>
          </div>
          <Link href="/settings" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto p-[24px]">
          
          {/* Title Section */}
          <div className="mb-[40px]">
            <div className="flex items-center gap-[16px] mb-[16px]">
              <span className={`bg-surface-container-high text-on-surface-variant font-label-md text-[11px] px-2 py-0.5 rounded uppercase tracking-widest font-bold ${question.difficulty === 'Easy' ? 'border-l-2 border-emerald-500' : question.difficulty === 'Medium' ? 'border-l-2 border-amber-500' : 'border-l-2 border-rose-500'}`}>
                {question.difficulty}
              </span>
              <span className="text-on-surface-variant font-label-md text-label-md">{question.topic}</span>
            </div>
            <div className="flex justify-between items-end">
              <h1 className="font-headline-md text-[48px] text-on-surface font-bold leading-tight tracking-tight">
                {question.title}
              </h1>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => markMutation.mutate('Attempted')} 
                  disabled={markMutation.isPending}
                  className="flex items-center gap-[8px] bg-surface-container-low hover:bg-surface-container-high border border-outline-variant px-[16px] py-[8px] rounded-lg transition-colors font-label-md text-label-md text-on-surface active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span> 
                  {markMutation.isPending ? 'Saving...' : markSuccess ? 'Done ✓' : 'Mark Attempted'}
                </button>
                <a href={question.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[8px] bg-primary text-on-primary px-[24px] py-[8px] rounded-lg hover:brightness-110 transition-all font-label-md text-label-md shadow-lg shadow-primary/20 active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">code</span>
                  Solve on LeetCode
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
            
            {/* Left: Timeline */}
            <div className="lg:col-span-4">
              <div className="glass-panel p-[32px] rounded-2xl border border-outline-variant h-full">
                <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-widest text-[11px] mb-[32px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">history</span>
                  Review History
                </h3>

                <div className="relative border-l border-outline-variant ml-[16px] space-y-[32px] pb-[16px]">
                  {question.reviewLogs && question.reviewLogs.length > 0 ? (
                    question.reviewLogs.map((log) => (
                      <div key={log.id} className="relative pl-[32px]">
                        <div className={`absolute left-0 top-[2px] w-[11px] h-[11px] -translate-x-[6px] rounded-full ring-4 ring-surface-container bg-surface-container border-2 ${log.confidenceScore >= 4 ? 'border-emerald-500' : log.confidenceScore === 3 ? 'border-amber-500' : 'border-rose-500'}`}></div>
                        <p className="font-label-md text-[11px] text-on-surface-variant font-mono mb-[4px]">{new Date(log.reviewDate).toLocaleDateString()}</p>
                        <p className="text-body-sm text-on-surface">
                          {log.confidenceScore >= 4 ? 'Solved easily' : log.confidenceScore === 3 ? 'Solved with effort' : 'Struggled'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="pl-[32px] text-sm text-on-surface-variant italic">No reviews yet. Start practicing!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="lg:col-span-8 flex flex-col gap-[24px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[24px]">
                <div className="glass-panel p-[24px] rounded-2xl border border-outline-variant">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Total Attempts</p>
                  <p className="text-3xl font-bold font-headline-md">{question.progress?.[0]?.totalAttempts || 0}</p>
                </div>
                <div className="glass-panel p-[24px] rounded-2xl border border-outline-variant">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Status</p>
                  <p className={`text-xl font-bold font-headline-md ${question.progress?.[0]?.status === 'Solved' ? 'text-emerald-500' : question.progress?.[0]?.status === 'Attempted' ? 'text-amber-500' : 'text-on-surface-variant'}`}>
                    {question.progress?.[0]?.status || 'Not started'}
                  </p>
                </div>
                <div className="glass-panel p-[24px] rounded-2xl border border-outline-variant">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Best Time</p>
                  <p className="text-3xl font-bold font-headline-md font-mono">
                    {question.progress?.[0]?.bestSolveTimeMs ? `${Math.floor(question.progress[0].bestSolveTimeMs / 60000)}m` : '--'}
                  </p>
                </div>
              </div>

              {/* Links */}
              <div className="glass-panel p-[24px] rounded-2xl border border-outline-variant">
                <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-widest text-[11px] mb-[16px]">Quick Links</h3>
                <div className="flex flex-col gap-3">
                  <a href={question.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-primary hover:underline text-sm">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                    LeetCode Problem
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
