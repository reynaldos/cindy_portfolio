"use client";

import { useSyncExternalStore } from "react";

// The render queue: every video job the admin has started this session, shared by the shell panel,
// the project page, and the audio scanner. Lives only in memory: a reload ends an upload.
export type Stage = "queued" | "uploading" | "encoding" | "scanning" | "done" | "error";
export type Job = { projectId: string; title: string; file: File | null; stage: Stage; pct: number; error?: string};

let jobs: Job[] = [];
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function enqueue(projectId: string, title: string, file: File) {
  jobs = [...jobs.filter((j) => j.projectId !== projectId), { projectId, title, file, stage: "queued", pct: 0 }];
  emit();
}

// a job that did not start as an upload here (an import, a reload mid-encode): it joins at the scan
export function track(projectId: string, title: string) {
  if (jobs.some((j) => j.projectId === projectId)) return;
  jobs = [...jobs, { projectId, title, file: null, stage: "scanning", pct: 0 }];
  emit();
}

export function patch(projectId: string, p: Partial<Job>) {
  if (!jobs.some((j) => j.projectId === projectId)) return;
  jobs = jobs.map((j) => (j.projectId === projectId ? { ...j, ...p } : j));
  emit();
}

export function dismiss(projectId: string) {
  jobs = jobs.filter((j) => j.projectId !== projectId);
  emit();
}

export const getJobs = () => jobs;
export const useJobs = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, getJobs, getJobs);
export const useJob = (projectId: string) => useJobs().find((j) => j.projectId === projectId);
