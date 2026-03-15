import classNames from "classnames";
import type { PropsWithChildren } from "react";

interface ContainerProps extends PropsWithChildren {
  className?: string;
}

/**
 * Container
 *
 * Provides consistent horizontal layout spacing across the platform.
 * Tuned for editorial-style layouts with more breathing room.
 */

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={classNames(
        "mx-auto w-full",
        "max-w-[1320px]",         // slightly wider for luxury layouts
        "px-5 sm:px-8 lg:px-12",  // smoother padding rhythm
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
