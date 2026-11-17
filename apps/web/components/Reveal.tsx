"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
export default function Reveal({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null),
    [motion, setMotion] = useState(false),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current,
      media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || media.matches || !window.IntersectionObserver) return;
    const bounds = node.getBoundingClientRect();
    setVisible(bounds.top < window.innerHeight && bounds.bottom > 0);
    setMotion(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    const reduce = () => {
      if (media.matches) {
        setMotion(false);
        observer.disconnect();
      }
    };
    media.addEventListener("change", reduce);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", reduce);
    };
  }, []);
  return (
    <section
      ref={ref}
      data-reveal
      className={`${className}${motion ? " reveal-ready" : ""}${visible ? " is-visible" : ""}`}
    >
      {children}
    </section>
  );
}
