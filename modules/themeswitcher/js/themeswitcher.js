/**
 * @file
 * Enhances Theme Switcher form by auto-submitting on select change.
 */

((Drupal, once) => {
  Drupal.behaviors.themeswitcherAutoSubmit = {
    attach(context) {
      once('themeswitcherAutoSubmit', '.js-themeswitcher-form', context).forEach((form) => {
        form.addEventListener('change', (event) => {
          if (event.target.matches('select')) {
            if (typeof form.requestSubmit === 'function') {
              form.requestSubmit();
            } else {
              form.submit();
            }
          }
        });
      });
    },
  };
})(Drupal, once);
