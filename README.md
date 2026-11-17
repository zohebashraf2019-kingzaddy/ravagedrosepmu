# Ravaged Rose Beauty — Website

Static website for **Ravaged Rose Beauty** (Ravaged Rose Permanent Makeup), Destiny's PMU studio at 840 I Street, Suite 6, Sparks, NV 89431.

Built by [Nexora Digital](https://www.nexoradigital.live). Plain HTML/CSS/JS — no build step. Deploys on Vercel as-is (`vercel.json` enables clean URLs like `/services`).

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Services & pricing (filterable) | `services.html` |
| Book & deposits (embedded booking + deposit table + policy) | `book.html` |
| About Destiny | `about.html` |
| FAQ, aftercare & policies | `faq.html` |
| Contact (form, hours, map, socials) | `contact.html` |

## Change links in one place
All booking/social/phone links come from **`assets/js/config.js`**:

- `BOOKING_URL` — currently the **temporary** GlossGenius link (`ravagedrosepmu.glossgenius.com/book`). Booking, deposits, gift cards and Affirm/Afterpay/Klarna all run through it. Swap this when the permanent system is ready.
- `INSTAGRAM`, `FACEBOOK`, `PHONE`, `MAPS_URL`
- `FORM_ENDPOINT` — paste a Formspree (or similar) URL to email contact-form messages. Empty = the form opens a pre-filled text to the studio phone.

## Assets
- `assets/img/` — logo (circular, transparent), service images, before/afters, Destiny's photo, video posters
- `assets/video/` — four Instagram reels, compressed for web
