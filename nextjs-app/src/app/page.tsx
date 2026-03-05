import { createClient } from "@/lib/supabase/server";
import { DistributionBarChart } from "./_components/charts/DistributionBarChart";
import { VisibilityDonutChart } from "./_components/charts/VisibilityDonutChart";

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

function bucket(value: number, ranges: [string, number, number][]) {
  return ranges.find(([, min, max]) => value >= min && value <= max)?.[0] ?? ranges.at(-1)![0];
}

const captionPerImageRanges: [string, number, number][] = [
  ["0", 0, 0],
  ["1", 1, 1],
  ["2–3", 2, 3],
  ["4–5", 4, 5],
  ["6–10", 6, 10],
  ["11+", 11, Infinity],
];

const lengthRanges: [string, number, number][] = [
  ["1–20", 1, 20],
  ["21–50", 21, 50],
  ["51–100", 51, 100],
  ["101–150", 101, 150],
  ["151–200", 151, 200],
  ["201+", 201, Infinity],
];

// ── page ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: profileCount },
    { data: images, count: imageCount },
    { data: captions, count: captionCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("images")
      .select("id, url, is_public", { count: "exact" })
      .returns<ImageRow[]>(),
    supabase
      .from("captions")
      .select("id, image_id, content, like_count, is_public", { count: "exact" })
      .returns<CaptionRow[]>(),
  ]);

  const imgs = images ?? [];
  const caps = captions ?? [];

  // ── derived stats ────────────────────────────────────────────────────────

  // captions per image
  const captionsByImage = new Map<string, number>();
  for (const c of caps) {
    if (c.image_id)
      captionsByImage.set(c.image_id, (captionsByImage.get(c.image_id) ?? 0) + 1);
  }

  const imagesWithNoCaptions = (imageCount ?? 0) - captionsByImage.size;
  const avgCaptionsPerImage =
    captionsByImage.size > 0
      ? (caps.length / (imageCount ?? 1)).toFixed(1)
      : "0";

  const captionsPerImageDistMap = new Map<string, number>([["0", imagesWithNoCaptions > 0 ? imagesWithNoCaptions : 0]]);
  for (const count of captionsByImage.values()) {
    const b = bucket(count, captionPerImageRanges);
    captionsPerImageDistMap.set(b, (captionsPerImageDistMap.get(b) ?? 0) + 1);
  }
  const captionsPerImageDist = captionPerImageRanges.map(([b]) => ({
    bucket: b,
    count: captionsPerImageDistMap.get(b) ?? 0,
  }));

  // top 10 images by caption count
  const imageUrlMap = new Map(imgs.map((img) => [img.id, img.url]));
  const topImages = [...captionsByImage.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, url: imageUrlMap.get(id) ?? null, count }))
    .filter((img) => img.url)          // only show images with a visible URL
    .slice(0, 10)
    .map((img, i) => ({ ...img, rank: i + 1 }));

  // caption length distribution
  const contentLengths = caps
    .map((c) => c.content?.length ?? 0)
    .filter((l) => l > 0);

  const avgCharLength =
    contentLengths.length > 0
      ? Math.round(contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length)
      : 0;

  const avgWordCount =
    caps.filter((c) => c.content).length > 0
      ? Math.round(
          caps
            .filter((c) => c.content)
            .map((c) => c.content!.trim().split(/\s+/).length)
            .reduce((a, b) => a + b, 0) /
            caps.filter((c) => c.content).length
        )
      : 0;

  const lengthDistMap = new Map<string, number>();
  for (const len of contentLengths) {
    const b = bucket(len, lengthRanges);
    lengthDistMap.set(b, (lengthDistMap.get(b) ?? 0) + 1);
  }
  const captionLengthDist = lengthRanges.map(([b]) => ({
    bucket: b,
    count: lengthDistMap.get(b) ?? 0,
  }));

  // most-liked captions (top 5 that have a publicly visible image)
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

  // public / private breakdown
  const imagesVisibility = [
    { name: "Public", value: imgs.filter((i) => i.is_public).length },
    { name: "Private", value: imgs.filter((i) => !i.is_public).length },
  ];
  const captionsVisibility = [
    { name: "Public", value: caps.filter((c) => c.is_public).length },
    { name: "Private", value: caps.filter((c) => !c.is_public).length },
  ];

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 px-6 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Community snapshot
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">
          The numbers
        </h1>
        <p className="mt-3 text-zinc-400">
          A live look at what the community has created.
        </p>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-px bg-zinc-800 sm:grid-cols-3">
          {[
            { value: n(profileCount), label: "Creators" },
            { value: n(imageCount), label: "Images" },
            { value: n(captionCount), label: "Captions written" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-zinc-950 px-8 py-10">
              <p className="text-5xl font-bold tabular-nums text-white">{value}</p>
              <p className="mt-2 text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The conversation ─────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The conversation</SectionLabel>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">
                Each image sparks{" "}
                <span className="text-orange-500">{avgCaptionsPerImage}</span>{" "}
                captions on average.
              </h2>
              <p className="mt-4 text-zinc-500">
                Some images ignite a flood of responses; others sit quietly.
                Here's how caption activity is distributed across all images.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <MiniStat
                  value={n(captionsByImage.size)}
                  label="Images with captions"
                />
                <MiniStat
                  value={n(imagesWithNoCaptions)}
                  label="Images with no captions"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Number of images → by caption count
              </p>
              <DistributionBarChart data={captionsPerImageDist} color="#f97316" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Most talked about ────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Most talked about</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">
            The images everyone is writing about.
          </h2>
          <p className="mt-2 text-zinc-500">
            Ranked by number of captions received.
          </p>

          {topImages.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-400">No data yet.</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {topImages.map(({ rank, id, url, count }) => (
                <div
                  key={id}
                  className="group relative overflow-hidden rounded-xl bg-zinc-200"
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt=""
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-zinc-200" />
                  )}
                  {/* rank badge */}
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/70 text-xs font-bold text-white backdrop-blur-sm">
                    {rank}
                  </div>
                  {/* caption count */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-3 pt-8">
                    <p className="text-sm font-semibold text-white">
                      {n(count)}{" "}
                      <span className="font-normal text-zinc-300">
                        {count === 1 ? "caption" : "captions"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── What are people saying ───────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>What people write</SectionLabel>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Caption length in characters
              </p>
              <DistributionBarChart data={captionLengthDist} color="#6366f1" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">
                Captions average{" "}
                <span className="text-indigo-500">{n(avgCharLength)}</span>{" "}
                characters.
              </h2>
              <p className="mt-4 text-zinc-500">
                That's roughly{" "}
                <span className="font-semibold text-zinc-700">
                  {n(avgWordCount)} words
                </span>{" "}
                per caption. Short and punchy, or long and thoughtful — see how
                the community leans.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <MiniStat value={n(avgCharLength)} label="Avg. characters" />
                <MiniStat value={n(avgWordCount)} label="Avg. words" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Crowd favorites ──────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Crowd favorites</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">
            The captions people love most.
          </h2>
          <p className="mt-2 text-zinc-500">
            Ranked by total likes received.
          </p>

          {topLiked.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-400">No liked captions yet.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {topLiked.map(({ id, content, likeCount, imageUrl }, i) => (
                <div
                  key={id}
                  className="flex items-center gap-5 rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  {/* rank */}
                  <span className="w-6 flex-shrink-0 text-center text-xl font-bold text-zinc-300">
                    {i + 1}
                  </span>

                  {/* thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-100" />
                    )}
                  </div>

                  {/* content */}
                  <p className="flex-1 text-sm leading-relaxed text-zinc-700">
                    {content.length > 160
                      ? content.slice(0, 160) + "…"
                      : content}
                  </p>

                  {/* likes */}
                  <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-500">
                    <span>♥</span>
                    <span>{n(likeCount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Open vs. private ─────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Open vs. private</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">
            How much is shared with the world?
          </h2>
          <p className="mt-2 text-zinc-500">
            A breakdown of public versus private content across images and
            captions.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-16 sm:flex-row">
            <VisibilityDonutChart data={imagesVisibility} title="Images" />
            <VisibilityDonutChart data={captionsVisibility} title="Captions" />
          </div>
        </div>
      </section>

      {/* ── footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 px-6 py-8 text-center text-xs text-zinc-400">
        Stats are live — data reflects what's visible to the public.
      </footer>
    </div>
  );
}

// ── small shared sub-components ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
      {children}
    </p>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-4">
      <p className="text-2xl font-bold tabular-nums text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
