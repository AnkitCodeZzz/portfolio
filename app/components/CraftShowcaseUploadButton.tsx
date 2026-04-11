"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type CraftShowcaseUploadButtonProps = {
  className?: string;
};

type SaveState = "idle" | "uploading";

export default function CraftShowcaseUploadButton({
  className,
}: CraftShowcaseUploadButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setSaveState("uploading");

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/work/craft", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to add this craft image.");
      }

      router.push("/work#craft-showcase");
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to add this craft image."
      );
    } finally {
      setSaveState("idle");
    }
  }

  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
      <button
        type="button"
        className={className}
        disabled={saveState === "uploading"}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {saveState === "uploading" ? "Uploading image" : "Add craft image"}
      </button>
    </>
  );
}
