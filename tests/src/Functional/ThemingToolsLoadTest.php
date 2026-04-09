<?php

namespace Drupal\Tests\theming_tools\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests that Theming Tools does not break Drupal.
 *
 * @group theming_tools
 */
class ThemingToolsLoadTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var string[]
   */
  public static $modules = [
    'theming_tools',
  ];

  /**
   * Tests that the project does not breaks Drupal.
   */
  public function testThemingToolsInstall() {
    // Test that front page loads.
    $url_front = Url::fromRoute('<front>');
    $this->drupalGet($url_front);
    $this->assertSession()->statusCodeEquals(200);
  }

}
