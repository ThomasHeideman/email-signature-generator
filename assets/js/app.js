'use strict';

/**
 * Hybrit E-mail Signature Generator
 *
 * - Fills every signature preview with the values from the form.
 * - Copies a rendered signature to the clipboard as rich HTML.
 */

/**
 * Signatures are previewed with the local images in assets/img/, but an e-mail
 * client (Gmail, Outlook, ...) can only show images that are hosted on a public
 * URL. When copying, every <img> is therefore rewritten to this base URL,
 * keeping the original filename. Set to '' to copy the local paths unchanged.
 *
 * Currently served by GitHub Pages from assets/img/ in this repository.
 */
const PUBLIC_ASSET_BASE = 'https://thomasheideman.github.io/email-signature-generator/assets/img/';

const FEEDBACK_DURATION_MS = 2000;

/* --------------------------------------------------------------------------
   Generate
   -------------------------------------------------------------------------- */

const setText = (selector, value) => {
   document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
   });
};

const setHref = (selector, href) => {
   document.querySelectorAll(selector).forEach((el) => {
      el.setAttribute('href', href);
   });
};

const generateSignature = () => {
   const value = (id) => document.getElementById(id).value.trim();

   const fullName = value('input-Name');
   const title = value('input-Title');
   const email = value('input-Email');
   const mobile = value('input-Mobile');
   const availability = value('input-Availability');

   setText('.name', fullName);
   setText('.title', title);
   setText('.email span', email);
   setHref('.email', `mailto:${email}`);
   setText('.mobile', mobile);
   setHref('.mobile-phone', `tel:${mobile.replace(/\s+/g, '')}`);
   setText('.availability', availability);
};

/* --------------------------------------------------------------------------
   Copy
   -------------------------------------------------------------------------- */

/** Returns the signature HTML, with images pointing at publicly hosted files. */
const getCopyableHtml = (signatureEl) => {
   const clone = signatureEl.cloneNode(true);

   if (PUBLIC_ASSET_BASE) {
      clone.querySelectorAll('img').forEach((img) => {
         const filename = img.getAttribute('src').split('/').pop();
         img.setAttribute('src', `${PUBLIC_ASSET_BASE}${filename}`);
      });
   }

   return clone.innerHTML;
};

/** Legacy fallback: select a hidden copy of the HTML and use execCommand. */
const copyWithSelection = (html) => {
   const container = document.createElement('div');
   container.innerHTML = html;
   Object.assign(container.style, {
      position: 'fixed',
      pointerEvents: 'none',
      opacity: '0',
   });
   document.body.appendChild(container);

   const selection = window.getSelection();
   selection.removeAllRanges();
   const range = document.createRange();
   range.selectNode(container);
   selection.addRange(range);

   let success = false;
   try {
      success = document.execCommand('copy');
   } finally {
      selection.removeAllRanges();
      document.body.removeChild(container);
   }

   if (!success) {
      throw new Error('Copy command was not successful');
   }
};

const copyHtmlToClipboard = async (html) => {
   const plainText = (new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '')
      .replace(/\s+/g, ' ')
      .trim();

   // Preferred: modern async Clipboard API, writing rich HTML (+ plain text).
   if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
      try {
         await navigator.clipboard.write([
            new ClipboardItem({
               'text/html': new Blob([html], { type: 'text/html' }),
               'text/plain': new Blob([plainText], { type: 'text/plain' }),
            }),
         ]);
         return;
      } catch (error) {
         console.warn('Clipboard API write() failed, using fallback.', error);
      }
   }

   // Fallback 1: legacy selection + execCommand (keeps the rich formatting).
   try {
      copyWithSelection(html);
      return;
   } catch (error) {
      console.warn('execCommand fallback failed.', error);
   }

   // Fallback 2: plain text only, better than nothing.
   if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(plainText);
      return;
   }

   throw new Error('Clipboard is not available in this browser');
};

const showButtonFeedback = (button, label, stateClass) => {
   if (!button.dataset.label) {
      button.dataset.label = button.textContent;
   }

   clearTimeout(Number(button.dataset.timer));
   button.textContent = label;
   button.classList.remove('is-copied', 'is-error');
   button.classList.add(stateClass);

   button.dataset.timer = String(
      setTimeout(() => {
         button.textContent = button.dataset.label;
         button.classList.remove(stateClass);
         delete button.dataset.timer;
      }, FEEDBACK_DURATION_MS),
   );
};

const handleCopyClick = async (event) => {
   const button = event.currentTarget;
   const signatureEl = button
      .closest('.content-wrapper')
      .querySelector('.box-container');

   try {
      await copyHtmlToClipboard(getCopyableHtml(signatureEl));
      showButtonFeedback(button, 'Copied! ✓', 'is-copied');
   } catch (error) {
      console.error(error);
      showButtonFeedback(button, 'Copy failed ✗', 'is-error');
   }
};

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */

const init = () => {
   const form = document.getElementById('signature-form');

   // Submit (button click or Enter key) after native validation passes.
   form.addEventListener('submit', (event) => {
      event.preventDefault();
      generateSignature();
   });

   document.querySelectorAll('.copy-button').forEach((button) => {
      button.addEventListener('click', handleCopyClick);
   });
};

init();
