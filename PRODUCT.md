# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Solo travelers journaling their own trips: writing daily entries and attaching photos as a personal archive and reflection tool. Not primarily built for sharing with others — the core moment is the traveler alone, revisiting or logging a day.

## Product Purpose

Journee is a travel journaling app. Travelers organize trips into days, write a journal entry per day with a rich-text editor, and attach photos to that day. Photos also carry geolocation (inferred from the photo via Cloudflare Workers AI vision) so they can be placed on a map. Success is a traveler wanting to open the app to relive or record a trip, not abandoning it after the first few days.

## Positioning

Combines day-by-day journaling with automatic photo geolocation (no manual pin-dropping) and a map view (Snapspot) that connects photos to where they were taken. The mechanism a generic notes app or photo album can't copy: entries, photos, and location are unified per trip-day, with location inferred automatically from the image.

## Operating Context

- Trip → Days → Day entry hierarchy: a trip has a date range; each day in range gets its own journal entry + photos.
- Day entry: title, free-text rich entry (Tiptap-based), location/area field, and 0+ photos.
- Photo upload triggers an AI geolocation call (Workers AI) before the image lands in R2 storage and the DB.
- Autosave on the entry text (debounced) while editing.
- Snapspot: a separate map view filtering photos by trip/day.
- Auth via Clerk (Apple/Google or username+password).

## Capabilities and Constraints

- Next.js 15 App Router, deployed to Cloudflare Workers (OpenNext), D1 (DB), R2 (image storage).
- No test framework configured.
- Mobile and desktop both supported; day-entry editor currently switches between a Dialog (desktop) and a Drawer (mobile).
- Photo geolocation depends on Workers AI vision output quality — not always precise.

## Brand Commitments

- Name: Journee. Logo asset at `public/journee.png` / `public/J.png`.
- No fixed color palette, typography system, or component library is a binding brand commitment — current visuals (indigo/purple gradient accent, default shadcn tokens, Varela Round body font) are early/unrefined choices, not intentional brand identity, and are open to replacement.
- Structural IA (trip list → day grid → day detail, rich-text editor, photo upload) should stay recognizable through a visual redesign; the visual language (color, type, motion, texture) is free to change.

## Evidence on Hand

No user research, testimonials, or usage data on hand. No visual/brand reference materials beyond the current live implementation.

## Product Principles

- Personal and reflective, not social — design for one person's private record, not an audience.
- Day is the atomic unit — entry text, photos, and location all hang off a single day; the day-by-day structure should stay legible at every zoom level (trip overview down to single day).
- Low-friction capture — writing and photo upload happen in the moment or shortly after; the editor and upload flow should not fight the user.
- Automatic over manual — location inference removes a chore (pin-dropping); the product's edge is doing inference work the user shouldn't have to do by hand.

## Accessibility & Inclusion

No product-specific accessibility requirement established beyond standard web accessibility practice.
