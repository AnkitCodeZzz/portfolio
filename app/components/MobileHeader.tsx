"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "../page.module.css";

export default function MobileHeader() {
  const [navHidden, setNavHidden] = useState(false);
  const navHiddenRef = useRef(false);
  const transitionLockUntilRef = useRef(0);
  const lastTouchYRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 899px)");

    const setHiddenState = (nextHidden: boolean) => {
      if (navHiddenRef.current === nextHidden) {
        return;
      }

      navHiddenRef.current = nextHidden;
      setNavHidden(nextHidden);
      transitionLockUntilRef.current = performance.now() + 260;
    };

    const scheduleTopCheck = () => {
      if (frameRef.current !== 0) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;

        if (!mediaQuery.matches) {
          setHiddenState(false);
          return;
        }

        if (window.scrollY <= 0) {
          setHiddenState(false);
        }
      });
    };

    const shouldIgnoreInput = () => {
      if (!mediaQuery.matches) {
        setHiddenState(false);
        return true;
      }

      if (window.scrollY <= 0) {
        setHiddenState(false);
        return true;
      }

      if (performance.now() < transitionLockUntilRef.current) {
        return true;
      }

      return false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (shouldIgnoreInput()) {
        return;
      }

      if (event.deltaY >= 4) {
        setHiddenState(true);
      } else if (event.deltaY <= -4) {
        setHiddenState(false);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!mediaQuery.matches) {
        return;
      }

      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (shouldIgnoreInput()) {
        return;
      }

      const currentTouchY = event.touches[0]?.clientY;
      const lastTouchY = lastTouchYRef.current;

      if (currentTouchY === undefined || lastTouchY === null) {
        return;
      }

      const intentDelta = lastTouchY - currentTouchY;
      lastTouchYRef.current = currentTouchY;

      if (intentDelta >= 4) {
        setHiddenState(true);
      } else if (intentDelta <= -4) {
        setHiddenState(false);
      }
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    const handleMediaChange = () => {
      lastTouchYRef.current = null;

      if (!mediaQuery.matches) {
        setHiddenState(false);
      }

      scheduleTopCheck();
    };

    scheduleTopCheck();

    window.addEventListener("scroll", scheduleTopCheck, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      if (frameRef.current !== 0) {
        window.cancelAnimationFrame(frameRef.current);
      }

      window.removeEventListener("scroll", scheduleTopCheck);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return (
    <div className={styles.mobileHeader} data-mobile-nav-hidden={navHidden ? "true" : "false"}>
      <div className={styles.brandRow}>
        <Link href="/" className={styles.brand}>
          <span>Ankit </span>
          <span className={styles.brandMuted}>Mandal</span>
        </Link>
      </div>
      <div className={styles.mobileNavShell}>
        <div className={styles.mobileNavRow}>
          <div className={styles.mobileNavRuler} aria-hidden="true" />
          <nav className={styles.mobileNav} aria-label="Primary">
            <span className={styles.navItem}>/work</span>
            <Link href="/notes" className={styles.inactiveLink}>
              /notes
            </Link>
            <span className={styles.navItem}>/readme</span>
          </nav>
        </div>
      </div>
    </div>
  );
}
