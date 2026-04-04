# Design System Master File — EchoOS

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** EchoOS / BusinessOS
**Generated:** 2026-04-03
**Industry:** AI SaaS — Autonomous Content Team Platform
**Stack:** html-tailwind
**UI Style:** AI-Native Dark UI + Glassmorphism + Spotlight Cards

---

## Global Rules

### Color Palette

| Role | Hex / Value | Tailwind / CSS Variable |
|------|-------------|-------------------------|
| Background | `#09090b` | `bg-bg` / `--color-bg` |
| Surface | `#111116` | `bg-surface` |
| Primary (Purple) | `#8655f6` | `text-primary` / `--color-primary` |
| Primary Dark | `#6d38e0` | hover states |
| Text Main | `#fafafa` | `text-text-main` |
| Text Muted | `#71717a` | `text-text-muted` |
| Border | `rgba(255,255,255,0.06)` | `border-white/6` |
| Glow | `rgba(134,85,246,0.3)` | used in box-shadow |

**Color Notes:** Deep OLED black base. Single purple accent only. No warm CTA colors. Glass panels at 5-10% white opacity.

### Typography

- **Heading Font:** Syne (bold, high-tracking for display text)
- **Body Font:** Inter (clean, readable for copy)
- **Google Fonts Import:** Already in `<head>` of index.html

**Anti-Pattern:** Do NOT use Plus Jakarta Sans — this project uses Syne for headings.

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Section vertical padding | `py-24` | All major sections |
| Card padding | `p-6` to `p-10` | glass-panel |
| Max container | `max-w-5xl` / `max-w-4xl` | Content areas |

---

## Component Specs

### Glass Panel (Primary Card)
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}

.glass-panel-elevated {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
```

### Spotlight Card (Interactive)
```css
.spotlight-card {
  position: relative;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.spotlight-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(134,85,246,0.12), transparent 70%);
  pointer-events: none;
  transition: opacity 0.3s;
  opacity: 0;
}

.spotlight-card:hover::before { opacity: 1; }
.spotlight-content { position: relative; z-index: 1; }
```

### Primary Button (Magnetic)
```css
.btn-primary {
  background: #8655f6;
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 300ms ease;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(134,85,246,0.4);
}
.btn-primary:hover {
  background: #6d38e0;
  box-shadow: 0 0 30px rgba(134,85,246,0.6);
  transform: translateY(-1px);
}
```

---

## Style Guidelines

**Style:** AI-Native Dark UI with Glassmorphism

**Keywords:** Deep black OLED base, purple glow, glassmorphism panels, spotlight cards, animated mesh gradients, staggered scroll-in animations

**Best For:** AI platforms, SaaS tools, autonomous systems, tech products

**Key Effects:**
- Spotlight hover (radial gradient tracking mouse with CSS custom properties `--x` `--y`)
- Magnetic CTA buttons (subtle cursor tracking via JS transform)
- Mesh gradient backgrounds (animated `background-position` shift)
- Staggered Intersection Observer scroll animations

### Page Pattern

**Pattern Name:** Hyperscaler SaaS Landing (Lindy/Jasper/Writesonic Model)

- **Conversion Strategy:** "Your first AI content hire." Outcome-first copy. Stack replacement math. Proof before price.
- **CTA:** Single motion — `Start for $7`. No dual-track confusion.
- **Section Order:**
  1. Hero (outcome claim + dashboard mockup)
  2. Social Proof Numbers Bar
  3. 3-Pillar Moat Bento Grid (Persistence / Autonomy / Voice)
  4. Automated Pipeline Timeline
  5. Agent Team Showcase (Tabbed or Spotlight Cards)
  6. "Replace the Stack" Math (Writesonic style)
  7. Pricing (Two clean cards only — EchoOS $27 / BusinessOS $97)
  8. Results (Joshua's proven data)
  9. Wall of Love (Masonry — Tom Mitchell, Heather Cutler, Kris Olivo)
  10. Built By (Founder credibility)
  11. FAQ
  12. Final CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Light backgrounds or warm color palettes
- ❌ Emojis as icons — Use Lucide SVG icons only
- ❌ Three or more pricing card columns
- ❌ "Is this for you / Not for you" section — info-product trope, delete it
- ❌ Secondary sticky nav bar — single primary nav only
- ❌ CLI terminals or developer-focused visuals — audience is solopreneurs, not devs
- ❌ Missing `cursor:pointer` on interactive cards
- ❌ Instant state changes — always use `transition` (150-300ms)
- ❌ Layout-shifting hover scale transforms

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (Lucide SVGs only)
- [ ] `cursor-pointer` on all clickable cards and buttons
- [ ] Hover states use `transition-colors duration-200` or `transition-all duration-300`
- [ ] Spotlight cards have JS mouse tracking (`--x`, `--y` custom properties)
- [ ] Magnetic buttons have JS transform on mousemove / reset on mouseleave
- [ ] All sections use `animate-on-scroll` + IntersectionObserver
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px breakpoints
- [ ] No horizontal scroll on mobile (`overflow-x: hidden` on body)
- [ ] `scroll-behavior: smooth` on html element
- [ ] Lucide icons initialized via `lucide.createIcons()`
