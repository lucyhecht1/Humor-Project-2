import { SearchInput } from "./SearchInput";

export function UsersPageHeader({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Users
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage accounts and access
        </p>
      </div>
      <SearchInput defaultValue={defaultValue} />
    </div>
  );
}
