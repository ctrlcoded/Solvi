"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuestions, getTodayReviews } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Questions() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Set<string>>(new Set(["Easy", "Medium", "Hard"]));
  const [topicFilter, setTopicFilter] = useState<string>("All");
  const queryClient = useQueryClient();

  const { data: questions, isLoading, isError, error } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: getTodayReviews,
  });

  // Get unique topics
  const topics = useMemo(() => {
    if (!questions) return [];
    return [...new Set(questions.map(q => q.topic))].sort();
  }, [questions]);

  // Filter questions
  const filtered = useMemo(() => {
    if (!questions) return [];
    return questions.filter(q => {
      const matchSearch = search === "" || 
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase());
      const matchDifficulty = difficultyFilter.has(q.difficulty);
      const matchTopic = topicFilter === "All" || q.topic === topicFilter;
      return matchSearch && matchDifficulty && matchTopic;
    });
  }, [questions, search, difficultyFilter, topicFilter]);

  const toggleDifficulty = (d: string) => {
    setDifficultyFilter(prev => {
      const next = new Set(prev);
      if (next.has(d)) { next.delete(d); } else { next.add(d); }
      return next;
    });
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/questions/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, totalAttempts: 1 })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] });
      const previousQuestions = queryClient.getQueryData(['questions']);
      queryClient.setQueryData(['questions'], (old: any) => {
        if (!old) return old;
        return old.map((q: any) => {
          if (q.id === id) {
            return {
              ...q,
              progress: [{ status }]
            };
          }
          return q;
        });
      });
      return { previousQuestions };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(['questions'], context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    statusMutation.mutate({ id, status: e.target.value });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16 flex justify-between items-center px-[24px]">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">NeetCode 150</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group search-glow flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 w-80 transition-all focus-within:w-96">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
            <input 
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/50 focus:outline-none ml-2" 
              placeholder="Search by name or topic..." 
              type="text"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <Link href="/settings" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </Link>
        </div>
      </header>

      <section className="mt-16 flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <aside className="w-64 border-r border-outline-variant p-[24px] overflow-y-auto hidden xl:block">
          <div className="space-y-[40px]">
            <div>
              <h3 className="font-label-md text-on-surface font-bold uppercase tracking-widest text-[10px] mb-[16px]">Difficulty</h3>
              <div className="space-y-[8px]">
                {["Easy", "Medium", "Hard"].map(d => (
                  <label key={d} className="flex items-center justify-between group cursor-pointer">
                    <span className="flex items-center gap-2 text-on-surface-variant group-hover:text-on-surface transition-colors">
                      <div className={`w-2 h-2 rounded-full ${d === 'Easy' ? 'bg-emerald-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                      <span className="font-label-md">{d}</span>
                    </span>
                    <input 
                      checked={difficultyFilter.has(d)} 
                      onChange={() => toggleDifficulty(d)} 
                      className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary/20" 
                      type="checkbox"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-label-md text-on-surface font-bold uppercase tracking-widest text-[10px] mb-[16px]">Topic</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setTopicFilter("All")} 
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${topicFilter === "All" ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                >All</button>
                {topics.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTopicFilter(t)} 
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${topicFilter === t ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Table */}
        <div className="flex-1 flex flex-col p-[24px] overflow-y-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px] mb-[24px]">
            <div className="bg-surface-container-low border border-outline-variant p-[16px] rounded-xl">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Showing</p>
              <p className="text-2xl font-bold font-headline-md">{filtered.length}</p>
            </div>
            <div className="bg-surface-container-low border border-outline-variant p-[16px] rounded-xl">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Solved</p>
              <p className="text-2xl font-bold font-headline-md text-emerald-500">
                {questions?.filter(q => q.progress?.[0]?.status === 'Solved').length || 0}
              </p>
            </div>
            <div className="bg-surface-container-low border border-outline-variant p-[16px] rounded-xl">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Attempted</p>
              <p className="text-2xl font-bold font-headline-md text-amber-500">
                {questions?.filter(q => q.progress?.[0]?.status === 'Attempted').length || 0}
              </p>
            </div>
            <div className="bg-surface-container-low border border-outline-variant p-[16px] rounded-xl">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Reviews Due</p>
              <p className="text-2xl font-bold font-headline-md text-primary">{reviews?.length || 0}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shrink-0">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant">
                    <th className="px-[24px] py-4 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Question</th>
                    <th className="px-[24px] py-4 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Topic</th>
                    <th className="px-[24px] py-4 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Difficulty</th>
                    <th className="px-[24px] py-4 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Status</th>
                  </tr>
                </thead>
                <motion.tbody 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="divide-y divide-outline-variant/50"
                >
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                        <p className="mt-2 text-sm">Loading questions...</p>
                      </td>
                    </tr>
                  )}
                  {isError && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-error">
                        <span className="material-symbols-outlined text-3xl">error</span>
                        <p className="mt-2 text-sm">Failed to load. {error.message}</p>
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                        <p className="text-sm">No questions match your filters.</p>
                      </td>
                    </tr>
                  )}
                  {filtered.map((q) => (
                    <motion.tr 
                      key={q.id} 
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      onClick={() => router.push(`/questions/${q.id}`)}
                      className="hover:bg-surface-container-high transition-colors cursor-pointer group"
                    >
                      <td className="px-[24px] py-4">
                        <p className="font-label-md text-on-surface font-semibold">{q.title}</p>
                      </td>
                      <td className="px-[24px] py-4">
                        <span className="bg-outline-variant/30 text-on-surface-variant px-2 py-1 rounded text-xs font-mono">{q.topic}</span>
                      </td>
                      <td className="px-[24px] py-4">
                        <span className={`font-medium text-xs ${q.difficulty === 'Easy' ? 'text-emerald-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-[24px] py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select 
                            value={q.progress?.[0]?.status || 'Unsolved'}
                            onChange={(e) => handleStatusChange(e, q.id)}
                            className={`bg-surface-container border border-outline-variant rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary ${
                              q.progress?.[0]?.status === 'Solved' ? 'text-emerald-500' : 
                              q.progress?.[0]?.status === 'Attempted' ? 'text-amber-500' : 
                              'text-on-surface-variant'
                            }`}
                          >
                            <option value="Unsolved" className="text-on-surface">Unsolved</option>
                            <option value="Attempted" className="text-amber-500">Attempted</option>
                            <option value="Solved" className="text-emerald-500">Solved</option>
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
            <div className="px-[24px] py-4 bg-surface-container border-t border-outline-variant flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Showing <span className="text-on-surface font-bold">{filtered.length}</span> of {questions?.length || 0} questions</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
