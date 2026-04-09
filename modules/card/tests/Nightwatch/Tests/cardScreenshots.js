/**
 * @file
 * Captures Card component on system appearance page.
 */
module.exports = {
  "@tags": ["theming-tools"],
  before(browser) {
    if (browser.drupalInstall) {
      browser.drupalInstall({
        installProfile: "theming_tools"
      });
    }
  },
  after(browser) {
    if (browser.drupalUninstall) {
      browser.drupalUninstall().end();
    } else {
      browser.end();
    }
  },
  Card: function test(browser) {
    ["", "he"].forEach(langprefix => {
      browser
        .resizeWindow(1024, 600)
        .smartURL(
          langprefix ? `/${langprefix}/admin/appearance` : "/admin/appearance"
        )
        .savefullScreenShot("01", langprefix);
    });
  }
};
