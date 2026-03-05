import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteButton } from "./_components/DeleteButton";

interface Image {
  id: string;
  url: string;
  profile_id: string | null;
  is_public: boolean;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export default async function ImagesPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, profile_id, is_public, created_datetime_utc, modified_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .returns<Image[]>();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Images</h1>
        <Link
          href="/admin/images/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + New image
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          Failed to load images: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">ID</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Image</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Profile</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Public</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Created</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Modified</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!images?.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500">
                  No images found.
                </td>
              </tr>
            ) : (
              images.map((img) => (
                <tr
                  key={img.id}
                  className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <span title={img.id} className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                      {img.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        className="h-8 w-8 flex-shrink-0 rounded object-cover bg-zinc-100 dark:bg-zinc-800"
                        onError={() => {}}
                      />
                      <span className="max-w-[180px] truncate text-xs">{img.url}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {img.profile_id ? (
                      <span title={img.profile_id} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {img.profile_id.slice(0, 8)}…
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {img.is_public ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(img.created_datetime_utc)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(img.modified_datetime_utc)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/images/${img.id}`}
                        className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={img.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {images?.length ? (
        <p className="mt-3 text-right text-xs text-zinc-400 dark:text-zinc-500">
          {images.length} {images.length === 1 ? "image" : "images"}
        </p>
      ) : null}
    </div>
  );
}
