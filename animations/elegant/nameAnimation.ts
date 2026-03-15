import { gsap } from "gsap";

export function animateCoupleNames(target: gsap.TweenTarget) {
  if (typeof window === "undefined") {
    return null;
  }

  const timeline = gsap.timeline();
  timeline.fromTo(
    target,
    {
      autoAlpha: 0,
      yPercent: 30,
      letterSpacing: "0.3em"
    },
    {
      autoAlpha: 1,
      yPercent: 0,
      letterSpacing: "0.08em",
      duration: 1.1,
      ease: "power4.out"
    }
  );

  return timeline;
}
