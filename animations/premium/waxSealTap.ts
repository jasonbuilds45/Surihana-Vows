import { gsap } from "gsap";

export function animateWaxSealTap(target: gsap.TweenTarget) {
  if (typeof window === "undefined") {
    return null;
  }

  return gsap.fromTo(
    target,
    {
      scale: 1,
      rotate: 0,
      y: 0
    },
    {
      scale: 0.88,
      rotate: -12,
      y: 2,
      duration: 0.18,
      repeat: 1,
      yoyo: true,
      ease: "power2.out"
    }
  );
}

export default animateWaxSealTap;
