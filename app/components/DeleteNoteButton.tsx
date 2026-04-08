"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import editorial from "../styles/editorial.module.css";

type DeleteNoteButtonProps = {
  slug: string;
  className?: string;
};

export default function DeleteNoteButton({
  slug,
  className,
}: DeleteNoteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsConfirming(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isConfirming]);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/notes/${slug}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete this note.");
      }

      router.push("/notes");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this note."
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className={editorial.utilityConfirmWrap}>
      <button
        type="button"
        className={className}
        onClick={() => {
          setErrorMessage(null);
          setIsConfirming((current) => !current);
        }}
        disabled={isDeleting}
        aria-expanded={isConfirming}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {isConfirming ? (
        <div
          className={editorial.utilityConfirmOverlay}
          onClick={() => {
            setIsConfirming(false);
            setErrorMessage(null);
          }}
        >
          <div
            className={editorial.utilityConfirmPanel}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-note-title"
            aria-describedby="delete-note-title"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={editorial.utilityConfirmContent}>
              <p id="delete-note-title" className={editorial.utilityConfirmText}>
                Delete <span className={editorial.utilityConfirmSlug}>{slug}</span>? This cannot be undone.
              </p>
              {errorMessage ? (
                <p className={editorial.utilityConfirmError}>{errorMessage}</p>
              ) : null}
            </div>
            <div className={editorial.utilityConfirmActions}>
              <button
                type="button"
                className={`${editorial.utilityLink} ${editorial.utilityButton}`}
                onClick={() => {
                  setIsConfirming(false);
                  setErrorMessage(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${editorial.utilityLink} ${editorial.utilityButton} ${editorial.utilityLinkDanger}`}
                onClick={() => {
                  void handleDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
