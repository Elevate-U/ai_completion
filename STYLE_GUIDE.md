# Website Style Guide

This document outlines the visual design guidelines, CSS variables, and component styles for the ThinkStack website.

## 1. Color Palette

Colors are managed via CSS custom properties (variables) defined in `:root` and theme-specific blocks (`html[data-theme='...']`) in `website/css/style.css`.

### 1.1 Core Variables (Defaults - Light Theme Base)

*   `--primary-color`: `#0056b3` (Main interactive elements, headings)
*   `--secondary-color`: `#6c757d` (Secondary text, borders, subdued elements)
*   `--accent-color`: `#fc0` (Hover states, highlights)
*   `--text-primary`: `#212529` (Main body text)
*   `--text-secondary`: `#f8f9fa` (Used for text on dark backgrounds, e.g., buttons - *Note: Light theme overrides this to `#212529`*)
*   `--bg-primary`: `#f8f9fa` (Main page background)
*   `--bg-secondary`: `#343a40` (Secondary background, e.g., dark theme, table stripes - *Note: Light theme overrides this to `#e9ecef`*)
*   `--border-color`: `#dee2e6` (Borders for cards, tables, header/footer)
*   `--card-background`: `#fff` (Default card background - *Note: Themes override this*)
*   `--shadow-color`: `rgb(0 0 0 / 10%)` (Default box shadow color)
*   `--link-color`: `var(--primary-color)` (Default link color)

### 1.2 Theme-Specific Palettes

Refer to `html[data-theme='light']`, `html[data-theme='dark']`, and `html[data-theme='spotify']` blocks in `style.css` for overrides.

### 1.3 Semantic Colors (To Be Defined as Variables)

*   **Success:** `#28a745` (Used in `.available` class - *Should become `--success-color`*)
*   **Error:** `#dc3545` (Used in `.unavailable` class - *Should become `--error-color`*)

### 1.4 Code Block Colors

Specific variables (`--code-bg`, `--code-text`, `--code-keyword`, etc.) are defined for each theme. See `style.css`.

## 2. Typography

*   **Primary Font Family:** `Inter`, `sans-serif` (Defined in `body` tag)
*   **Monospace Font Family:** `monospace` (`--font-family-monospace`), `Courier New`, `Consolas` (Used in code blocks)
*   **Base Font Size:** `1rem` (Implicitly set on `html` or `body`)
*   **Base Line Height:** `1.6`

### 2.1 Headings

Font sizes use `clamp()` for responsiveness.

*   `h1`: `clamp(2rem, 5vw, 2.8rem)`, `font-weight: 700`, `color: var(--primary-color)`
*   `h2`: `clamp(1.75rem, 4vw, 2.2rem)`, `font-weight: 700`
*   `h3`: `clamp(1.4rem, 3.5vw, 1.8rem)`, `font-weight: 700`
*   `h4`, `h5`, `h6`: Use appropriate sizes and weights as needed (e.g., `h5` in feature cards is `1.1rem`).

### 2.2 Body Text

*   `p`: Inherits base font size, line height, and `var(--text-primary)` color. `margin-bottom: var(--space-sm)`.

### 2.3 Links

*   `a`: `color: var(--link-color)`, `text-decoration: none`. Hover: `color: var(--accent-color)`.

## 3. Spacing

An 8px-based scale is defined using CSS variables:

*   `--space-xxs`: `0.25rem` (4px)
*   `--space-xs`: `0.5rem` (8px)
*   `--space-sm`: `1rem` (16px)
*   `--space-md`: `1.5rem` (24px)
*   `--space-lg`: `2rem` (32px)
*   `--space-xl`: `3rem` (48px)
*   `--space-xxl`: `4rem` (64px)

Use these variables for `margin`, `padding`, and `gap`.

## 4. Layout

*   **Max Width:** `--site-max-width: 1200px`
*   **Container:** `.container` class provides max-width, centering, and padding (`var(--gutter)` which uses `--space-md`).
*   **Main Layout:** `.main-content-wrapper` uses CSS Grid for main content and sidebar layout on larger screens.

## 5. Components

### 5.1 Buttons (`.button`)

*   **Padding:** `var(--space-xs) var(--space-sm)`
*   **Background:** `var(--primary-color)`
*   **Text Color:** `var(--text-secondary)` (Adjusted per theme for contrast)
*   **Border Radius:** `var(--space-xs)`
*   **Hover:** `background-color: var(--accent-color)`, subtle `transform` and `box-shadow`.

### 5.2 Cards (`.category-card`, `.feature-card`, `.pricing-tier`, `.tool-card`)

*   **Background:** `var(--card-background)`
*   **Border:** `1px solid var(--border-color)`
*   **Border Radius:** `var(--space-xs)` or `8px` (Should standardize)
*   **Padding:** Varies (`var(--space-md)`, `var(--space-sm)`, `1rem`, `15px` - Should standardize)
*   **Shadow:** `var(--shadow-color)` (Intensity varies slightly per theme/card type)
*   **Hover:** Increased `box-shadow` and `transform: translateY`.

### 5.3 Tables (`.table-wrapper > table`)

*   Modern styling with borders, padding (`var(--space-xs) var(--space-sm)`), header background (`var(--bg-secondary)`), optional striping (`:nth-child(even)`), and hover effects.
*   Requires `.table-wrapper` for horizontal scrolling on overflow.

### 5.4 Tabs (`.tabs-container`, `.tab-nav`, `.tool-tab`, `.tab-content`)

*   Uses flexbox for navigation.
*   Active tab uses `var(--primary-color)` background and `var(--text-secondary)` color.
*   Content fades in using `fadeIn` animation.

### 5.5 Code Blocks (`.code-block`)

*   Uses theme-specific variables for background and syntax highlighting.
*   Includes `> OUTPUT` pseudo-element.

## 6. Utilities

*   `.visually-hidden`: Hides content accessibly.
*   `.available` / `.unavailable`: Indicates status (Requires `--success-color` / `--error-color` variables).

## 7. Responsiveness

*   Uses media queries (`min-width: 768px`, `min-width: 1200px`) primarily for layout adjustments (container padding, grid layouts, hero section text alignment, sidebar positioning).
*   Mobile navigation is handled via JavaScript toggling an `.active` class.
*   Responsive font sizes used for headings (`clamp()`).