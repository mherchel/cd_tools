<?php

namespace Drupal\tab\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\filter\FilterFormatInterface;
use Drupal\filter\FilterFormatRepositoryInterface;

/**
 * Controller providing filter-tips render arrays for the tab test module.
 *
 * Replaces usages of the removed
 * \Drupal\filter\Controller\FilterController::filterTips() method.
 */
class TabController extends ControllerBase {

  /**
   * Displays tips for all filter formats accessible to the current user.
   *
   * @return array
   *   A render array.
   */
  public function overview(): array {
    return $this->buildTipsRenderArray(NULL);
  }

  /**
   * Displays tips for a single filter format.
   *
   * @param \Drupal\filter\FilterFormatInterface $filter_format
   *   The filter format.
   *
   * @return array
   *   A render array.
   */
  public function filterTips(FilterFormatInterface $filter_format): array {
    return $this->buildTipsRenderArray($filter_format);
  }

  /**
   * Builds a render array of filter tips, grouped by format label.
   *
   * @param \Drupal\filter\FilterFormatInterface|null $filter_format
   *   If provided, only tips for this format are returned. If NULL, all
   *   formats accessible to the current user are returned.
   *
   * @return array
   *   A render array keyed by format label, each item a filter_tips render.
   */
  protected function buildTipsRenderArray(?FilterFormatInterface $filter_format): array {
    if ($filter_format) {
      $formats = [$filter_format];
    }
    else {
      $formats = \Drupal::service(FilterFormatRepositoryInterface::class)
        ->getFormatsForAccount($this->currentUser());
    }

    $tips = [];
    foreach ($formats as $format) {
      foreach ($format->filters() as $name => $filter) {
        if ($filter->status) {
          $tip = $filter->tips(TRUE);
          if (isset($tip)) {
            $tips[$format->label()][$name] = [
              'tip' => ['#markup' => $tip],
              'id' => $name,
            ];
          }
        }
      }
    }

    $build = [];
    foreach ($tips as $label => $format_tips) {
      $build[$label] = [
        '#theme' => 'filter_tips',
        '#long' => TRUE,
        '#tips' => [$label => $format_tips],
      ];
    }
    return $build;
  }

}
