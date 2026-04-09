"use client";

import { useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "../styles/noteEditor.module.css";

type UploadBucket = "notes" | "work" | "pages";

type UploadSuccess = {
  fileName: string;
  path: string;
  markdown: string;
};

type EditorImageUploadButtonProps = {
  bucket: UploadBucket;
  identifier: string;
  missingIdentifierMessage: string;
  className?: string;
  onUploaded: (upload: UploadSuccess) => void;
  onError: (message: string) => void;
};

export default function EditorImageUploadButton({
  bucket,
  identifier,
  missingIdentifierMessage,
  className,
  onUploaded,
  onError,
}: EditorImageUploadButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      onError(missingIdentifierMessage);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.set("bucket", bucket);
      formData.set("identifier", trimmedIdentifier);
      formData.set("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        fileName?: string;
        path?: string;
        markdown?: string;
      };

      if (
        !response.ok ||
        typeof data.fileName !== "string" ||
        typeof data.path !== "string" ||
        typeof data.markdown !== "string"
      ) {
        throw new Error(data.error ?? "Unable to upload this image.");
      }

      onUploaded({
        fileName: data.fileName,
        path: data.path,
        markdown: data.markdown,
      });
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Unable to upload this image."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        className={styles.hiddenUploadInput}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <button
        type="button"
        className={className}
        disabled={isUploading}
        onClick={() => {
          if (isUploading) {
            return;
          }

          if (!identifier.trim()) {
            onError(missingIdentifierMessage);
            return;
          }

          if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
          }
        }}
      >
        <span>{isUploading ? "Uploading image..." : "Upload image"}</span>
      </button>
    </>
  );
}
