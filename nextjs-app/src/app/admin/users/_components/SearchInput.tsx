export function SearchInput({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/admin/users" method="GET" className="flex gap-2">
      <div className="relative">
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search by email…"
          className="h-9 w-72 rounded-md border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
        />
        {defaultValue && (
          <a
            href="/admin/users"
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </a>
        )}
      </div>
      <button
        type="submit"
        className="h-9 cursor-pointer rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Search
      </button>
    </form>
  );
}
