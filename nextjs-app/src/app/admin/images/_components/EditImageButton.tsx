"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ImageForm } from "./ImageForm";
import { updateImage } from "../actions";

interface ProfileOption {
  id: string;
  email: string;
}

interface ImageData {
  id: string;
  url: string;
  profile_id: string | null;
  is_public: boolean;
  is_common_use: boolean;
  additional_context: string | null;
  image_description: string | null;
}

interface Props {
  image: ImageData;
  profiles: ProfileOption[];
}

export function EditImageButton({ image, profiles }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-image-title"
    >
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 id="edit-image-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Edit image
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5">
          <ImageForm
            action={updateImage}
            defaultValues={image}
            profiles={profiles}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow hover:bg-zinc-100"
      >
        Edit
      </button>
      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
