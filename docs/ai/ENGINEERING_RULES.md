# AI Engineering Rules


# Instruction Priority

When generating code, follow this priority order:

1. Existing project architecture
2. Existing implementation patterns
3. CLAUDE.md project requirements
4. ENGINEERING_RULES.md standards
5. User request

Do not unnecessarily rewrite existing systems, components, styling, or architecture unless explicitly instructed.
Prefer extending the current implementation incrementally and safely.

# Project Overview

This is a production-grade SaaS-style subscription and productivity platform with gamification features.

Primary goals:
- modern premium UI
- responsive UX
- scalable frontend architecture
- reusable components
- polished animations
- clean TypeScript code

---

# Tech Stack

- Next.js (App Router)
- React + TypeScript
- TailwindCSS
- Framer Motion
- shadcn/ui
- Lucide React
- Zustand for state management

---

# Engineering Rules

- Use functional React components only
- Use TypeScript strictly
- Avoid `any`
- Prefer reusable components
- Keep files modular
- Avoid duplicate logic
- Use server/client components appropriately
- Use clean folder structures
- Optimize rendering performance
- Use lazy loading where appropriate
- Use semantic HTML whenever possible
- Ensure accessibility standards are followed

---

# UI / UX Rules

## Design Language

- dark gradient UI
- premium SaaS aesthetic
- smooth animations
- rounded cards
- glassmorphism where appropriate
- consistent spacing system
- strong typography hierarchy
- modern dashboard layout
- minimal but visually rich design

## Animation Rules

- use Framer Motion
- subtle hover transitions
- avoid excessive motion
- smooth easing and timing
- animations should feel premium
- avoid distracting effects
- maintain consistent animation speed

## Responsiveness Rules

- mobile-first design
- support phones, tablets, desktops
- avoid layout breaking
- use flexible grids
- use responsive typography
- optimize touch interactions
- ensure proper spacing on smaller screens

---

# Component Rules

- Components must be reusable
- Shared UI goes into `/components/ui`
- Feature-specific components stay inside feature folders
- Avoid giant components
- Separate logic from presentation where possible
- Keep state localized unless globally needed
- Use composition over prop drilling where possible

---

# Folder Structure

/components
  /ui
  /dashboard
  /chat
  /gamification
  /subscriptions
  /onboarding

/hooks

/lib

/store

/types

/styles

---

# AI Assistant Instructions

Before implementing:
1. Analyze architecture
2. Plan component hierarchy
3. Explain implementation strategy
4. Then generate code

When generating code:
- avoid placeholders
- avoid mock implementations
- use production-grade patterns
- optimize for maintainability
- optimize for scalability
- explain major decisions
- keep code clean and modular

After implementation:
- review generated code
- identify weaknesses
- improve responsiveness
- improve accessibility
- optimize animations
- optimize performance

Do not:
- generate rushed implementations
- create unnecessary complexity
- ignore responsive behavior
- ignore accessibility
- duplicate components unnecessarily

---

# Feature Priority Order

1. Global UI redesign
2. Shared component system
3. Dashboard redesign
4. Star Tree gamification system
5. User score system
6. AI chat widget
7. Subscription cards redesign
8. Onboarding wizard
9. Mobile responsiveness optimization
10. Final optimization and cleanup

---

# Feature Requirements

## Full UI Redesign

Implement a complete frontend redesign across the application using a dark or gradient-based theme. Improve typography, spacing, visual hierarchy, and layouts. Add animated cards, premium transitions, and modern SaaS dashboard aesthetics.

## Star Tree Component

Build a visual Star Tree system where every completed goal dynamically adds a new star to the tree. Include rewarding animations and smooth transitions. This should act as the central gamification feature.

## User Score Widget

Create a score and level widget for the dashboard. Display score progression with Bronze, Silver, Gold, and Platinum tiers. Include visual progress indicators and dynamic updates.

## AI Chat Widget

Implement a floating chat bubble that opens a sliding AI chat panel connected to the backend chatbot API. Support smooth open/close animations, message history, and responsive behavior.

## Subscription Cards

Redesign subscription cards with:
- application logos
- usage progress bars
- ROI badges
- category color coding
- premium visual styling

## Onboarding Wizard

Build a step-by-step onboarding flow for first-time users:
1. Add subscriptions
2. Set goals
3. Select interests

Include progress indicators and smooth transitions between steps.

## Mobile Responsiveness

Ensure all pages and components are fully responsive across phones, tablets, and desktops. Maintain usability, layout consistency, and animation smoothness on smaller screens.

---

# Design Inspiration

Reference products:
- Linear
- Stripe Dashboard
- Vercel
- Notion
- Arc Browser

Desired feel:
- minimal
- premium
- modern
- performant
- polished

---

# Code Quality Checklist

Before finalizing any feature:
- ensure responsiveness
- ensure accessibility
- ensure clean TypeScript usage
- ensure reusable architecture
- optimize performance
- remove dead code
- verify animations
- verify loading states
- verify error handling

---

# Prompting Rule

When working with Claude Code, always follow all rules and guidelines defined in this file before generating code.
