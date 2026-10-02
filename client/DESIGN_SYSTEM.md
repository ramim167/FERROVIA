# FERROVIA design system

FERROVIA uses one shared railway-inspired component system. The light theme is a morning landscape; the dark theme is a night journey. Brand green identifies actions, and amber identifies a destination, current step or live status. Split-flap tiles and the ticket header deliberately stay dark. The green home CTA is the one strong brand band in the daylight layout.

## Tokens and typography

`src/styles/tokens.css` defines primitive colours and semantic surface, text, border, focus, status, spacing, typography, radius and motion tokens. Override semantic tokens for both themes; do not invert the page. Scene and train paint tokens live in the same file. `--scene-*`, `--train-window-*`, `--train-beam-opacity` and `--hero-*` control day/night artwork without recreating SVGs.

Manrope Variable is self-hosted through `@fontsource-variable/manrope`; the Latin font is preloaded. Use `--text-caption`, `--text-label`, `--text-body-sm`, `--text-body` and the heading/display classes in `base.css`. Numeric times, PNRs and prices use `.t-num`. Spacing uses the 4px-based `--space-*` scale; surfaces use the shared `--radius-*` tokens.

## Components

| Component | Usage |
| --- | --- |
| `Button`, `IconButton` | Primary, secondary, tertiary, inverse and danger actions; pass loading state rather than swapping unrelated markup. Icon-only actions need an accessible label. |
| `PageHeader`, `SectionHeader`, `StatCard` | Page hierarchy, section actions and figures derived from API data. Unavailable figures display an em dash. |
| `Tabs` | Supply a unique `id`, `value`, `onChange` and tab definitions. Render a panel with `id="<id>-panel"`, `role="tabpanel"`, and `aria-labelledby="<id>-tab-<value>"`. Arrow/Home/End keys move focus. |
| `Modal`, `Drawer`, `useConfirm` | Shared overlays, focus containment, Escape and focus return. Destructive actions explain the concrete result. |
| `EmptyState`, `ErrorState`, `Skeleton*` | Distinguish no data, failed data and pending data. Errors include retry where appropriate. |
| `RouteLine`, `BookingStepper`, `StopTimeline` | Represent actual journey data and progress. Tracking is based on recorded station events, not simulated GPS. |
| `Ticket`, `CopyChip` | Booking details and clipboard feedback; ticket print rules live in `print.css`. |
| `SearchBox`, `DatePicker` | Station autocomplete and bounded date selection. |
| `RailScene`, `TrainArt` | Decorative, accessible-hidden SVG environment. No video, canvas or animation library. |

```jsx
<Button variant="secondary" icon="refresh" loading={loading} onClick={reload}>
  Refresh
</Button>
<Tabs id="journeys" tabs={tabs} value={tab} onChange={setTab} />
<section role="tabpanel" id="journeys-panel" aria-labelledby={`journeys-tab-${tab}`}>
  {content}
</section>
```

Status colours follow `StatusBadge` in `ui/Feedback.jsx`: confirmed/completed/approved are success, scheduled/pending are informational or warning as mapped, cancellation/refund states retain explicit labels, and cancelled/rejected/error states use danger or neutral. Colour is always accompanied by words.

## Motion

Page changes use native View Transitions when supported. Reduced motion bypasses them. Hover and selection feedback are short transitions; background travel is intentionally long and calm. A hero train brakes for 2.8 seconds, then the far layer loops in 105 seconds and the near layer in 30 seconds. Wheel rotation, subpixel sway, clouds, staggered stars and window fades continue. Distant trains are timed decorative events; they never represent real services.

Scene animation uses transform and opacity, including a translated sleeper strip. Pointer parallax is smoothed with requestAnimationFrame and limited to 4px far, 8px near and 2px train motion. It runs only for fine pointers. IntersectionObserver pauses an offscreen scene; background tabs pause animation. Reduced motion produces a fully parked scene and removes random events. Mobile artwork drops per-window shadows and extra speed lines.

## Brand and responsive behaviour

`Logo` supports horizontal, symbol and wordmark variants, with auto/light/dark/mono tones. Prefer auto on theme-aware surfaces. Dark tone is reserved for deliberately dark surfaces such as the ticket header. Leave at least one-quarter of the symbol width as clear space. Keep the symbol at least 24px high and the horizontal logo at least 28px high.

The main layout adapts at 1180, 900, 760, 560 and 360px. Verify down to 320px. Seat targets remain at least 44px wide; small seat maps reduce coach padding and aisle spacing. Tables scroll within their region; the departures overview becomes stacked rows on mobile. Mobile booking actions and the assistant have separate vertical offsets.

Admin service editing is split into `components/admin/*Section.jsx`. The parent owns state and the original API payload. The section index scrolls to actual form sections, and invalid fields receive section-level feedback.

## Verification

Run `npm run check`, `npm run test:ui`, `npm run test:ui:track` and `npm run test:ui:admin`. `scripts/design-audit.cjs`, `scripts/booking-audit.cjs` and `scripts/motion-audit.cjs` write local screenshot/axe reports under `artifacts/`. Browser discovery honours `CHROME_PATH`, then bundled Chromium, then installed Chrome/Edge. Audit fixtures that write records require the memory database.
