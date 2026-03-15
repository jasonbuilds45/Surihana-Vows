import { gsap } from "gsap";

export function playCinematicSequence(
  targets: {
    backdrop: gsap.TweenTarget;
    headline: gsap.TweenTarget;
    subheadline: gsap.TweenTarget;
  },
  delay = 0
) {
  if (typeof window === "undefined") {
    return null;
  }

  const timeline = gsap.timeline({ delay });
  timeline
    .fromTo(
      targets.backdrop,
      { scale: 1.08, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 1.2, ease: "power2.out" }
    )
    .fromTo(
      targets.headline,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" },
      "-=0.65"
    )
    .fromTo(
      targets.subheadline,
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" },
      "-=0.55"
    );

  return timeline;
}
