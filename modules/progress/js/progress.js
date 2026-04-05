/**
 * @file
 * Progress indicator test markups for Progress test page.
 */

/* eslint-env es6:false, node:false */
/* eslint-disable strict, func-names, object-shorthand, no-var, prefer-template */
(function($, Drupal, once) {
  "use strict";

  Drupal.behaviors.progressThrobberTest = {
    attach: function(context) {
      $(once("progressThrobberTest", ".throbber-canvas, .throbber-message-canvas", context))
        .each(function() {
          $(this).append(
            Drupal.theme(
              "ajaxProgressThrobber",
              $(this).hasClass("throbber-message-canvas")
                ? Drupal.t("Please wait...")
                : null
            )
          );
        });
    }
  };

  Drupal.behaviors.progressProgressTest = {
    attach: function(context) {
      $(once("progressProgressTest", ".ajax-progress-canvas, .ajax-progress-small-canvas", context))
        .each(function() {
          var id = $(this)
            .uniqueId()
            .attr("id");
          var progressBar = new Drupal.ProgressBar(
            "progress-test-progress--" + id,
            $.noop,
            "replaceAll",
            $.noop
          );
          progressBar.setProgress(67, "Progress message", "Progress label");
          /* eslint-disable vars-on-top */
          var element =
            typeof Drupal.theme.ajaxProgressBar !== "undefined"
              ? $(Drupal.theme("ajaxProgressBar", progressBar.element))
              : $(progressBar.element).addClass(
                  "ajax-progress ajax-progress-bar"
                );
          /* eslint-enable vars-on-top */

          if ($(this).hasClass("ajax-progress-small-canvas")) {
            element.addClass("progress--small");
          }

          $(this).append(element);
        });
    }
  };

  Drupal.behaviors.progressFullscreenTest = {
    attach: function(context) {
      // Canvas does not matter visually, but we need a parent to append the
      // markup.
      $(once("progressFullscreenTest", ".fullscreen-canvas", context))
        .each(function() {
          $(this).append(Drupal.theme("ajaxProgressIndicatorFullscreen"));
        });
    }
  };
})(jQuery, Drupal, once);
/* eslint-enable strict, func-names, object-shorthand, no-var, prefer-template */
/* eslint-env es6:true, node:true */
