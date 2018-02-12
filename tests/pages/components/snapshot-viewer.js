import {create, hasClass, notHasClass} from 'ember-cli-page-object';
import {SnapshotViewerHeader} from 'percy-web/tests/pages/components/snapshot-viewer-header';
import {alias} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SNAPSHOT_VIEWER: '[data-test-snapshot-viewer]',
};

export const SnapshotViewer = {
  scope: SELECTORS.SNAPSHOT_VIEWER,

  header: SnapshotViewerHeader,
  widthSwitcher: alias('header.widthSwitcher'),
  titleText: alias('header.titleText'),
  isApproved: alias('header.isApproved'),
  isUnapproved: alias('header.isUnapproved'),

  isCollapsed: hasClass('SnapshotViewer--collapsed'),
  isExpanded: notHasClass('SnapshotViewer--collapsed'),
};

export default create(SnapshotViewer);
