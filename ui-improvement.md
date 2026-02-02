
---
# ✅ GLOBAL UI REDESIGN PROMPT — *Hangoutly Web App*

> Use this single prompt to redesign the entire Hangoutly web application with consistent layout, components, spacing, and visual language.

---

## **CONTEXT (What you’re building)**

Redesign the **Hangoutly** web application — a **verified, time-based companionship marketplace** where adults can offer and book non-sexual social time (movie watching, walking, hiking, attending events, conversations).

The product prioritizes:

* trust
* safety
* calmness
* clarity
* neutrality (NOT dating, NOT escorting)

This is a **real production web app**, not a landing page.

Target users are 18–35, urban, mobile-first, and privacy-conscious.

---

## **LAYOUT STRUCTURE (Global App Architecture)**

Apply a **consistent design system** across all pages listed below.

### 1. Global Shell

* Sticky top navigation bar
* Clean, minimal logo (icon only, no text emphasis)
* Right-side user menu (avatar + dropdown)
* Responsive mobile-first layout

### 2. Core Pages

Design ALL of these using the same visual language:

* Auth pages (login, verification pending)
* Profile setup & edit
* User discovery / browse page
* Profile detail page
* Booking flow (modal or step-based)
* Payment request & confirmation screen
* Time-locked chat interface
* Favorites list
* Booking history
* Complaints & support page
* Notifications panel
* Settings page
* and all other pages

### 3. Admin Panel (Same Design Language)

* Sidebar + main content layout
* User verification queue
* User detail view (activity timeline)
* Bookings table
* Complaints table
* Action modals (approve, freeze, ban)
* and all other pages

---

## **DESIGN STYLE (Look & Feel — VERY IMPORTANT)**

### Overall Vibe

* Calm
* Human
* Trust-first
* Neutral
* Professional but friendly
* NOT playful, NOT flashy, NOT romantic

### Color System

* Base background: soft off-white / light gray
* Primary accent: muted indigo / slate / soft purple
* Secondary accent: subtle teal or green (used sparingly)
* Error/destructive: muted red (only for admin or alerts)

⚠️ No bright red, no hot pink, no dating-app gradients.

### Typography

* Modern sans-serif (Inter / SF-like)
* Clear hierarchy:

  * Page titles: semibold
  * Section titles: medium
  * Body text: regular
* High readability, no decorative fonts

### Spacing & Layout

* Consistent spacing scale (8px system)
* Generous white space
* Content centered with max-width
* Avoid clutter and dense layouts

### Components

* Cards with:

  * Soft shadow
  * Rounded corners (12–16px)
* Buttons:

  * Rounded (10–12px)
  * Clear primary vs secondary distinction
* Inputs:

  * Large touch-friendly fields
  * Clear focus states
* Badges:

  * Subtle, neutral, not colorful

### Icons & Visuals

* Simple outline icons
* No emojis
* No illustrations unless extremely minimal
* Profile images are the main visual focus

---

## **FUNCTIONAL & INTERACTION REQUIREMENTS**

Apply these behaviors consistently across the app:

* Hover states on all clickable elements
* Soft transitions (150–200ms ease)
* Card lift on hover (very subtle)
* Clear disabled states
* Sticky navigation shadow on scroll
* Modal-based flows where appropriate
* Time-based UI states (e.g., chat active / expired)
* Status badges for:

  * verified
  * pending
  * active
  * completed
  * cancelled

Admin-specific:

* Row hover highlight in tables
* Confirmation modals for destructive actions
* Clear warning banners for suspended users

---

## **CONTENT & COPY STYLE**

* Clear, short sentences
* Neutral tone
* No slang
* No flirting
* No suggestive language

Examples:

* “Book time”
* “Request session”
* “Companion unavailable”
* “Session completed”
* “Payment pending confirmation”

---

## **CONSTRAINTS (STRICT — DO NOT BREAK)**

* Do NOT add new features
* Do NOT invent extra pages
* Do NOT use lorem ipsum
* Do NOT add dating-style UI
* Do NOT add sexualized visuals
* Do NOT overuse gradients
* Do NOT use bright or neon colors
* Do NOT change product intent
* Use **Tailwind CSS utility classes only**
* Keep everything production-ready

---

## **REFERENCE & CONSISTENCY NOTE**

Follow a **single design system** across:

* user side
* companion side
* admin side

All components should look like they belong to the **same product**, even when the role changes.

If a reference image is attached:

* Follow its spacing and layout logic
* Ignore its colors if they conflict with this prompt
* Prioritize clarity over decoration

---

## **FINAL OUTPUT EXPECTATION**

The result should feel like:

* a calm, trustworthy social platform
* something users would feel safe opening
* something an investor wouldn’t cringe at
* something that can scale without redesign
