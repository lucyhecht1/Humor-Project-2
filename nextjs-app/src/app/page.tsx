import { createClient } from "@/lib/supabase/server";
import { NavSignInButton } from "./_components/NavSignInButton";

// ── types ──────────────────────────────────────────────────────────────────

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

// ── helpers ────────────────────────────────────────────────────────────────

function n(x: number | null | undefined) {
  return (x ?? 0).toLocaleString("en-US");
}

// ── page ───────────────────────────────────────────────────────────────────

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

  // top 7 images by total likes across their captions
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
    .slice(0, 7)
    .map((img, i) => ({ ...img, rank: i + 1 }));

  // top 5 most-liked captions
  const topLiked = [...caps]
    .filter((c) => (c.like_count ?? 0) > 0 && c.image_id && imageUrlMap.get(c.image_id))
    .sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      content: c.content ?? "",
      likeCount: c.like_count ?? 0,
      imageUrl: imageUrlMap.get(c.image_id!)!,
    }));

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 font-sans" suppressHydrationWarning>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-3 backdrop-blur-md">
        <span className="text-sm font-bold tracking-tight text-zinc-100">Product of CrackdAI</span>
        <NavSignInButton />
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 px-6 pb-24 pt-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Community snapshot
          </p>
          {/* Narrative headline */}
          <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white">
            <span className="text-orange-400">{n(imageCount)}</span> images.<br />
            <span className="text-orange-400">{n(captionCount)}</span> captions written.<br />
            <span className="text-orange-400">{n(totalLikes)}</span> likes given.
          </h1>
        </div>
      </section>

      {/* ── Divider with brand ───────────────────────────────────────────── */}
      <section className="-mt-12 flex items-center justify-center px-6">
        <div className="rounded-xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 p-[3px]">
          <span className="flex rounded-lg bg-zinc-900 px-10 py-3">
            <span className="font-display bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-7xl tracking-[0.35em] text-transparent md:text-8xl">
              LLMFAO
            </span>
          </span>
        </div>
      </section>

      {/* ── Images everyone is writing about ─────────────────────────────── */}
      <section className="bg-zinc-950 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Most talked about
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            The images everyone is writing about.
          </h2>

          {topImages.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-500">No data yet.</p>
          ) : (
            <div className="mt-10 space-y-3">
              {/* Top row: #1 wide + #2 & #3 stacked */}
              <div className="grid grid-cols-3 gap-3">
                {topImages[0] && (
                  <div className="group relative col-span-2 aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={topImages[0].url!} alt="" className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
                    <div className="absolute bottom-5 left-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">#1</p>
                      <p className="text-4xl font-bold tabular-nums text-white">{n(topImages[0].count)}</p>
                      <p className="text-sm text-zinc-300">{topImages[0].count === 1 ? "like" : "likes"}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {topImages.slice(1, 3).map((img) => (
                    <div key={img.id} className="group relative flex-1 overflow-hidden rounded-2xl bg-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url!} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ aspectRatio: "4/3" }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/10 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">#{img.rank}</p>
                        <p className="text-xl font-bold text-white tabular-nums">
                          {n(img.count)} <span className="text-xs font-normal text-zinc-300">{img.count === 1 ? "like" : "likes"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom row: #4–7 */}
              {topImages.length > 3 && (
                <div className="grid grid-cols-4 gap-3">
                  {topImages.slice(3, 7).map((img) => (
                    <div key={img.id} className="group relative overflow-hidden rounded-xl bg-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url!} alt="" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5">
                        <p className="text-xs font-bold text-orange-400">#{img.rank}</p>
                        <p className="text-sm font-semibold text-white tabular-nums">
                          {n(img.count)} <span className="text-xs font-normal text-zinc-300">{img.count === 1 ? "like" : "likes"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Crowd favorites ──────────────────────────────────────────────── */}
      <section className="bg-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Crowd favorites
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            The captions people love most.
          </h2>

          {topLiked.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-500">No liked captions yet.</p>
          ) : (
            <div className="mt-10 space-y-4">
              {/* #1 — featured editorial card */}
              {topLiked[0] && (
                <div className="flex overflow-hidden rounded-2xl bg-zinc-950">
                  <div className="flex flex-1 flex-col justify-between p-8">
                    <div>
                      <p className="font-serif text-6xl leading-none text-orange-500">&ldquo;</p>
                      <p className="mt-2 text-xl leading-relaxed text-white">
                        {topLiked[0].content.length > 260
                          ? topLiked[0].content.slice(0, 260) + "…"
                          : topLiked[0].content}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-3">
                      <span className="text-3xl font-bold tabular-nums text-red-400">{n(topLiked[0].likeCount)}</span>
                      <span className="text-sm text-zinc-400">likes</span>
                    </div>
                  </div>
                  <div className="w-56 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={topLiked[0].imageUrl} alt="" className="h-full w-full object-cover object-right" />
                  </div>
                </div>
              )}

              {/* #2–5 — 2-column grid */}
              {topLiked.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {topLiked.slice(1).map(({ id, content, likeCount, imageUrl }) => (
                    <div key={id} className="flex gap-4 rounded-xl border border-zinc-700 bg-zinc-800 p-5">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <p className="text-sm leading-relaxed text-zinc-300">
                          &ldquo;{content.length > 110 ? content.slice(0, 110) + "…" : content}&rdquo;
                        </p>
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="text-red-400">♥</span>
                          <span className="text-sm font-semibold text-zinc-200 tabular-nums">{n(likeCount)}</span>
                          <span className="text-xs text-zinc-500">likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-500">
        Stats are live — data reflects what's visible to the public.
      </footer>
    </div>
  );
}
