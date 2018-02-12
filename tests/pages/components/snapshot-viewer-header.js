import {create, clickable, isVisible, hasClass, text, collection} from 'ember-cli-page-object';
import {SnapshotApprovalButton} from 'percy-web/tests/pages/components/snapshot-approval-button';
import {alias} from 'ember-cli-page-object/macros';

const SELECTORS = {
  HEADER: '[data-test-SnapshotViewer-header]',
  COMPARISON_ICON: '[data-test-SnapshotViewer-comparisonIcon]',
  TITLE: '[data-test-SnapshotViewer-title]',
  WIDTH_SWITCHER: '[data-test-SnapshotViewer-widthSwitcher]',
  WIDTH_SWITCHER_BUTTON: '[data-test-ComparisonSwitcher-button]',
  FULL_SCREEN_TOGGLE: '[data-test-SnapshotViewer-toggleFullScreen]',
  COMPARISON_MODE_SWITCHER: '[data-test-SnapshotViewer-comparison-mode-switcher]',
  COMPARISON_MODE_SWITCHER_BASE: '[data-test-ComparisonModeSwitcher-base]',
  COMPARISON_MODE_SWITCHER_DIFF: '[data-test-ComparisonModeSwitcher-diff]',
  COMPARISON_MODE_SWITCHER_HEAD: '[data-test-ComparisonModeSwitcher-head]',
  DROPDOWN_TOGGLE: '[data-test-snapshot-header-dropdown-toggle]',
  DROPDOWN_PANE: '[data-test-snapshot-header-dropdown-pane]',
  DROPDOWN_TOGGLE_WIDTHS_OPTION: '[data-test-toggle-widths-option]',
};

export const SnapshotViewerHeader = {
  scope: SELECTORS.HEADER,
  isTitleVisible: isVisible(SELECTORS.TITLE),
  titleText: text(SELECTORS.TITLE),

  isComparisonModeSwitcherVisible: isVisible(SELECTORS.COMPARISON_MODE_SWITCHER),

  isWidthSwitcherVisible: isVisible(SELECTORS.WIDTH_SWITCHER),

  widthSwitcher: {
    scope: SELECTORS.WIDTH_SWITCHER,
    buttons: collection({
      itemScope: SELECTORS.WIDTH_SWITCHER_BUTTON,
      item: {
        isActive: hasClass('is-active'),
        text: text(),
      },
    }),
  },

  isFullScreenToggleVisible: isVisible(SELECTORS.FULL_SCREEN_TOGGLE),
  clickToggleFullscreen: clickable(SELECTORS.FULL_SCREEN_TOGGLE),

  clickBaseComparisonMode: clickable(SELECTORS.COMPARISON_MODE_SWITCHER_BASE),
  clickDiffComparisonMode: clickable(SELECTORS.COMPARISON_MODE_SWITCHER_DIFF),
  clickHeadComparisonMode: clickable(SELECTORS.COMPARISON_MODE_SWITCHER_HEAD),

  clickDropdownToggle: clickable(SELECTORS.DROPDOWN_TOGGLE),
  isDropdownToggleVisible: isVisible(SELECTORS.DROPDOWN_TOGGLE),
  isDropdownPaneVisible: isVisible(SELECTORS.DROPDOWN_PANE),
  dropdownOptions: collection({
    itemScope: SELECTORS.DROPDOWN_PANE,
    item: {
      scope: 'li',
      text: text(),
    },
  }),
  isToggleWidthsOptionVisible: isVisible(SELECTORS.DROPDOWN_TOGGLE_WIDTHS_OPTION),
  clickToggleAllWidths: clickable(SELECTORS.DROPDOWN_TOGGLE_WIDTHS_OPTION),

  snapshotApprovalButton: SnapshotApprovalButton,
  clickApprove: alias('snapshotApprovalButton.clickButton'),
  isApproved: alias('snapshotApprovalButton.isApproved'),
  isUnapproved: alias('snapshotApprovalButton.isUnapproved'),
};

export default create(SnapshotViewerHeader);
