import { createClient } from "@/lib/supabase/server";
import { NavSignInButton } from "./_components/NavSignInButton";

interface ImageRow {
  id: string;
  url: string;
  is_public: boolean;
}

interface CaptionRow {
  id: string;
  image_id: string | null;
  content: string | null;
  like_count: number | null;
  is_public: boolean;
}

function n(x: number | null | undefined) {
  return (x ?? 0).toLocaleString("en-US");
}

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: images, count: imageCount },
    { data: captions, count: captionCount },
  ] = await Promise.all([
    supabase.from("images").select("id, url, is_public", { count: "exact" }).returns<ImageRow[]>(),
    supabase.from("captions").select("id, image_id, content, like_count, is_public", { count: "exact" }).returns<CaptionRow[]>(),
  ]);

  const imgs = images ?? [];
  const caps = captions ?? [];

  const totalLikes = caps.reduce((sum, c) => sum + Math.max(0, c.like_count ?? 0), 0);

  const imageUrlMap = new Map(imgs.map((img) => [img.id, img.url]));
  const likesByImage = new Map<string, number>();
  for (const c of caps) {
    if (c.image_id)
      likesByImage.set(c.image_id, (likesByImage.get(c.image_id) ?? 0) + (c.like_count ?? 0));
  }
  const topImages = [...likesByImage.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, url: imageUrlMap.get(id) ?? null, count }))
    .filter((img) => img.url)
    .slice(0, 4)
    .map((img, i) => ({ ...img, rank: i + 1 }));

  const topLiked = [...caps]
    .filter((c) => (c.like_count ?? 0) > 0 && c.image_id && imageUrlMap.get(c.image_id))
    .sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      content: c.content ?? "",
      likeCount: c.like_count ?? 0,
      imageUrl: imageUrlMap.get(c.image_id!)!,
    }));

  return (
    <div className="min-h-screen bg-zinc-950 font-sans" suppressHydrationWarning>

      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium tracking-wide text-zinc-500">System online</span>
        </div>
        <NavSignInButton />
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-6 py-16">

        {/* Portal heading */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Research Admin
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Admin Portal
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Sign in with your authorized account to access the dashboard.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          {[
            { label: "Images", value: n(imageCount) },
            { label: "Captions", value: n(captionCount) },
            { label: "Total Likes", value: n(totalLikes) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-1 text-lg font-semibold text-white">Sign in</h2>
          <p className="mb-6 text-sm text-zinc-500">
            Access is restricted to authorized administrators.
          </p>
          <NavSignInButton fullWidth />
        </div>

        {/* Data preview */}
        {(topImages.length > 0 || topLiked.length > 0) && (
          <div className="mt-10 grid grid-cols-2 gap-6">

            {/* Top images */}
            {topImages.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Top images by likes
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {topImages.map((img) => (
                    <div key={img.id} className="group relative overflow-hidden rounded-lg bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url!}
                        alt=""
                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <p className="text-xs font-bold text-indigo-400">#{img.rank}</p>
                        <p className="text-xs font-semibold text-white tabular-nums">{n(img.count)} likes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top captions */}
            {topLiked.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Top captions by likes
                </p>
                <div className="space-y-3">
                  {topLiked.map(({ id, content, likeCount, imageUrl }) => (
                    <div key={id} className="flex items-start gap-3">
                      <div className="mt-0.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-zinc-300">
                          &ldquo;{content.length > 80 ? content.slice(0, 80) + "…" : content}&rdquo;
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-600">
                          <span className="text-rose-400">♥</span> {n(likeCount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-xs text-zinc-700">
        Stats reflect publicly visible data · Live
      </footer>
    </div>
  );
}
