import { gsap } from "gsap";

export function animateRingIntro(target: gsap.TweenTarget) {
  if (typeof window === "undefined") {
    return null;
  }

  const timeline = gsap.timeline();
  timeline.fromTo(
    target,
    {
      scale: 0.72,
      autoAlpha: 0,
      rotate: -24
    },
    {
      scale: 1,
      autoAlpha: 1,
      rotate: 0,
      duration: 1.1,
      ease: "back.out(1.8)"
    }
  );

  return timeline;
}
