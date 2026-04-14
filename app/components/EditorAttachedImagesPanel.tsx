"use client";

import { useState } from "react";
import type { ReferencedMarkdownImage } from "../lib/editorMarkdown";
import styles from "../styles/noteEditor.module.css";

type EditorAttachedImagesPanelProps = {
  images: ReferencedMarkdownImage[];
  onDeleteImage: (image: ReferencedMarkdownImage) => Promise<void>;
};

function formatImageLabel(image: ReferencedMarkdownImage) {
  if (image.altText.trim()) {
    return image.altText.trim();
  }

  const fallback = image.path.split("/").at(-1) ?? "Image";
  return fallback.replace(/\.[a-z0-9]+$/i, "");
}

export default function EditorAttachedImagesPanel({
  images,
  onDeleteImage,
}: EditorAttachedImagesPanelProps) {
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className={styles.attachedImagesPanel} aria-label="Attached images">
      <div className={styles.attachedImagesHeader}>
        <p className={styles.attachedImagesTitle}>Attached images</p>
        <p className={styles.attachedImagesMeta}>
          Delete from here instead of hunting through public.
        </p>
      </div>

      <div className={styles.attachedImagesGrid}>
        {images.map((image) => {
          const isPending = pendingPath === image.path;

          return (
            <article key={image.path} className={styles.attachedImageCard}>
              <div className={styles.attachedImagePreviewFrame}>
                <img
                  src={image.path}
                  alt={image.altText || ""}
                  className={styles.attachedImagePreview}
                />
              </div>

              <div className={styles.attachedImageBody}>
                <p className={styles.attachedImageLabel}>
                  {formatImageLabel(image)}
                </p>
                <p className={styles.attachedImagePath}>{image.path}</p>
                <p className={styles.attachedImageUsage}>
                  {image.count === 1 ? "1 reference" : `${image.count} references`}
                </p>
              </div>

              <button
                type="button"
                className={styles.attachedImageDelete}
                disabled={isPending}
                onClick={async () => {
                  setPendingPath(image.path);

                  try {
                    await onDeleteImage(image);
                  } finally {
                    setPendingPath((currentPath) =>
                      currentPath === image.path ? null : currentPath
                    );
                  }
                }}
              >
                {isPending ? "Deleting..." : "Delete image"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
