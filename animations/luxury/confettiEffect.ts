import { gsap } from "gsap";

export function triggerConfetti(target: HTMLElement) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const pieces = Array.from(target.querySelectorAll<HTMLElement>("[data-confetti-piece]"));
  const timeline = gsap.timeline();

  timeline.fromTo(
    pieces,
    {
      autoAlpha: 0,
      y: -20,
      x: 0,
      rotate: 0
    },
    {
      autoAlpha: 1,
      y: 120,
      x: (_index) => gsap.utils.random(-90, 90),
      rotate: (_index) => gsap.utils.random(-240, 240),
      stagger: 0.03,
      duration: 1.8,
      ease: "power2.out"
    }
  );

  return () => timeline.kill();
}
