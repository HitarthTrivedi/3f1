# 3F1 Design Guidelines

## Design Approach
**Reference-Based: Perplexity-Inspired Minimal + Playful**
Drawing from Perplexity's clean, search-focused aesthetic but simplified with playful personality through microcopy, emoji agents, and subtle animations.

## Typography
- **Primary Font**: Inter (Google Fonts) - clean, modern readability
- **Logo Font**: Space Grono (Google Fonts) - bold, block-style for "3F1" branding
- **Hierarchy**:
  - Logo: text-5xl, font-black
  - Page Title: text-2xl, font-semibold
  - Section Headers: text-lg, font-medium
  - Agent Names: text-base, font-semibold
  - Body/Messages: text-base, font-normal
  - Microcopy: text-sm, font-normal

## Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 (p-4, gap-6, m-8, etc.)
- Container: max-w-4xl mx-auto for main content area
- Section spacing: py-8 between major sections
- Component spacing: gap-4 for forms, gap-6 for debate cards
- Padding: p-4 for cards, p-6 for major containers

## Core Components

### 1. Header
- 3F1 logo (Space Grono, centered or left-aligned)
- Tagline: "Let the robots argue 🥲" (centered, text-sm)
- Clean, minimal header with subtle bottom border

### 2. Agent Configuration Cards (3 identical blocks)
- Card layout with rounded corners (rounded-lg)
- Agent identifier with emoji mascot (🤖 for Agent 1, 🦉 for Agent 2, 🦊 for Agent 3)
- Dropdown for Provider (ChatGPT / Gemini / Perplexity / Custom API)
- Text input for Model (placeholder: "e.g., gpt-4o")
- Password input for API Key (masked, placeholder: "Enter API key")
- All inputs with consistent padding (p-3) and border styling

### 3. Debate Topic Input
- Large text area (h-24) for topic entry
- Placeholder: "What should these AI agents debate about?"
- Prominent "Start Debate" button below (w-full on mobile, auto on desktop)

### 4. Live Debate Feed
- Sequential message cards appearing with slide-up + fade animation
- Each message card includes:
  - Agent emoji + name (color-coded per agent)
  - Round indicator (e.g., "Round 3 of 5")
  - Message text with readable line-height (leading-relaxed)
  - Quoted references highlighted with subtle background treatment
- Cards have subtle shadow (shadow-sm) and spacing (mb-4)

### 5. Transcript Download Section
- Appears after debate completion
- Two download buttons side-by-side:
  - "Download JSON" 
  - "Download .TXT"
- Success message with playful copy: "Debate complete! 🎉"

### 6. Error Handling
- Toast notifications (top-right corner)
- Playful error messages: "Uh oh — the API objected. Try another key or model."
- Warning state for form validation

## Visual Treatments
- **Cards**: Subtle border (border-gray-200), rounded corners (rounded-lg), light background
- **Buttons**: Primary action buttons with full rounded corners (rounded-full), secondary buttons with rounded-lg
- **Inputs**: Border on all sides, focus state with ring treatment
- **Agent Color Coding**: Use subtle background tints to distinguish agents (blue-50, green-50, orange-50)

## Animations
- Message entry: Slide-up (translate-y) + fade-in (opacity) over 300ms
- Button interactions: Subtle scale on hover (scale-105)
- Loading state: Pulsing animation for "Thinking..." indicator
- Minimal, performant animations only

## Icons
**Heroicons** (via CDN)
- Download icon for transcript buttons
- Chevron for dropdowns
- Alert/warning icons for error states
- Settings/configuration icons where helpful

## Page Structure
1. Header with 3F1 logo + tagline
2. Agent configuration section (3 cards in grid: grid-cols-1 md:grid-cols-3 gap-6)
3. Debate topic input (centered, max-w-2xl)
4. Live debate feed (sequential messages)
5. Download section (appears post-debate)

## Accessibility
- All form inputs with proper labels
- Keyboard navigation support
- Focus indicators on interactive elements
- Sufficient contrast ratios
- Screen reader-friendly message structure

## Key Principles
- **Minimal First**: Remove unnecessary elements, favor whitespace
- **Playful Personality**: Use emoji, witty microcopy, friendly tone
- **Progressive Disclosure**: Show configuration → debate → download in clear stages
- **Responsive**: Mobile-first approach, grid adapts to screen size
- **Readability**: Generous line-height and spacing for debate text