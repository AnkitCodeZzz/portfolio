"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AutoResizeTextarea from "./AutoResizeTextarea";
import Divider from "./Divider";
import MdxGuidePopover from "./MdxGuidePopover";
import editorial from "../styles/editorial.module.css";
import styles from "../styles/noteEditor.module.css";

type PageDocumentEditorPage = {
  key: "readme" | "now";
  title: string;
  description: string;
  content: string;
};

type PageDocumentEditorProps = {
  page: PageDocumentEditorPage;
};

type DraftState = {
  title: string;
  description: string;
  content: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";
type ToastTone = "editing" | "saved" | "error";
type ToastState = {
  tone: ToastTone;
  label: string;
  detail: string;
};

const toastFrameStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "28px",
  padding: "12px 16px",
  width: "auto",
  maxWidth: "calc(100vw - 24px)",
  boxSizing: "border-box",
} as const;

const toastMessageStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45ch",
  minWidth: 0,
  whiteSpace: "nowrap",
  lineHeight: "18px",
} as const;

const toastActionsStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "16px",
  flex: "0 0 auto",
} as const;

function toDraftState(page: PageDocumentEditorPage): DraftState {
  return {
    title: page.title,
    description: page.description,
    content: page.content,
  };
}

function formatFieldList(fields: string[]) {
  if (fields.length <= 1) {
    return fields[0] ?? "";
  }

  if (fields.length === 2) {
    return `${fields[0]} and ${fields[1]}`;
  }

  return `${fields.slice(0, -1).join(", ")}, and ${fields.at(-1)}`;
}

function getMissingRequiredFields(draft: DraftState) {
  return [
    !draft.title.trim() && "title",
    !draft.description.trim() && "description",
  ].filter(Boolean) as string[];
}

function getLocalPagePath(key: PageDocumentEditorPage["key"]) {
  return `content/pages/${key}.mdx`;
}

export default function PageDocumentEditor({
  page,
}: PageDocumentEditorProps) {
  const router = useRouter();
  const toastTimeoutRef = useRef<number | null>(null);
  const [draft, setDraft] = useState(() => toDraftState(page));
  const [savedDraft, setSavedDraft] = useState(() => toDraftState(page));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingLeaveHref, setPendingLeaveHref] = useState<string | null>(null);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const missingRequiredFields = getMissingRequiredFields(draft);
  const canSave = saveState !== "saving" && isDirty && missingRequiredFields.length === 0;
  const route = `/${page.key}`;

  const clearToastTimeout = useCallback(() => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback((
    nextToast: ToastState,
    durationMs = 2600
  ) => {
    clearToastTimeout();

    setToast(nextToast);

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      clearToastTimeout();
    }, durationMs);
  }, [clearToastTimeout]);

  function dismissToast() {
    clearToastTimeout();
    setToast(null);
  }

  function updateDraft<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((currentDraft) => {
      if (currentDraft[key] === value) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        [key]: value,
      };
    });

    if (saveState !== "idle") {
      setSaveState("idle");
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (pendingLeaveHref && event.key === "Escape") {
        event.preventDefault();
        setPendingLeaveHref(null);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    showToast(
      {
        tone: "editing",
        label: "Editing",
        detail: `${getLocalPagePath(page.key)} locally.`,
      },
      3200
    );

    return () => {
      clearToastTimeout();
    };
  }, [clearToastTimeout, page.key, showToast]);

  useEffect(() => {
    if (!pendingLeaveHref) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingLeaveHref]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleDocumentClick(event: globalThis.MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.href === currentUrl.href) {
        return;
      }

      event.preventDefault();

      if (nextUrl.origin === currentUrl.origin) {
        setPendingLeaveHref(
          `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
        );
        return;
      }

      setPendingLeaveHref(nextUrl.href);
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isDirty]);

  async function handleSave(
    options?: {
      afterSave?: () => void;
    }
  ) {
    if (!isDirty || saveState === "saving") {
      return false;
    }

    if (missingRequiredFields.length > 0) {
      showToast(
        {
          tone: "error",
          label: "Add these first.",
          detail: `Add ${formatFieldList(missingRequiredFields)} before saving this page.`,
        },
        3600
      );
      return false;
    }

    setSaveState("saving");

    try {
      const response = await fetch(`/api/pages/${page.key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          content: draft.content,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        page?: PageDocumentEditorPage;
      };

      if (!response.ok || !data.page) {
        throw new Error(data.error ?? "Unable to save this page.");
      }

      const nextDraft = toDraftState(data.page);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
      setSaveState("saved");
      showToast(
        {
          tone: "saved",
          label: "Saved",
          detail: `${getLocalPagePath(page.key)} locally.`,
        },
        3200
      );

      options?.afterSave?.();
      return true;
    } catch (error) {
      setSaveState("error");
      showToast(
        {
          tone: "error",
          label: "Save failed.",
          detail:
            error instanceof Error
              ? error.message
              : "Unable to save this page.",
        },
        3200
      );
      return false;
    }
  }

  function leaveEditor() {
    router.push(route);
  }

  function navigateToHref(targetHref: string) {
    if (targetHref.startsWith("/")) {
      router.push(targetHref);
      return;
    }

    window.location.assign(targetHref);
  }

  function handlePreview() {
    leaveEditor();
  }

  function handleCancel() {
    leaveEditor();
  }

  async function handleSaveAndLeave() {
    const nextHref = pendingLeaveHref;

    if (!nextHref) {
      return;
    }

    setPendingLeaveHref(null);

    await handleSave({
      afterSave() {
        navigateToHref(nextHref);
      },
    });
  }

  return (
    <>
      <section className={editorial.detailHeader} data-ruler-track>
        <div className={`${editorial.detailBlock} ${styles.editorDetailBlock}`}>
          <div className={`${styles.editorTopBar} ${styles.editorTopBarSolo}`}>
            <div className={styles.editorActions}>
              <button
                type="button"
                className={`${styles.editorActionButton} ${styles.editorActionCancel}`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.editorActionButton} ${styles.editorActionSave}`}
                onClick={() => {
                  void handleSave();
                }}
                disabled={!canSave}
              >
                {saveState === "saving" ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className={`${styles.editorActionButton} ${styles.editorActionPreview}`}
                onClick={handlePreview}
              >
                Preview
              </button>
            </div>
          </div>

          <div className={styles.editorPaper}>
            <div className={styles.editorPaperTop}>
              <div className={styles.editorHeroFields}>
                <div className={`${styles.guidedField} ${styles.guidedFieldMuted} ${styles.guidedFieldTitle}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel} htmlFor={`${page.key}-title`}>
                        Title
                      </label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <span className={styles.arrowRail}>
                        <span className={`${styles.arrowHead} ${styles.arrowHeadTop}`}>
                          <svg viewBox="0 0 7 9" focusable="false">
                            <path d="M0.5 3.5L3.5 0.5L6.5 3.5" />
                          </svg>
                        </span>
                        <span className={styles.arrowStem} />
                        <span className={`${styles.arrowHead} ${styles.arrowHeadBottom}`}>
                          <svg viewBox="0 0 7 9" focusable="false">
                            <path d="M0.5 5.5L3.5 8.5L6.5 5.5" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <AutoResizeTextarea
                      id={`${page.key}-title`}
                      className={`${styles.titleInput} ${styles.guidedTitleInput}`}
                      rows={1}
                      autoComplete="off"
                      spellCheck
                      value={draft.title}
                      onChange={(event) => {
                        updateDraft("title", event.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted} ${styles.guidedFieldDescription}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label
                        className={styles.guidedLabel}
                        htmlFor={`${page.key}-description`}
                      >
                        Description
                      </label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <span className={styles.arrowRail}>
                        <span className={`${styles.arrowHead} ${styles.arrowHeadTop}`}>
                          <svg viewBox="0 0 7 9" focusable="false">
                            <path d="M0.5 3.5L3.5 0.5L6.5 3.5" />
                          </svg>
                        </span>
                        <span className={styles.arrowStem} />
                        <span className={`${styles.arrowHead} ${styles.arrowHeadBottom}`}>
                          <svg viewBox="0 0 7 9" focusable="false">
                            <path d="M0.5 5.5L3.5 8.5L6.5 5.5" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <AutoResizeTextarea
                      id={`${page.key}-description`}
                      className={`${styles.descriptionInput} ${styles.guidedDescriptionInput}`}
                      rows={1}
                      autoComplete="off"
                      spellCheck
                      value={draft.description}
                      onChange={(event) => {
                        updateDraft("description", event.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Divider className={styles.editorPaperDivider} />

            <div className={styles.editorPaperBody}>
              <div className={styles.bodyField}>
                <div className={styles.bodyHeader}>
                  <label className={styles.fieldLabel} htmlFor={`${page.key}-content`}>
                    Body
                  </label>
                  <div className={styles.bodyTools}>
                    <span className={`${styles.bodyMeta} ${styles.bodyShortcut}`}>
                      <span className={styles.bodyShortcutCommand}>⌘</span>
                      <span className={styles.bodyShortcutKeys}>+ S</span>
                    </span>
                    <span className={styles.bodyToolDivider} aria-hidden="true" />
                    <MdxGuidePopover />
                  </div>
                </div>

                <div className={styles.bodyFrame}>
                  <AutoResizeTextarea
                    id={`${page.key}-content`}
                    className={styles.bodyInput}
                    rows={18}
                    autoComplete="off"
                    spellCheck
                    value={draft.content}
                    onChange={(event) => {
                      updateDraft("content", event.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast ? (
        <div
          className={`${styles.toast} ${styles[`toast${toast.tone[0].toUpperCase()}${toast.tone.slice(1)}`]}`}
          aria-live="polite"
          style={toastFrameStyle}
        >
          <div className={styles.toastMessage} style={toastMessageStyle}>
            <span className={styles.toastLabel} style={{ display: "inline", lineHeight: "18px" }}>
              {toast.label}
            </span>
            <span className={styles.toastDetail} style={{ display: "inline", lineHeight: "18px" }}>
              {toast.detail}
            </span>
          </div>

          <div className={styles.toastActions} style={toastActionsStyle}>
            <span className={styles.toastDivider} aria-hidden="true" />

            <button
              type="button"
              className={`${styles.toastButton} ${styles.toastCloseButton}`}
              aria-label="Dismiss toast"
              onClick={dismissToast}
              style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}
            >
              <span className={styles.toastCloseIcon} aria-hidden="true">
                <svg viewBox="0 0 10.5 10.5" focusable="false">
                  <path d="M9.75 0.75L0.75 9.75" />
                  <path d="M9.75 9.75L0.75 0.75" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {pendingLeaveHref ? (
        <div
          className={editorial.utilityConfirmOverlay}
          onClick={() => {
            setPendingLeaveHref(null);
          }}
        >
          <div
            className={editorial.utilityConfirmPanel}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${page.key}-leave-title`}
            aria-describedby={`${page.key}-leave-title`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={editorial.utilityConfirmContent}>
              <p id={`${page.key}-leave-title`} className={editorial.utilityConfirmText}>
                Save changes before leaving? You can also discard them.
              </p>
            </div>
            <div className={`${editorial.utilityConfirmActions} ${styles.leaveConfirmActions}`}>
              <button
                type="button"
                className={`${editorial.utilityLink} ${editorial.utilityButton}`}
                onClick={() => {
                  setPendingLeaveHref(null);
                }}
              >
                Stay
              </button>
              <button
                type="button"
                className={`${editorial.utilityLink} ${editorial.utilityButton} ${editorial.utilityLinkDanger}`}
                onClick={() => {
                  const nextHref = pendingLeaveHref;

                  if (!nextHref) {
                    return;
                  }

                  setPendingLeaveHref(null);
                  navigateToHref(nextHref);
                }}
              >
                Discard
              </button>
              <button
                type="button"
                className={`${editorial.utilityLink} ${editorial.utilityButton} ${styles.leaveConfirmSave}`}
                onClick={() => {
                  void handleSaveAndLeave();
                }}
                disabled={saveState === "saving"}
              >
                {saveState === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
