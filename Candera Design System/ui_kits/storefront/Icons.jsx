/* Candera — Lucide-style icons (stroke 1.5, outline). Subset used across the kit. */
const Icon = ({ d, size = 18, sw = 1.5, fill = "none", children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children || (Array.isArray(d) ? d.map((x, i) => <path key={i} d={x} />) : <path d={d} />)}
  </svg>
);

const IconBag = (p) => <Icon {...p} d={["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"]} />;
const IconArrowRight = (p) => <Icon {...p} d={["M5 12h14", "m12 5 7 7-7 7"]} />;
const IconSparkles = (p) => <Icon {...p} d={["M9.94 14.66A1 1 0 0 1 9 14l-.4-1.13a3.5 3.5 0 0 0-2.47-2.47L5 10a1 1 0 0 1 0-1.88l1.13-.4a3.5 3.5 0 0 0 2.47-2.47L9 4a1 1 0 0 1 1.88 0l.4 1.13a3.5 3.5 0 0 0 2.47 2.47l1.13.4a1 1 0 0 1 0 1.88l-1.13.4a3.5 3.5 0 0 0-2.47 2.47Z", "M20 3v4", "M22 5h-4", "M4 17v2", "M5 18H3"]} />;
const IconStar = (p) => <Icon {...p} fill="currentColor" sw={0} d="m12 2 2.9 6.26 6.1.5-4.6 4.02 1.4 6.22L12 16.9 6.2 19l1.4-6.22L3 8.76l6.1-.5Z" />;
const IconMail = (p) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="0" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon>;
const IconCheck = (p) => <Icon {...p} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14", "m9 11 3 3L22 4"]} />;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>;
const IconMenu = (p) => <Icon {...p} d={["M4 6h16", "M4 12h16", "M4 18h16"]} />;
const IconX = (p) => <Icon {...p} d={["M18 6 6 18", "m6 6 12 12"]} />;
const IconExternal = (p) => <Icon {...p} d={["M15 3h6v6", "M10 14 21 3", "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"]} />;
const IconCamera = (p) => <Icon {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3" /></Icon>;
const IconGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /><path d="M2 12h20" /></Icon>;
const IconMsg = (p) => <Icon {...p} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />;

Object.assign(window, {
  IconBag, IconArrowRight, IconSparkles, IconStar, IconMail, IconCheck,
  IconClock, IconMenu, IconX, IconExternal, IconCamera, IconGlobe, IconMsg,
});
