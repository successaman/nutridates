/* =========================================================
   NutriDates — global.js
   Lightweight custom elements, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Utilities ---------- */
  const NDCurrency = {
    format(cents) {
      const fmt = window.NDMoneyFormat || '₹{{amount}}';
      const amount = (cents / 100).toFixed(2).replace(/\.00$/, '');
      const withCommas = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return fmt.replace(/\{\{\s*amount(_no_decimals)?\s*\}\}/, withCommas);
    }
  };

  function on(el, evt, fn) { if (el) el.addEventListener(evt, fn); }

  /* ---------- Drawer (mobile menu + cart) ---------- */
  class NDDrawer extends HTMLElement {
    connectedCallback() {
      this.overlay = this.querySelector('.drawer__overlay');
      this.closers = this.querySelectorAll('[data-drawer-close]');
      on(this.overlay, 'click', () => this.close());
      this.closers.forEach((b) => on(b, 'click', () => this.close()));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.classList.contains('is-open')) this.close();
      });
      document.querySelectorAll('[data-drawer-open="' + this.id + '"]').forEach((btn) => {
        on(btn, 'click', (e) => { e.preventDefault(); this.open(btn); });
      });
    }
    open(trigger) {
      this.opener = trigger || null;
      this.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const focusable = this.querySelector('[data-drawer-close], a, button');
      if (focusable) focusable.focus();
    }
    close() {
      this.classList.remove('is-open');
      document.body.style.overflow = '';
      if (this.opener) this.opener.focus();
    }
  }
  customElements.define('nd-drawer', NDDrawer);

  /* ---------- Quantity input ---------- */
  class NDQuantity extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input');
      this.querySelectorAll('button').forEach((btn) => {
        on(btn, 'click', () => {
          const step = btn.dataset.qtyChange === 'plus' ? 1 : -1;
          const min = parseInt(this.input.min || '1', 10);
          const next = (parseInt(this.input.value, 10) || min) + step;
          this.input.value = Math.max(min, next);
          this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    }
  }
  customElements.define('nd-quantity', NDQuantity);

  /* ---------- Variant selection ---------- */
  class NDVariants extends HTMLElement {
    connectedCallback() {
      this.data = JSON.parse(this.querySelector('[type="application/json"]').textContent);
      this.idInput = this.querySelector('input[name="id"]');
      this.priceEl = document.getElementById('Price-' + this.dataset.section);
      this.addBtn = document.getElementById('AddButton-' + this.dataset.section);
      this.addEventListener('change', () => this.onChange());
    }
    selectedOptions() {
      return Array.from(this.querySelectorAll('input[type="radio"]:checked, select'))
        .map((el) => el.value);
    }
    onChange() {
      const chosen = this.selectedOptions();
      const match = this.data.find((v) =>
        v.options.every((opt, i) => opt === chosen[i])
      );
      if (!match) return this.setUnavailable();
      this.idInput.value = match.id;
      if (window.history.replaceState) {
        const url = new URL(window.location);
        url.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', url);
      }
      if (this.priceEl) {
        let html = '<span class="price price--large">' + NDCurrency.format(match.price) + '</span>';
        if (match.compare_at_price && match.compare_at_price > match.price) {
          const off = Math.round((1 - match.price / match.compare_at_price) * 100);
          html += '<span class="price--compare">' + NDCurrency.format(match.compare_at_price) + '</span>';
          html += '<span class="price--off">' + off + '% OFF</span>';
        }
        this.priceEl.innerHTML = html;
      }
      if (this.addBtn) {
        this.addBtn.disabled = !match.available;
        this.addBtn.querySelector('span').textContent =
          match.available ? this.addBtn.dataset.labelAdd : this.addBtn.dataset.labelSoldOut;
      }
    }
    setUnavailable() {
      if (this.addBtn) {
        this.addBtn.disabled = true;
        this.addBtn.querySelector('span').textContent = this.addBtn.dataset.labelUnavailable;
      }
    }
  }
  customElements.define('nd-variants', NDVariants);

  /* ---------- Product gallery ---------- */
  class NDGallery extends HTMLElement {
    connectedCallback() {
      this.main = this.querySelector('[data-gallery-main]');
      this.querySelectorAll('[data-gallery-thumb]').forEach((thumb) => {
        on(thumb, 'click', () => {
          this.querySelectorAll('[data-gallery-thumb]').forEach((t) => t.setAttribute('aria-current', 'false'));
          thumb.setAttribute('aria-current', 'true');
          const target = document.getElementById(thumb.dataset.galleryThumb);
          if (target && this.main) {
            this.main.scrollTo({ left: target.offsetLeft - this.main.offsetLeft, behavior: 'smooth' });
          }
        });
      });
    }
  }
  customElements.define('nd-gallery', NDGallery);

  /* ---------- Add to cart (AJAX) ---------- */
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-cart-form]');
    if (!form) return;
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>Adding…</span>'; }
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const json = await res.json();
      if (json.status) throw new Error(json.description || json.message);
      await refreshCartCount();
      const drawer = document.getElementById('CartDrawer');
      if (drawer) { await refreshCartDrawer(); drawer.open(); }
      else window.location.href = '/cart';
    } catch (err) {
      const note = form.querySelector('[data-cart-error]');
      if (note) { note.textContent = err.message; note.hidden = false; }
      else alert(err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
    }
  });

  async function refreshCartCount() {
    const res = await fetch('/cart.js');
    const cart = await res.json();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
    return cart;
  }

  async function refreshCartDrawer() {
    const target = document.querySelector('[data-cart-drawer-body]');
    if (!target) return;
    const res = await fetch(window.location.pathname + '?section_id=cart-drawer');
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const fresh = doc.querySelector('[data-cart-drawer-body]');
    if (fresh) target.innerHTML = fresh.innerHTML;
  }

  /* Cart line item quantity / remove */
  document.addEventListener('click', async (e) => {
    const remove = e.target.closest('[data-cart-remove]');
    if (!remove) return;
    e.preventDefault();
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: parseInt(remove.dataset.cartRemove, 10), quantity: 0 })
    });
    await refreshCartCount();
    if (document.body.classList.contains('template-cart')) window.location.reload();
    else await refreshCartDrawer();
  });

  window.NDCart = { refreshCartCount, refreshCartDrawer };

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Marquee: duplicate track for seamless loop ---------- */
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    track.innerHTML = track.innerHTML + track.innerHTML;
  });
})();
