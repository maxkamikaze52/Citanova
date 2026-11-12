"use client";

import { useEffect } from "react";

/**
 * Skiper #31 scroll reveal, as progressive enhancement.
 *
 * Content is visible by default. Only after this effect has run does <html> get
 * `.reveal-js`, which is what makes [data-reveal] blocks start hidden. So if the
 * script never runs — no JS, hydration error, a stale chunk — the page still shows
 * every section instead of a blank screen.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      rootsIn(nodes);
      return;
    }

    root.classList.add("reveal-js");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    nodes.forEach((n) => io.observe(n));

    // Safety net: anything still hidden after 1.6s (observer missed it, layout
    // shifted, element is off-screen in a way the observer never reported) is
    // shown anyway. A blank section is never an acceptable outcome.
    const failsafe = window.setTimeout(() => rootsIn(nodes), 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}

function rootsIn(nodes: HTMLElement[]) {
  nodes.forEach((n) => n.classList.add("is-in"));
}
