"use client";

import { deleteImage } from "../actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteImage}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm("Delete this image? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
        className="text-sm font-medium text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </form>
  );
}
