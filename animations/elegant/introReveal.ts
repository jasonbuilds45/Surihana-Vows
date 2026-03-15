import { gsap } from "gsap";

export interface IntroRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
}

export function introReveal(
  target: gsap.TweenTarget,
  options: IntroRevealOptions = {}
) {
  if (typeof window === "undefined") {
    return null;
  }

  const { y = 28, duration = 1, delay = 0, stagger = 0.08 } = options;

  return gsap.fromTo(
    target,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: "power3.out"
    }
  );
}
