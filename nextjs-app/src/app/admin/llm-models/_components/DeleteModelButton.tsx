"use client";

import { useState } from "react";
import { deleteModel } from "../actions";

export function DeleteModelButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-pointer rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800/60 dark:text-red-400 dark:hover:bg-red-950/40">
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">Delete model?</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
              <form action={deleteModel} className="flex-1">
                <input type="hidden" name="id" value={id} />
                <button type="submit" className="w-full cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">Delete</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
