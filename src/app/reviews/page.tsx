"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodayReviews, submitReview, Question } from "@/lib/api";
import Link from "next/link";

export default function Reviews() {
  const [revealed, setRevealed] = useState(false);
  const queryClient = useQueryClient();

  const { data: queue, isLoading, isError, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: getTodayReviews,
  });

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['reviews'] });
      const previousQueue = queryClient.getQueryData<Question[]>(['reviews']);
      queryClient.setQueryData<Question[]>(['reviews'], (old) => {
        return old ? old.filter(q => q.id !== variables.questionId) : [];
      });
      setRevealed(false);
      return { previousQueue };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousQueue) {
        queryClient.setQueryData(['reviews'], context.previousQueue);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const activeQuestion = queue?.[0];

  const handleReview = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    if (!activeQuestion) return;
    reviewMutation.mutate({
      userId: activeQuestion.progress?.[0]?.userId || 'mock-user-id',
      questionId: activeQuestion.id,
      difficulty
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-[8px] text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">event_repeat</span>
            <span className="font-headline-md text-headline-md font-semibold tracking-tight">Today's Reviews</span>
            {!isLoading && !isError && (
              <span className="bg-primary/10 text-primary font-mono text-[12px] px-2 py-0.5 rounded ml-2 font-bold">{queue?.length || 0} left</span>
            )}
          </div>
          <Link href="/settings" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </Link>
        </div>
      </header>

      <div className="pt-16 min-h-screen">
        <div className="max-w-[1000px] mx-auto p-[24px]">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">progress_activity</span>
              <p>Loading your queue...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-error">
              <span className="material-symbols-outlined text-4xl mb-4">error</span>
              <p>{error.message || "Failed to load queue."}</p>
            </div>
          ) : !activeQuestion ? (
            <div className="flex flex-col items-center justify-center h-64 text-emerald-500">
              <span className="material-symbols-outlined text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h2 className="text-2xl font-bold font-headline-md">All done for today!</h2>
              <p className="text-on-surface-variant text-sm mt-2">No questions due for review. Come back tomorrow.</p>
              <Link href="/questions" className="mt-4 text-primary underline font-label-md">Browse all questions →</Link>
            </div>
          ) : (
            <section className="mb-[64px]">
              <div className="glass-panel rounded-2xl overflow-hidden relative border border-outline-variant shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary"></div>
                
                <div className="p-[40px]">
                  <div className="flex justify-between items-start mb-[24px]">
                    <div>
                      <div className="flex items-center gap-[16px] mb-[8px]">
                        <span className={`bg-surface-container-high text-on-surface-variant font-label-md text-[11px] px-2 py-0.5 rounded uppercase tracking-widest font-bold ${activeQuestion.difficulty === 'Easy' ? 'border-l-2 border-emerald-500' : activeQuestion.difficulty === 'Medium' ? 'border-l-2 border-amber-500' : 'border-l-2 border-rose-500'}`}>
                          {activeQuestion.difficulty}
                        </span>
                        <span className="text-on-surface-variant font-label-md text-label-md">{activeQuestion.topic}</span>
                      </div>
                      <h2 className="font-headline-md text-display-lg-mobile text-on-surface font-bold">{activeQuestion.title}</h2>
                    </div>
                  </div>

                  {/* Solution Area */}
                  <div className={`relative transition-all duration-500 ${revealed ? 'min-h-0' : 'min-h-[200px]'}`}>
                    {!revealed && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-container-low/40 backdrop-blur-sm border border-outline-variant border-dashed rounded-xl">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-[16px] opacity-50">visibility_off</span>
                        <button 
                          onClick={() => setRevealed(true)}
                          className="bg-primary text-on-primary font-label-md text-label-md px-[24px] py-[12px] rounded-lg hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20"
                        >
                          I've thought about it — show answer
                        </button>
                      </div>
                    )}

                    {/* Revealed */}
                    <div className={`transition-opacity duration-500 ${revealed ? 'opacity-100 relative z-20' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                      <div className="border-l-4 border-l-primary bg-surface-container-lowest p-[24px] rounded-r-xl border border-outline-variant mb-[32px]">
                        <h4 className="font-label-md text-label-md text-primary font-bold mb-[16px] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">link</span>
                          Problem Link
                        </h4>
                        <a href={activeQuestion.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono text-sm">{activeQuestion.url}</a>
                      </div>

                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">How did it go?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                        <button onClick={() => handleReview('Easy')} disabled={reviewMutation.isPending} className="flex flex-col items-center text-center p-[16px] rounded-xl border border-outline-variant hover:border-emerald-500 bg-surface-container hover:bg-emerald-500/10 transition-all group active:scale-95 disabled:opacity-50">
                          <span className="material-symbols-outlined text-emerald-500 mb-2 text-[24px] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <p className="font-label-md text-label-md text-on-surface font-bold mb-1">Easy</p>
                          <p className="text-[11px] text-on-surface-variant">Got it right away</p>
                        </button>
                        <button onClick={() => handleReview('Medium')} disabled={reviewMutation.isPending} className="flex flex-col items-center text-center p-[16px] rounded-xl border border-outline-variant hover:border-amber-500 bg-surface-container hover:bg-amber-500/10 transition-all group active:scale-95 disabled:opacity-50">
                          <span className="material-symbols-outlined text-amber-500 mb-2 text-[24px] group-hover:scale-110 transition-transform">pending</span>
                          <p className="font-label-md text-label-md text-on-surface font-bold mb-1">Medium</p>
                          <p className="text-[11px] text-on-surface-variant">Needed some time</p>
                        </button>
                        <button onClick={() => handleReview('Hard')} disabled={reviewMutation.isPending} className="flex flex-col items-center text-center p-[16px] rounded-xl border border-outline-variant hover:border-rose-500 bg-surface-container hover:bg-rose-500/10 transition-all group active:scale-95 disabled:opacity-50">
                          <span className="material-symbols-outlined text-rose-500 mb-2 text-[24px] group-hover:scale-110 transition-transform">error</span>
                          <p className="font-label-md text-label-md text-on-surface font-bold mb-1">Hard</p>
                          <p className="text-[11px] text-on-surface-variant">Couldn't solve it</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Upcoming Queue */}
          {queue && queue.length > 1 && (
            <section>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest font-bold mb-[24px]">Coming Up ({queue.length - 1})</h3>
              <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-outline-variant/50">
                    {queue.slice(1).map(q => (
                      <tr key={q.id} className="hover:bg-surface-container-high transition-colors group opacity-60">
                        <td className="px-[24px] py-[16px]">
                          <p className="font-label-md text-on-surface font-semibold">{q.title}</p>
                        </td>
                        <td className="px-[24px] py-[16px]">
                          <span className="bg-outline-variant/30 text-on-surface-variant px-2 py-1 rounded text-xs font-mono">{q.topic}</span>
                        </td>
                        <td className="px-[24px] py-[16px] text-right">
                          <span className={`font-medium text-xs ${q.difficulty === 'Easy' ? 'text-emerald-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>{q.difficulty}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
