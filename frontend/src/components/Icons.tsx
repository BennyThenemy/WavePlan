import React from "react";

interface IconProps {
  size?: number;
  sw?: number;
}

const S = ({ children, size = 20, sw = 1.6, ...p }: IconProps & { children: React.ReactNode } & React.SVGProps<SVGSVGElement>) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);

export const Pin = (p: IconProps) => (<S {...p}><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></S>);
export const Chevron = (p: IconProps) => (<S {...p}><path d="m9 6 6 6-6 6" /></S>);
export const Lock = (p: IconProps) => (<S {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></S>);

export const Surf = (p: IconProps) => (<S {...p}><path d="M4 20c4 0 4-2.5 8-2.5S16 20 20 20" /><path d="M6.5 14.5C9 7 14.5 3.5 18.5 3.5c1.2 4-1.5 9.5-7 12.2" /><circle cx="9" cy="9.5" r="0.6" fill="currentColor" stroke="none" /></S>);
export const Sup = (p: IconProps) => (<S {...p}><ellipse cx="12" cy="15.5" rx="8" ry="2.4" /><path d="M12 13.2V3.5" /><path d="M9.5 5.2 12 3l2.5 2.2" /></S>);
export const Sun = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></S>);
export const Grid = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="1.6" /><circle cx="5.5" cy="12" r="1.6" /><circle cx="18.5" cy="12" r="1.6" /></S>);

export const Wave = (p: IconProps) => (<S {...p}><path d="M3 15c2.2 0 2.2-3 4.4-3S9.6 15 11.8 15s2.2-3 4.4-3S18.4 15 21 15" /><path d="M3 19c2.2 0 2.2-2 4.4-2S9.6 19 11.8 19s2.2-2 4.4-2S18.4 19 21 19" /></S>);
export const Period = (p: IconProps) => (<S {...p}><path d="M3 12c1.8 0 1.8-4 3.6-4S8.4 12 10.2 12s1.8-4 3.6-4S15.6 12 17.4 12 19.2 8 21 8" /><path d="M3 17h18" strokeDasharray="2 3" /></S>);
export const Wind = (p: IconProps) => (<S {...p}><path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5" /><path d="M3 16h8a2 2 0 1 1-2 2" /></S>);
export const Temp = (p: IconProps) => (<S {...p}><path d="M10 14.8V5a2 2 0 0 1 4 0v9.8a4 4 0 1 1-4 0Z" /><circle cx="12" cy="17" r="1.4" fill="currentColor" stroke="none" /></S>);
export const Uv = (p: IconProps) => (<S {...p}><circle cx="12" cy="13" r="3.2" /><path d="M12 4v2M5 8l1.3 1M19 8l-1.3 1M4 14h2M18 14h2" /></S>);
export const Compass = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="m14.5 9.5-1.2 4-3.8 1.2 1.2-4 3.8-1.2Z" fill="currentColor" stroke="none" /></S>);
export const Tide = (p: IconProps) => (<S {...p}><path d="M3 16c2.2 0 2.2-2 4.4-2S9.6 16 11.8 16s2.2-2 4.4-2S18.4 16 21 16" /><path d="M6 11V5M18 11V8M12 11V3" strokeDasharray="2 3" /></S>);

export const Clock = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></S>);
export const Menu = (p: IconProps) => (<S {...p}><path d="M4 7h16M4 12h16M4 17h16" /></S>);
export const User = (p: IconProps) => (<S {...p}><circle cx="12" cy="8.5" r="3.6" /><path d="M5 19.5c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" /></S>);
export const Globe = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.2 8.4 12S9.6 5.8 12 3.5Z" /></S>);
export const Moon = (p: IconProps) => (<S {...p}><path d="M20 13.5A8 8 0 1 1 10.5 4a6.3 6.3 0 0 0 9.5 9.5Z" /></S>);
export const Star = (p: IconProps) => (<S {...p}><path d="M12 4.5 14 9l4.8.5-3.6 3.2 1.1 4.7L12 15l-4.3 2.4 1.1-4.7L5.2 9.5 10 9l2-4.5Z" /></S>);
export const Board = (p: IconProps) => (<S {...p}><path d="M5 19C5 9 9 5 19 5c0 10-4 14-14 14Z" /><path d="M9 15l6-6" /></S>);
export const Alert = (p: IconProps) => (<S {...p}><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.6" r="0.6" fill="currentColor" stroke="none" /></S>);
export const Sparkle = (p: IconProps) => (<S {...p}><path d="M12 4c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5Z" /><path d="M18.5 14.5c.3 1.5.8 2 2.3 2.3-1.5.3-2 .8-2.3 2.3-.3-1.5-.8-2-2.3-2.3 1.5-.3 2-.8 2.3-2.3Z" /></S>);
export const NavArrow = (p: IconProps) => (<S {...p}><path d="M12 3 20 18 12 15l-8 3 8-15Z" fill="currentColor" stroke="none" /></S>);
export const Search = (p: IconProps) => (<S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16.5 16.5 4 4" /></S>);
