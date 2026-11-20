# Rock N Roll House website

A static redesign of https://www.rocknrollhouse.com/ (currently a Squarespace site). It follows the
visual direction of the design ZIP (`design-reference/rock-n-roll-house.dc.html`).

## Preview locally

```bash
npm run preview
```

Then open http://localhost:4173. (`python3 -m http.server 4173` works too.)
**Not deployed.** Nothing has been published yet; the live Squarespace site is unchanged.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, classes, live schedule, first class, about and coaches, reviews, memberships, shop, contact |
| `landing/`, `home/`, `cart/` | Old Squarespace URLs. They redirect to `/`, keeping `#schedule`, `#memberships`, `#store` and `#contact-us` working |
| `assets/css/site.css` | Design tokens and layout |
| `assets/js/site.js` | Mobile menu, membership tabs, Mindbody fallback, Google reviews renderer |
| `assets/img/` | Gym-owned photos from the current site, re-encoded to WebP at responsive sizes |
| `design-reference/` | The ZIP's design source, kept for reference |

## Mindbody (do not change these values)

- Widget: `<div class="mindbody-widget" data-widget-type="Schedules" data-widget-id="8026543dcae">`
  with `<script async src="https://brandedweb.mindbodyonline.com/embed/widget.js">`. This is copied
  unchanged from the live site.
- Direct schedule (used as the fallback link):
  https://go.mindbodyonline.com/book/widgets/schedules/view/8026543dcae/schedule
- Booking goes to Mindbody's branded checkout for studio **5743607**, location `loc_11kTzDYfqhLTDWgYxk`.
- Class times live only in Mindbody. The page never hard-codes times.
- If the widget hasn't rendered 12 seconds after a visitor nears the schedule, a notice with the
  direct link appears. A permanent "Open on Mindbody" button and link are always shown too.

## Google reviews

The reviews section shows Google's own map embed for the listing, plus a **Read more on Google**
button. To feature individual reviews, paste them into the `#google-reviews` JSON block in
`index.html`. Copy each one word for word from the Google listing:

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
- [ ] Choose hosting. This is a static site, so it needs a static host (Netlify, Cloudflare Pages, GitHub Pages)
      with the domain pointed at it, or the sections need rebuilding in Squarespace.
