"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Area, Section, Select, Status, Text, Upload, type Values } from "@/components/admin/fields";
import { saveProfile, type SaveResult } from "@/lib/actions/profile";
import { r2Url } from "@/lib/media";

type Props = { values: Values; projects: { id: string; title: string }[]; uploads: boolean };

export function ProfileForm({ values, projects, uploads }: Props) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveProfile, undefined);
  return (
    <form action={action} className="grid gap-6 max-w-2xl">
      <Section title="About">
        <Text name="name" label="Name" v={values} />
        <Text name="brand" label="Brand" v={values} />
        <Text name="tagline" label="Tagline" v={values} />
        <Area name="bio" label="Bio (blank line between paragraphs)" v={values} rows={8} />
        <Text name="quote" label="Quote (optional)" v={values} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Text name="location" label="Location" v={values} />
          <Text name="studied" label="Studied (optional)" v={values} />
        </div>
        <Area name="tools" label="Tools, one per line" v={values} rows={4} />
        <Area name="clients" label="Clients, one per line (end-credits marquee)" v={values} rows={4} />
      </Section>
      <Section title="Files">
        <Upload name="portraitKey" kind="portrait" label="Portrait" hint="Landscape 16:9, 1920×1080 or larger. JPG, PNG, or WebP under 10 MB. It fills the monitor on the About page, so keep the face near the middle." accept="image/jpeg,image/png,image/webp" initial={values.portraitKey} enabled={uploads} preview={(key) => <Image src={r2Url(key)} alt="" width={192} height={108} unoptimized className="w-48 aspect-video object-cover border border-line" />} />
        <Upload name="resumeKey" kind="resume" label="Resume (PDF)" hint="One PDF under 10 MB." accept="application/pdf" initial={values.resumeKey} enabled={uploads} preview={(key) => <a href={r2Url(key)} target="_blank" rel="noopener" className="font-mono text-xs underline">{key}</a>} />
      </Section>
      <Section title="Contact">
        <div className="grid sm:grid-cols-2 gap-3">
          <Text name="contactEmail" label="Email" v={values} type="email" />
          <Text name="replyTime" label="Reply time (optional, e.g. 1–2 days)" v={values} />
        </div>
        <Text name="instagramUrl" label="Instagram URL" v={values} type="url" />
        <Text name="vimeoUrl" label="Vimeo URL" v={values} type="url" />
        <Text name="linkedinUrl" label="LinkedIn URL" v={values} type="url" />
      </Section>
      <Section title="Reel">
        <Select name="reelProjectId" label="Project played on the home page" v={values} options={[["", "None"], ...projects.map((p): [string, string] => [p.id, p.title])]} />
      </Section>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn pri disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}
