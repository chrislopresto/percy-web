import {create, isVisible, clickable, hasClass, notHasClass} from 'ember-cli-page-object';
import {SnapshotViewerHeader} from 'percy-web/tests/pages/components/snapshot-viewer-header';
import {alias} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SNAPSHOT_VIEWER: '[data-test-snapshot-viewer]',
  DIFF_IMAGE: '[data-test-comparison-viewer-full-diff-image-overlay] img',
  DIFF_IMAGE_BOX: '[data-test-comparison-viewer-diff-image-container] img',
  NO_DIFF_BOX: '[data-test-comparison-viewer-unchanged]',
};

export const SnapshotViewer = {
  scope: SELECTORS.SNAPSHOT_VIEWER,

  header: SnapshotViewerHeader,
  widthSwitcher: alias('header.widthSwitcher'),
  name: alias('header.titleText'),

  isApproved: alias('header.isApproved'),
  isUnapproved: alias('header.isUnapproved'),

  isCollapsed: hasClass('SnapshotViewer--collapsed'),
  isExpanded: notHasClass('SnapshotViewer--collapsed'),

  isDiffImageVisible: isVisible(SELECTORS.DIFF_IMAGE),
  clickDiffImage: clickable(SELECTORS.DIFF_IMAGE),

  isDiffImageBoxVisible: isVisible(SELECTORS.DIFF_IMAGE_BOX),
  clickDiffImageBox: clickable(SELECTORS.DIFF_IMAGE_BOX),

  isNoDiffBoxVisible: isVisible(SELECTORS.NO_DIFF_BOX),

  isFocused: hasClass('SnapshotViewer--focus'),

  isActionable: hasClass('SnapshotViewer--actionable'),
};

export default create(SnapshotViewer);
