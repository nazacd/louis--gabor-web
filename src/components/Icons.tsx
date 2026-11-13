import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 8.5h18M3 15.5h18" />
  </Base>
);

export const SearchIcon = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Base>
);

export const BookmarkIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M6.5 3.5h11v17L12 16.2 6.5 20.5z" />
  </Base>
);

export const BagIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 8h14l-1 12.5H6z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Base>
);

export const CloseIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </Base>
);

export const ChevronDown = (p: P) => (
  <Base width="14" height="14" {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const ChevronLeft = (p: P) => (
  <Base {...p}>
    <path d="m14.5 5-7 7 7 7" />
  </Base>
);

export const ChevronRight = (p: P) => (
  <Base {...p}>
    <path d="m9.5 5 7 7-7 7" />
  </Base>
);

export const ArrowRight = (p: P) => (
  <Base width="36" height="14" viewBox="0 0 40 14" {...p}>
    <path d="M0 7h38M32 1.5 38 7l-6 5.5" />
  </Base>
);

export const PlusIcon = (p: P) => (
  <Base width="16" height="16" {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const MinusIcon = (p: P) => (
  <Base width="16" height="16" {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const CheckIcon = (p: P) => (
  <Base width="16" height="16" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);

export const PinIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.500 15.400 12 21 12 21z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
);

export const ClockIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const PhoneIcon = (p: P) => (
  <Base {...p}>
    <path d="M6.500 3.500h3l1.500 4-2 1.500a11 11 0 0 0 6 6l1.500-2 4 1.500v3a2 2 0 0 1-2.200 2A16.500 16.500 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200z" />
  </Base>
);

export const GridIcon = ({ cols, ...p }: P & { cols: 1 | 2 | 3 | 4 }) => {
  const w = 18 / cols;
  return (
    <Base {...p} strokeWidth="0" fill="currentColor">
      {Array.from({ length: cols }, (_, i) => (
        <rect key={i} x={3 + i * w + 0.8} y="5" width={w - 1.6} height="14" rx="0.5" />
      ))}
    </Base>
  );
};

export const GlobeIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.500 2.300 3.700 5.200 3.700 8.500S14.500 18.200 12 20.500C9.500 18.200 8.300 15.300 8.300 12S9.500 5.800 12 3.500z" />
  </Base>
);

export const PlayIcon = (p: P) => (
  <Base {...p} fill="currentColor" strokeWidth="0">
    <path d="M8 5.500v13l10.500-6.500z" />
  </Base>
);

export const TelegramIcon = (p: P) => (
  <Base {...p}>
    <path d="m21 4.500-18 7 5.500 2 2 6 3-3.800 4.500 3.300z" />
    <path d="m8.500 13.500 8-5.500" />
  </Base>
);
