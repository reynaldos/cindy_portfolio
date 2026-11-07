import { ProfileForm } from "@/components/admin/profile-form";
import { db } from "@/lib/db";
import { r2Ready } from "@/lib/r2";

export const instant = false;

export default async function AdminProfile() {
  const [p, projects] = await Promise.all([
    db.profile.findUnique({ where: { id: 1 } }),
    db.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  if (!p) return <p className="font-mono text-sm text-dim">No profile row. Run the seed first.</p>;
  const values = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, Array.isArray(v) ? v.join("\n") : v == null ? "" : String(v)]));
  return (
    <>
      <h1 className="font-display text-4xl font-semibold mb-6">Profile</h1>
      <ProfileForm values={values} projects={projects} uploads={r2Ready()} />
    </>
  );
}
