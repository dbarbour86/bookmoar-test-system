# Open Design System System Specification (nexu-io/open-design)

This document establishes the official Open Design System tokens, visual guidelines, and component architecture for the **Booking Test System** application.

---

## 1. Color Palette Tokens

- **Canvas Background (Deep Void)**: `#070b14`
- **Surface Elevation 1 (Card & Sidebar)**: `#090d16`
- **Surface Elevation 2 (Header & Panel)**: `#0b101d`
- **Surface Elevation 3 (Form Field & Inset)**: `#050810`
- **Border Neutral**: `rgba(51, 65, 85, 0.6)` (`#334155`)
- **Primary Accent (Cyan Electric)**: `#06b6d4`
- **Secondary Accent (Indigo Pulse)**: `#6366f1`
- **Success Accent (Emerald Glow)**: `#10b981`
- **Warning Accent (Amber Flame)**: `#f59e0b`
- **Purple Accent (Logic Violet)**: `#a855f7`

---

## 2. Typography & Font Pairing

- **Primary UI Sans**: `'Plus Jakarta Sans'`, sans-serif (Weights: 400, 500, 600, 700, 800)
- **Technical Mono**: `'JetBrains Mono'`, monospace (Weights: 400, 500, 600, 700)

### Type Scale Hierarchy
- **Display H1**: `text-2xl font-extrabold tracking-tight` (24px)
- **Section H2**: `text-xl font-bold tracking-tight` (20px)
- **Component H3**: `text-base font-bold` (16px)
- **Body UI**: `text-xs font-medium leading-relaxed` (12px)
- **Caption & Badges**: `text-[10px] font-mono uppercase font-bold tracking-wider` (10px)

---

## 3. Glassmorphism & Surface Materiality

- **Backdrop Blur Filter**: `backdrop-blur-xl` (16px blur radius)
- **Card Shadow**: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)`
- **Hover Glow Effects**: `shadow-cyan-500/10 hover:border-cyan-400 hover:scale-[1.01]`

---

## 4. Micro-Motion & Transitions

- **Default Transition**: `transition-all duration-200 ease-out`
- **Interactive Buttons**: `active:scale-95 transform`
- **Pulse Indicators**: `animate-pulse` on active live connections & status lights
- **Modal Animations**: `animate-in fade-in zoom-in-95 duration-200`

---

## 5. Layout Grid & Spacing Scale

- **Grid Columns**: 4-column Kanban Pipeline, 7-column Calendar Schedule Grid
- **Expansive Canvas Grid**: `gap={32}` dot grid spacing on React Flow canvas
- **Container Padding**: Minimum `p-5` to `p-8` for spacious, anti-clutter layouts

---

## 6. Open Design Applied Component Rules

1. **Kanban Cards**: High-contrast dark cards with E.164 phone numbers, registered deal values, and custom secondary intake overlays.
2. **Calendar Days**: High-contrast ribbon cards for confirmed bookings with instant side-drawer profile inspection.
3. **Workflow Nodes**: Distinct color themes per node type (Cyan Trigger, Amber Delay, Indigo Communication, Violet Sentiment Split). `.nodrag` handling on all form inputs.
4. **Chat Widget**: Floating text bubble with slide-up form & copyable script generator snippet.
