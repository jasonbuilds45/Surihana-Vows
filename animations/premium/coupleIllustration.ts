import { gsap } from "gsap";

export function animateCoupleIllustration(target: gsap.TweenTarget) {
  if (typeof window === "undefined") {
    return null;
  }

  const timeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
  timeline.to(target, {
    y: -8,
    duration: 2.8
  });

  return timeline;
}
