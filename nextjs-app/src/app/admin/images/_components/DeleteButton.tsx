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
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-red-700"
      >
        Delete
      </button>
    </form>
  );
}
