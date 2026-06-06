"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = sessionStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    sessionStorage.setItem("gemini_api_key", val);
  };

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/settings/reset', { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to reset progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowConfirm(false);
      alert("Progress reset successfully!");
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-[8px] text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">settings</span>
            <span className="font-headline-md text-headline-md font-semibold tracking-tight">Settings</span>
          </div>
        </div>
      </header>

      <div className="pt-16 min-h-screen">
        <div className="max-w-[700px] mx-auto p-[24px]">
          
          {/* SRS Settings */}
          <div className="glass-panel p-[32px] rounded-2xl border border-outline-variant mb-[24px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-widest text-[11px] mb-[24px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">memory</span>
              Review Speed
            </h3>
            
            <p className="text-[13px] text-on-surface-variant mb-[24px]">Controls how quickly questions come back for review after you solve them.</p>

            <div className="space-y-[16px]">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-primary bg-primary/5 cursor-pointer">
                <input type="radio" name="srs" defaultChecked className="mt-1 text-primary focus:ring-primary/20 bg-surface-container border-outline-variant" />
                <div>
                  <h4 className="font-label-md text-on-surface font-bold text-[13px]">Fast (Recommended)</h4>
                  <p className="text-[11px] text-on-surface-variant">Reviews come back in 3 days. Best for active prep.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant hover:border-outline cursor-pointer bg-surface-container-low transition-colors">
                <input type="radio" name="srs" className="mt-1 text-primary focus:ring-primary/20 bg-surface-container border-outline-variant" />
                <div>
                  <h4 className="font-label-md text-on-surface font-bold text-[13px]">Relaxed</h4>
                  <p className="text-[11px] text-on-surface-variant">Reviews come back in 7 days. For long-term maintenance.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="glass-panel p-[32px] rounded-2xl border border-outline-variant mb-[24px]">
            <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-widest text-[11px] mb-[24px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">key</span>
              Gemini API Key
            </h3>
            <p className="text-[13px] text-on-surface-variant mb-[16px]">
              Required for the AI Study Plan generator. Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.
            </p>
            <div className="flex gap-3">
              <input 
                type="password" 
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Paste your Gemini API key here..." 
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-2 opacity-60">Stored securely in your browser's session memory. It is never sent to our servers for storage.</p>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-[32px] rounded-2xl border border-error/30 bg-error/5 relative overflow-hidden">
            <h3 className="font-label-md text-label-md text-error font-bold uppercase tracking-widest text-[11px] mb-[24px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Danger Zone
            </h3>
            
            <p className="text-[13px] text-on-surface-variant mb-[24px]">
              Resetting your progress will mark all questions as Unsolved and clear your attempts. This action cannot be undone.
            </p>

            {showConfirm ? (
              <div className="flex items-center gap-3 animate-in fade-in">
                <button 
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  className="bg-error text-white px-4 py-2 rounded-lg font-label-md text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {resetMutation.isPending ? "Resetting..." : "Yes, reset my progress"}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={resetMutation.isPending}
                  className="bg-surface-container text-on-surface px-4 py-2 rounded-lg font-label-md text-sm border border-outline-variant hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowConfirm(true)}
                className="bg-error/10 text-error border border-error/20 px-4 py-2 rounded-lg font-label-md text-sm font-bold hover:bg-error/20 transition-all active:scale-95"
              >
                Reset NeetCode 150 Progress
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
