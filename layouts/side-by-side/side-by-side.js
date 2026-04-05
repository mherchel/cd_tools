/**
 * @file
 * Enhancement for side by side layout.
 */

((Drupal, once) => {
  /**
   * Reads a cookie value by name, or returns null if missing.
   *
   * @param {string} name
   *   The cookie name.
   * @return {string|null}
   *   The decoded cookie value or null.
   */
  const readCookie = (name) => {
    const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${escaped}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  /**
   * Writes a cookie with the given value, days until expiry, and path "/".
   *
   * @param {string} name
   *   The cookie name.
   * @param {string} value
   *   The cookie value (will be URL-encoded).
   * @param {number} days
   *   Days until the cookie expires.
   */
  const writeCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
  };

  Drupal.behaviors.sidebysideLayout = {
    attach(context) {
      once(
        'sidebysideLayout',
        '.js-sbs-layout-region-main',
        context,
      ).forEach((main) => {
        Drupal.cdCore.sidebyside(main);
      });
    },
  };

  Drupal.cdCore = Drupal.cdCore || {};

  Drupal.cdCore.sidebyside = (main) => {
    const options = {
      0: { label: Drupal.t('All'), option: 'all', active: null },
      1: { label: Drupal.t('Odd'), option: 'odd', active: 'show-odd' },
      2: { label: Drupal.t('Even'), option: 'even', active: 'show-even' },
    };

    const menu = document.createElement('div');
    menu.className = 'sbs-menu';
    main.parentNode.insertBefore(menu, main);

    let currentState;
    try {
      currentState = parseInt(readCookie('sbs'), 10) || 0;
    } catch (e) {
      currentState = 0;
    }

    const prefix = document.createElement('span');
    prefix.className = 'sbs-menu__prefix';
    prefix.textContent = Drupal.t('Columns shown:');
    menu.appendChild(prefix);

    Object.keys(options).forEach((key) => {
      const active = currentState === parseInt(key, 10);
      const item = document.createElement('a');
      item.className = `sbs-menu__item js-sbs-menu-item${active ? ' active' : ''}`;
      item.textContent = options[key].label;
      item.setAttribute('data-option', options[key].option);
      item.setAttribute('role', 'button');
      item.setAttribute('href', '#');
      item.dataset.sbsKey = key;
      if (options[key].active) {
        item.dataset.sbsClass = options[key].active;
      }
      menu.appendChild(item);

      if (active && options[key].active) {
        main.classList.add(options[key].active);
      }
    });

    const handleMenuInteraction = (event) => {
      const target = event.target.closest('.js-sbs-menu-item');
      if (!target) {
        return;
      }
      // Accept click events, or Enter / Space key events from keyboard users.
      const isActivation =
        event.type === 'click' ||
        (event.type === 'keyup' &&
          (event.key === 'Enter' || event.key === ' '));
      if (!isActivation) {
        return;
      }

      writeCookie('sbs', target.dataset.sbsKey, 91);

      menu.querySelectorAll('.js-sbs-menu-item').forEach((el) => {
        el.classList.remove('active');
      });
      target.classList.add('active');

      main.classList.remove('show-odd', 'show-even');
      if (target.dataset.sbsClass) {
        main.classList.add(target.dataset.sbsClass);
      }

      event.preventDefault();
    };

    menu.addEventListener('click', handleMenuInteraction);
    menu.addEventListener('keyup', handleMenuInteraction);
  };
})(Drupal, once);
