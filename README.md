# Hybrit E-mail Signature Generator

A small, dependency-free web page that lets Hybrit employees fill in their details and copy a ready-made HTML e-mail signature (for Gmail and other clients).

## Usage

1. Open `index.html` in a browser (no build step or server needed).
2. Fill in your name, job title and e-mail address (mobile number and absence text are optional).
3. Click **Generate Signature**.
4. Click **Copy to clipboard** under the signature you want and paste it into your e-mail client's signature settings.

## Project structure

```
index.html            Generator page
assets/
  css/style.css       Interface styling (responsive)
  js/app.js           Form handling and clipboard logic
  img/                Icons and logos used by the signatures
templates/            Standalone signature templates (signature_v01 - v05)
```

Signature markup uses inline styles on purpose, because e-mail clients ignore external stylesheets.

## Configuration

E-mail clients can only display images hosted on a public URL. When copying, `app.js` rewrites every signature image to `PUBLIC_ASSET_BASE` (top of `assets/js/app.js`) plus the original filename. Upload the contents of `assets/img/` to that location, or change the constant to your own host. Set it to `''` to copy the local paths unchanged.

## Missing assets

These images are referenced by the templates but are not in `assets/img/` yet:

- `Hybrit_creating-smart-solutions_Orange-White.png`
- `Hybrit_creating-smart-solutions_Orange-Darkgrey.png`

## Notes

- Uses the async Clipboard API, with a legacy fallback for older browsers.
- The Raleway font is loaded from Google Fonts.
