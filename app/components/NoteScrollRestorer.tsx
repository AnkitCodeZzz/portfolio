"use client";

import { useEffect } from "react";

type NoteScrollRestorerProps = {
  storageKey: string;
};

export default function NoteScrollRestorer({
  storageKey,
}: NoteScrollRestorerProps) {
  useEffect(() => {
    const savedScroll = window.sessionStorage.getItem(storageKey);

    if (!savedScroll) {
      return;
    }

    window.sessionStorage.removeItem(storageKey);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: Number(savedScroll) });
    });
  }, [storageKey]);

  return null;
}
