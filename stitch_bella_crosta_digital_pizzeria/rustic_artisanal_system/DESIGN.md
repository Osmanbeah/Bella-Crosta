---
name: Rustic Artisanal System
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#594139'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#8d7167'
  outline-variant: '#e1bfb4'
  surface-tint: '#a93700'
  primary: '#973100'
  on-primary: '#ffffff'
  primary-container: '#c04000'
  on-primary-container: '#ffe9e3'
  inverse-primary: '#ffb59b'
  secondary: '#9f402d'
  on-secondary: '#ffffff'
  secondary-container: '#fd876f'
  on-secondary-container: '#732010'
  tertiary: '#4a5a14'
  on-tertiary: '#ffffff'
  tertiary-container: '#61732b'
  on-tertiary-container: '#e3f8a0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#812800'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#ffb4a5'
  on-secondary-fixed: '#3e0500'
  on-secondary-fixed-variant: '#802918'
  tertiary-fixed: '#d7ec95'
  tertiary-fixed-dim: '#bbcf7c'
  on-tertiary-fixed: '#161e00'
  on-tertiary-fixed-variant: '#3d4c05'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is built on a "Rustic-Modern Fusion" philosophy. It balances the warmth of a family-run Italian kitchen with the precision of a high-performance digital ordering platform. The aesthetic is artisanal, tactile, and trustworthy.

The visual direction avoids corporate sterility in favor of organic textures and human touches. It utilizes a sophisticated blend of **Minimalism** for functional clarity and **Tactile** elements (subtle linen textures and hand-drawn accents) to evoke the sensory experience of a physical pizzeria. The target audience values authenticity, ingredient quality, and seamless technology. The emotional response should be one of hunger-inducing warmth and reliable professional service.

## Colors

The palette is rooted in the traditional landscape of Italy, using high-chroma earthy tones to drive appetite and brand recognition.

- **Primary (Deep Tomato):** Used for primary actions, price points, and critical brand moments.
- **Secondary (Terracotta):** Used for secondary UI elements, hovered states, and decorative icons.
- **Tertiary (Olive Green):** Reserved for "Fresh" or "Vegetarian" indicators, success states, and health-related callouts.
- **Neutral (Cream/Off-white):** The foundational background color to provide warmth and reduce eye strain compared to pure white.
- **Charcoal Black:** Used for high-contrast typography and structural borders to maintain a modern edge.

## Typography

This design system utilizes **Bricolage Grotesque** for headlines to mimic the expressive, slightly irregular nature of chalkboard lettering while remaining highly legible and modern. For all functional UI and body copy, **Work Sans** provides a grounded, professional contrast that ensures the ordering process feels efficient.

- **Headlines:** Should be used sparingly to establish hierarchy. Use the expressive weight of Bricolage Grotesque to convey personality.
- **Body Text:** Work Sans is the workhorse. Maintain generous line height (1.5x) to ensure readability against textured backgrounds.
- **Labels:** Use uppercase for small labels and buttons to create a clear "UI" layer that sits on top of the "Artisanal" brand layer.

## Layout & Spacing

The system follows a **Fluid Grid** model with a mobile-first priority. 

- **Mobile (<768px):** 4-column layout with 16px side margins. Content is stacked vertically to prioritize the "Add to Cart" flow.
- **Tablet (768px - 1024px):** 8-column layout. Pizza menus transition to 2-column grids.
- **Desktop (>1024px):** 12-column layout with a 1280px maximum container width. Use generous whitespace (64px+ sections) to evoke a premium, unhurried dining experience.

Spacing rhythm is strictly based on an **8px base unit**. All padding and margins must be multiples of 8 to maintain visual harmony.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Subtle Textures** rather than heavy shadows.

1.  **Base Layer:** The Cream (#FDFBF7) background, occasionally overlaid with a very low-opacity (2%) linen texture.
2.  **Card Layer:** Pure white surfaces with a very soft, diffused shadow (0px 4px 20px rgba(51, 51, 51, 0.05)) to separate food items from the background.
3.  **Interactive Layer:** Buttons and active selections use slightly stronger shadows or a 2px Charcoal border to indicate "clickability."
4.  **Overlays:** High-blur backdrops for modals to keep the focus on the customization of the pizza.

## Shapes

The shape language is defined by **organic softness**. 

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius to feel friendly but structured.
- **Circular Crops:** Specifically for food photography (pizzas, ingredients), use perfect circles or "squircle" crops to emphasize the shape of the product.
- **Iconography:** Use thick-stroke (2px) rounded icons that match the weight of the Work Sans typeface. Avoid sharp corners in all illustrative elements.

## Components

### Buttons
- **Primary:** Deep Tomato (#C04000) background, White text. High-contrast, 0.5rem roundedness.
- **Secondary:** Transparent with 2px Charcoal Black border.
- **Tertiary/Ghost:** Olive Green text, no background, used for "See Details."

### Cards
Product cards should feature a circular pizza image at the top, centered. The card container is white with a soft 1px border (#EAEAEA) and a subtle shadow.

### Input Fields
Forms use a light cream background with a 1px Charcoal border that thickens to 2px on focus. Labels sit outside the field in Work Sans Bold.

### Chips/Tags
Use Olive Green for "Chef's Choice" or "Vegan" tags. These should have a pill-shape (rounded-full) and use `label-md` typography.

### Customization Toggle
For crust or topping selections, use large "tiles" rather than simple checkboxes. Selected tiles should have a 2px Deep Tomato border and a subtle light-orange background tint.