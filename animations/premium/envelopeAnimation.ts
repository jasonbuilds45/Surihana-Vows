import { gsap } from "gsap";

export function animateEnvelopeOpen(target: gsap.TweenTarget) {
  if (typeof window === "undefined") {
    return null;
  }

  return gsap.fromTo(
    target,
    { rotateX: -18, y: 18, autoAlpha: 0 },
    {
      rotateX: 0,
      y: 0,
      autoAlpha: 1,
      duration: 1,
      transformOrigin: "center top",
      ease: "power3.out"
    }
  );
}
