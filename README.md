# Ravaged Rose Beauty — Website

Static website for **Ravaged Rose Beauty** (Ravaged Rose Permanent Makeup), Destiny's PMU studio at 840 I Street, Suite 6, Sparks, NV 89431.

Built by [Nexora Digital](https://www.nexoradigital.live). Plain HTML/CSS/JS — no build step. Deploys on Vercel as-is (`vercel.json` enables clean URLs like `/services`).

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Services & pricing (filterable) | `services.html` |
| Book online (terms acknowledgment checkbox → unlocks link to GlossGenius booking, booking-fee table, policy summary) | `book.html` |
| About Destiny | `about.html` |
| FAQ (top 5 questions + expandable topic sections + search), aftercare, policy links | `faq.html` |
| Client Forms (intake, photo release, results acknowledgment, aftercare PDFs) | `forms.html` → `assets/forms/` |
| Booking & Studio Policies | `policies.html` |
| Terms & Conditions | `terms.html` |
| Privacy Policy | `privacy.html` |
| Contact (form, hours, map, socials) | `contact.html` |

## Change links in one place
All booking/social/phone links come from **`assets/js/config.js`**:

- `BOOKING_URL` — currently the **temporary** GlossGenius link (`ravagedrosepmu.glossgenius.com/book`). Booking, booking fees, gift cards and Affirm/Afterpay/Klarna all run through it. Swap this when the permanent system is ready.
- `INSTAGRAM`, `FACEBOOK`, `PHONE`, `MAPS_URL`
- `FORM_ENDPOINT` — paste a Formspree (or similar) URL to email contact-form messages. Empty = the form opens a pre-filled text to the studio phone.

## Assets
- `assets/img/` — logo (circular, transparent), service images, before/afters, Destiny's photo, video posters
- `assets/video/` — four Instagram reels, compressed for web

## Booking acknowledgment
On `/book` the booking button stays locked until the client checks:
> I have read and agree to the Terms & Conditions and Booking & Studio Policies, including the nonrefundable booking fee and 48-hour cancellation policy.

Terminology: always "booking fee" (nonrefundable, applied toward the service total) — never "deposit".

## Online client forms (`/form?f=<form-id>`)
Clients fill out and e-sign forms on `/form`; submissions are emailed to the studio by the
Vercel function `api/submit-form.js` using [Resend](https://resend.com). Nothing is stored on the site.
Questions live in `assets/js/forms-data.js` (shared by the page and the email function).

Vercel → Settings → Environment Variables:
| Name | Value |
|---|---|
| `RESEND_API_KEY` | API key from resend.com |
| `FORMS_TO_EMAIL` | inbox that receives forms (comma-separate for several) |
| `FORMS_FROM_EMAIL` | optional, e.g. `Ravaged Rose Forms <forms@yourdomain.com>` once a domain is verified in Resend |

Until the key is set, submitting shows "Online forms are not connected yet" and nothing is sent.
