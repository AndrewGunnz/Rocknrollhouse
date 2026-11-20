# Rock N Roll House website

A static redesign of https://www.rocknrollhouse.com/ (currently a Squarespace site). It follows the
visual direction of the design ZIP (`design-reference/rock-n-roll-house.dc.html`).

## Preview locally

```bash
npm run preview
```

This builds the site, then serves it at http://localhost:4173.

## How it's built

Each section has its own page. Page content lives in `src/pages/`. `build.mjs` (plain Node, no
dependencies) wraps every page in the shared head, header, footer and cookie banner, then writes
`public/`. **After editing anything in `src/`, run `npm run build` and commit `public/` too.**
Cloudflare deploys `public/` as-is (no build step on Cloudflare).

| URL | Source | Contents |
| --- | --- | --- |
| `/` | `src/pages/home.html` | Hero, class overview, schedule and first-class teasers, about, prices |
| `/classes/` | `classes.html` | Every program, with a next step for each |
| `/schedule/` | `schedule.html` | Live Mindbody schedule, with fallbacks |
| `/first-class/` | `first-class.html` | Three steps to start, plus FAQ |
| `/memberships/` | `memberships.html` | Record tiers, drop-in, private coaching (`#gold` etc. open a tier) |
| `/about/` | `about.html` | The gym's story, values, coaches |
| `/reviews/` | `reviews.html` | Google reviews and map |
| `/shop/` | `shop.html` | Gym shop items |
| `/contact/` | `contact.html` | Address, phone, email, directions, map |
| `/cookies/` | `cookies.html` | Cookie details and settings button |

The old URLs `/landing`, `/home` and `/cart`, and old anchors like `/#schedule` or `/landing#store`,
redirect to the matching page.

Other files: `public/assets/` (CSS, JS, self-hosted fonts, images), `wrangler.jsonc` (Cloudflare
config), `design-reference/` (the ZIP's design source).

## Cookie consent

- Nothing from outside services loads until the visitor chooses. There are no analytics on the site
  itself, and the fonts are self-hosted.
- There are two optional categories:
  - **Mindbody** (the schedule widget, which loads Mindbody's own analytics)
  - **Google Maps** (the map on the Reviews and Contact pages)
- The banner offers **Accept all**, **Essential only** and **Customize**. Accept and reject are given
  the same weight.
- If a service is off, its spot shows a "Show schedule" or "Show map" button and a direct link.
- The choice is saved in `localStorage` (`rnrh-consent`). Visitors can reopen **Cookie settings** from
  the footer on every page. Turning a service off reloads the page so it unloads.
- To add a new embed, put it in `<template data-consent="CATEGORY">`, or use
  `<script type="text/plain" data-consent="CATEGORY" data-src="…">`. Then add the category to
  `site.js` and the settings dialog in `build.mjs`.

## Mindbody (do not change these values)

- Widget: `<div class="mindbody-widget" data-widget-type="Schedules" data-widget-id="8026543dcae">`
  with `<script async src="https://brandedweb.mindbodyonline.com/embed/widget.js">`. This is copied
  unchanged from the live site.
- Direct schedule (used as the fallback link):
  https://go.mindbodyonline.com/book/widgets/schedules/view/8026543dcae/schedule
- Booking goes to Mindbody's branded checkout for studio **5743607**, location `loc_11kTzDYfqhLTDWgYxk`.
- Class times live only in Mindbody. The page never hard-codes times.
- The widget script loads only after the visitor allows Mindbody (see Cookie consent). If it hasn't
  rendered 12 seconds later, a notice with the direct link appears. A permanent "Open on Mindbody" button and link are always shown too.

## Google reviews

The reviews section shows Google's own map embed for the listing, plus a **Read more on Google**
button. To feature individual reviews, paste them into the `#google-reviews` JSON block in
`src/pages/reviews.html` (then `npm run build`). Copy each one word for word from the Google listing:

```json
[
  {
    "author": "Name as shown on Google",
    "authorUrl": "https://www.google.com/maps/contrib/…",
    "rating": 5,
    "when": "3 months ago",
    "text": "Exact review text.",
    "photo": { "src": "/assets/img/review-1.webp", "alt": "…", "author": "Photographer's Google name" }
  }
]
```

A review photo is only shown when `photo.author` is set. It's credited as "Photo: NAME on Google".
Only add a photo once the reviewer has given permission, or serve it through the Google Places API.

## Before going live

- [ ] Add 3 genuine Google reviews (see above). They couldn't be pulled automatically.
- [ ] The current site's cage-fight photos aren't used: their rights couldn't be confirmed, and one carries a
      photographer's watermark. Add them back only once the gym confirms it owns them.
- [ ] Book a photo shoot of real classes, coaches and members. The current library is mostly murals and gear.
- [ ] Confirm whether Boxing is still offered. It isn't on the Mindbody schedule, so the Vinyl copy now says
      "Muay Thai or Brazilian Jiu Jitsu".
- [ ] Add a French version if wanted. The current site is English-only, so this redesign is too.
- [ ] Cloudflare Workers (`rocknrollhousemma`) deploys `main` with `npx wrangler deploy`. No build command is needed.
- [ ] Have someone check the cookie wording against Quebec's Law 25 before relying on it.
