"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AutoResizeTextarea from "./AutoResizeTextarea";
import Breadcrumbs from "./Breadcrumbs";
import Divider from "./Divider";
import MdxGuidePopover from "./MdxGuidePopover";
import editorial from "../styles/editorial.module.css";
import styles from "../styles/noteEditor.module.css";
import {
  PROJECT_COLOR_OPTIONS,
  PROJECT_TYPES,
  getProjectColorCssValue,
} from "../lib/projectMeta";
import type { Project } from "../lib/projects";

type ProjectEditorProps = {
  project: Project;
  mode?: "edit" | "create";
};

type DraftState = {
  slug: string;
  title: string;
  type: Project["type"];
  category: string;
  color: Project["color"];
  description: string;
  pinned: boolean;
  date: string;
  content: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";
type ToastTone = "editing" | "saved" | "error";
type ToastState = {
  tone: ToastTone;
  label: string;
  detail: string;
};

type HintTone = "muted" | "olive";

const SCROLL_KEY_PREFIX = "work-scroll:";
const typeToneByKey: Record<Project["type"], Project["color"]> = {
  "case-study": "blue",
  craft: "brown",
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

function InfoIcon() {
  return (
    <svg viewBox="0 0 26 26" focusable="false" aria-hidden="true">
      <path
        opacity="0.2"
        d="M24 12C24 14.3734 23.2962 16.6935 21.9776 18.6668C20.6591 20.6402 18.7849 22.1783 16.5922 23.0866C14.3995 23.9948 11.9867 24.2324 9.65892 23.7694C7.33115 23.3064 5.19295 22.1635 3.51472 20.4853C1.83649 18.8071 0.693605 16.6689 0.230582 14.3411C-0.232441 12.0133 0.00519943 9.60051 0.913451 7.4078C1.8217 5.21509 3.35977 3.34094 5.33316 2.02236C7.30655 0.703788 9.62663 0 12 0C15.1826 0 18.2349 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12Z"
        fill="currentColor"
      />
      <path
        d="M15 19C15 19.2652 14.8946 19.5196 14.7071 19.7071C14.5196 19.8946 14.2652 20 14 20C13.4696 20 12.9609 19.7893 12.5858 19.4142C12.2107 19.0391 12 18.5304 12 18V13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.5304 11 13.0391 11.2107 13.4142 11.5858C13.7893 11.9609 14 12.4696 14 13V18C14.2652 18 14.5196 18.1054 14.7071 18.2929C14.8946 18.4804 15 18.7348 15 19ZM26 13C26 15.5712 25.2376 18.0846 23.8091 20.2224C22.3807 22.3603 20.3503 24.0265 17.9749 25.0104C15.5995 25.9944 12.9856 26.2518 10.4638 25.7502C7.94208 25.2486 5.6257 24.0105 3.80762 22.1924C1.98953 20.3743 0.751405 18.0579 0.249797 15.5362C-0.251811 13.0144 0.00563269 10.4006 0.989572 8.02512C1.97351 5.64968 3.63975 3.61935 5.77759 2.1909C7.91543 0.762437 10.4288 0 13 0C16.4467 0.00363977 19.7512 1.37445 22.1884 3.81163C24.6256 6.24882 25.9964 9.5533 26 13ZM24 13C24 10.8244 23.3549 8.69767 22.1462 6.88873C20.9375 5.07979 19.2195 3.66989 17.2095 2.83733C15.1995 2.00476 12.9878 1.78692 10.854 2.21136C8.72022 2.6358 6.76021 3.68345 5.22183 5.22183C3.68345 6.7602 2.63581 8.72022 2.21137 10.854C1.78693 12.9878 2.00477 15.1995 2.83733 17.2095C3.66989 19.2195 5.07979 20.9375 6.88873 22.1462C8.69767 23.3549 10.8244 24 13 24C15.9164 23.9967 18.7123 22.8367 20.7745 20.7745C22.8367 18.7123 23.9967 15.9164 24 13ZM12.5 9C12.7967 9 13.0867 8.91203 13.3334 8.7472C13.58 8.58238 13.7723 8.34811 13.8858 8.07403C13.9994 7.79994 14.0291 7.49834 13.9712 7.20736C13.9133 6.91639 13.7704 6.64912 13.5607 6.43934C13.3509 6.22956 13.0836 6.0867 12.7926 6.02882C12.5017 5.97094 12.2001 6.00065 11.926 6.11418C11.6519 6.22771 11.4176 6.41997 11.2528 6.66665C11.088 6.91332 11 7.20333 11 7.5C11 7.89782 11.158 8.27936 11.4393 8.56066C11.7206 8.84196 12.1022 9 12.5 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FieldHint({
  text,
  label,
  tone = "muted",
}: {
  text: string;
  label: string;
  tone?: HintTone;
}) {
  const tooltipId = useId();

  return (
    <span
      className={`${styles.infoTooltip} ${tone === "olive" ? styles.infoTooltipOlive : styles.infoTooltipMuted}`}
    >
      <button
        type="button"
        className={styles.infoButton}
        aria-label={label}
        aria-describedby={tooltipId}
      >
        <span className={styles.infoIcon} aria-hidden="true">
          <InfoIcon />
        </span>
      </button>
      <span id={tooltipId} role="tooltip" className={styles.infoBubble}>
        {text}
      </span>
    </span>
  );
}

function toDraftState(project: Project): DraftState {
  return {
    slug: project.slug,
    title: project.title,
    type: project.type,
    category: project.category,
    color: project.color,
    description: project.description,
    pinned: project.pinned,
    date: project.date,
    content: project.content,
  };
}

function sanitizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .replace(/\.mdx$/i, "")
    .replace(/[^a-z0-9_\-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .replace(/^[-_]+/, "");
}

function normalizeSlugInput(value: string) {
  return sanitizeSlugInput(value).replace(/[-_]+$/, "");
}

function formatSlugLabel(slug: string) {
  return slug.replace(/[-_]+/g, " ").trim().toLowerCase();
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
    !draft.slug.trim() && "slug",
    !draft.title.trim() && "title",
    !draft.type.trim() && "type",
    !draft.category.trim() && "category",
    !draft.color.trim() && "color",
    !draft.description.trim() && "description",
    !draft.date.trim() && "date",
  ].filter(Boolean) as string[];
}

function getLocalProjectPath(slug: string) {
  return `content/work/${slug}.mdx`;
}

function getProjectSlugPlaceholder() {
  return "untitled-project";
}

export default function ProjectEditor({
  project,
  mode = "edit",
}: ProjectEditorProps) {
  const router = useRouter();
  const toastTimeoutRef = useRef<number | null>(null);
  const [editorMode, setEditorMode] = useState(mode);
  const [draft, setDraft] = useState(() => toDraftState(project));
  const [savedDraft, setSavedDraft] = useState(() => toDraftState(project));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingLeaveHref, setPendingLeaveHref] = useState<string | null>(null);

  const isCreating = editorMode === "create";
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const persistedSlug = savedDraft.slug;
  const activeSlug = persistedSlug || draft.slug;
  const activeSlugLabel = formatSlugLabel(activeSlug) || "new project";
  const missingRequiredFields = getMissingRequiredFields(draft);
  const canSave =
    saveState !== "saving" &&
    isDirty &&
    missingRequiredFields.length === 0;

  const clearToastTimeout = useCallback(() => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback((nextToast: ToastState, durationMs = 2600) => {
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
        detail: isCreating
          ? "a new project locally."
          : `${getLocalProjectPath(project.slug)} locally.`,
      },
      3200
    );

    return () => {
      clearToastTimeout();
    };
  }, [clearToastTimeout, isCreating, project.slug, showToast]);

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

  async function handleSave(
    options?: {
      afterSave?: (savedProject: Project) => void;
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
          detail: `Add ${formatFieldList(missingRequiredFields)} before ${isCreating ? "creating" : "saving"} this project.`,
        },
        3600
      );
      return false;
    }

    setSaveState("saving");

    try {
      const response = await fetch(isCreating ? "/api/work" : `/api/work/${persistedSlug}`, {
        method: isCreating ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: draft.slug,
          title: draft.title,
          type: draft.type,
          category: draft.category,
          color: draft.color,
          description: draft.description,
          pinned: draft.pinned,
          date: draft.date,
          content: draft.content,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        project?: Project;
      };

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "Unable to save this project.");
      }

      const nextDraft = toDraftState(data.project);
      const slugChanged = data.project.slug !== persistedSlug;

      setDraft(nextDraft);
      setSavedDraft(nextDraft);
      setEditorMode("edit");
      setSaveState("saved");
      showToast(
        {
          tone: "saved",
          label: "Saved",
          detail: `${getLocalProjectPath(data.project.slug)} locally.`,
        },
        3200
      );

      if (options?.afterSave) {
        options.afterSave(data.project);
      } else if (isCreating || slugChanged) {
        router.replace(`/work/${data.project.slug}/edit`);
      }

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
              : "Unable to save this project.",
        },
        3200
      );
      return false;
    }
  }

  function leaveEditor() {
    if (isCreating) {
      router.push("/work");
      return;
    }

    window.sessionStorage.setItem(
      `${SCROLL_KEY_PREFIX}${persistedSlug}`,
      String(window.scrollY)
    );
    router.push(`/work/${persistedSlug}`);
  }

  function navigateToHref(targetHref: string, nextSlug = persistedSlug) {
    const resolvedHref =
      persistedSlug && nextSlug && targetHref === `/work/${persistedSlug}`
        ? `/work/${nextSlug}`
        : targetHref;

    if (resolvedHref === `/work/${nextSlug}` && nextSlug) {
      window.sessionStorage.setItem(
        `${SCROLL_KEY_PREFIX}${nextSlug}`,
        String(window.scrollY)
      );
    }

    if (resolvedHref.startsWith("/")) {
      router.push(resolvedHref);
      return;
    }

    window.location.assign(resolvedHref);
  }

  function handleCancel() {
    leaveEditor();
  }

  function handlePreview() {
    if (isCreating) {
      return;
    }

    leaveEditor();
  }

  async function handleSaveAndLeave() {
    const nextHref = pendingLeaveHref;

    if (!nextHref) {
      return;
    }

    setPendingLeaveHref(null);

    await handleSave({
      afterSave(savedProject) {
        navigateToHref(nextHref, savedProject.slug);
      },
    });
  }

  return (
    <>
      <section className={editorial.detailHeader} data-ruler-track>
        <div className={`${editorial.detailBlock} ${styles.editorDetailBlock}`}>
          <div className={styles.editorTopBar}>
            <Breadcrumbs
              items={
                isCreating
                  ? [
                      { label: "work", href: "/work" },
                      { label: "new project" },
                    ]
                  : [
                      { label: "work", href: "/work" },
                      { label: activeSlugLabel, href: `/work/${persistedSlug}` },
                      { label: "edit" },
                    ]
              }
            />

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
                disabled={isCreating}
              >
                Preview
              </button>
            </div>
          </div>

          <div className={styles.editorPaper}>
            <div className={styles.editorPaperTop}>
              <div className={styles.editorHeroFields}>
                <div className={`${styles.guidedField} ${styles.guidedFieldOlive}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <div className={styles.metaFieldHeader}>
                        <label className={styles.guidedLabel} htmlFor="project-slug">
                          Slug
                        </label>
                        <FieldHint
                          label="About project slug"
                          text="Short URL slug. Spaces become hyphens."
                          tone="olive"
                        />
                      </div>
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
                      id="project-slug"
                      className={`${styles.metaInput} ${styles.guidedMetaInput} ${styles.guidedSlugInput}`}
                      rows={1}
                      autoComplete="off"
                      spellCheck={false}
                      value={draft.slug}
                      placeholder={getProjectSlugPlaceholder()}
                      onChange={(event) => {
                        updateDraft("slug", sanitizeSlugInput(event.target.value));
                      }}
                      onBlur={(event) => {
                        const normalizedSlug = normalizeSlugInput(event.target.value);

                        updateDraft(
                          "slug",
                          normalizedSlug ||
                            (isCreating ? getProjectSlugPlaceholder() : savedDraft.slug)
                        );
                      }}
                    />
                  </div>
                </div>

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted} ${styles.guidedFieldTitle}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel} htmlFor="project-title">
                        Title
                      </label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <AutoResizeTextarea
                      id="project-title"
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

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel}>Type</label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <div className={styles.tagChoiceGrid}>
                      {PROJECT_TYPES.map((typeOption) => (
                        <button
                          key={typeOption.key}
                          type="button"
                          className={`${styles.tagChoiceChip} ${draft.type === typeOption.key ? styles.tagChoiceChipActive : ""}`}
                          style={
                            {
                              "--tag-choice-color": getProjectColorCssValue(
                                typeToneByKey[typeOption.key]
                              ),
                            } as CSSProperties
                          }
                          onClick={() => {
                            updateDraft("type", typeOption.key);
                          }}
                        >
                          {typeOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`${styles.guidedField} ${styles.guidedFieldOlive}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <div className={styles.metaFieldHeader}>
                        <label className={styles.guidedLabel} htmlFor="project-category">
                          Category
                        </label>
                        <FieldHint
                          label="About project category"
                          text="This is the short label shown above the project title."
                          tone="olive"
                        />
                      </div>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <AutoResizeTextarea
                      id="project-category"
                      className={`${styles.metaInput} ${styles.guidedMetaInput} ${styles.guidedProjectCategoryInput}`}
                      rows={1}
                      autoComplete="off"
                      spellCheck
                      value={draft.category}
                      onChange={(event) => {
                        updateDraft("category", event.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel}>Color</label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <div className={styles.tagChoiceGrid}>
                      {PROJECT_COLOR_OPTIONS.map((colorOption) => (
                        <button
                          key={colorOption.key}
                          type="button"
                          className={`${styles.tagChoiceChip} ${draft.color === colorOption.key ? styles.tagChoiceChipActive : ""}`}
                          style={
                            {
                              "--tag-choice-color": getProjectColorCssValue(colorOption.key),
                            } as CSSProperties
                          }
                          onClick={() => {
                            updateDraft("color", colorOption.key);
                          }}
                        >
                          {colorOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted} ${styles.guidedFieldDescription}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel} htmlFor="project-description">
                        Description
                      </label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <AutoResizeTextarea
                      id="project-description"
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

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted} ${styles.guidedFieldPin}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel}>Pin</label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <div className={styles.pinChoiceRow}>
                      <button
                        type="button"
                        className={`${styles.pinChoiceButton} ${styles.pinChoiceYes} ${draft.pinned ? styles.pinChoiceActiveYes : ""}`}
                        onClick={() => {
                          updateDraft("pinned", true);
                        }}
                        aria-pressed={draft.pinned}
                      >
                        Yes
                      </button>
                      <span className={styles.pinChoiceDivider} aria-hidden="true">
                        /
                      </span>
                      <button
                        type="button"
                        className={`${styles.pinChoiceButton} ${styles.pinChoiceNo} ${!draft.pinned ? styles.pinChoiceActiveNo : ""}`}
                        onClick={() => {
                          updateDraft("pinned", false);
                        }}
                        aria-pressed={!draft.pinned}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`${styles.guidedField} ${styles.guidedFieldMuted}`}>
                  <div className={styles.guidedLead}>
                    <div className={styles.guidedLeadMeta}>
                      <label className={styles.guidedLabel} htmlFor="project-date">
                        Date
                      </label>
                    </div>
                    <div className={styles.guidedLine} aria-hidden="true">
                      <DoubleArrowLine />
                    </div>
                  </div>
                  <div className={styles.guidedFieldContent}>
                    <AutoResizeTextarea
                      id="project-date"
                      className={`${styles.metaInput} ${styles.guidedMetaInput} ${styles.guidedDateInput}`}
                      rows={1}
                      autoComplete="off"
                      spellCheck={false}
                      value={draft.date}
                      onChange={(event) => {
                        updateDraft("date", event.target.value);
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
                  <label className={styles.fieldLabel} htmlFor="project-content">
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
                    id="project-content"
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
            aria-labelledby="project-leave-title"
            aria-describedby="project-leave-title"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={editorial.utilityConfirmContent}>
              <p id="project-leave-title" className={editorial.utilityConfirmText}>
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
                  setPendingLeaveHref(null);

                  if (nextHref) {
                    navigateToHref(nextHref);
                  }
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
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DoubleArrowLine() {
  return (
    <span className={styles.arrowRail} aria-hidden="true">
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
  );
}
