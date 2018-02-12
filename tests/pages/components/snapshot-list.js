import {create, collection, clickable, isVisible} from 'ember-cli-page-object';
import {SnapshotViewer} from 'percy-web/tests/pages/components/snapshot-viewer';

const SELECTORS = {
  SNAPSHOT_LIST: '[data-test-snapshot-list]',
  NO_DIFFS_TOGGLE: '[data-test-toggle-no-diffs]',
};

export const SnapshotList = {
  scope: SELECTORS.SNAPSHOT_LIST,

  snapshots: collection({
    itemScope: SnapshotViewer.scope,
    item: SnapshotViewer,
  }),

  snapshotTitles: {
    isDescriptor: true,
    get() {
      return this.snapshots().map(snapshot => snapshot.titleText);
    },
  },

  indexOfSnapshot(snapshot) {
    return this.snapshots.indexOf(snapshot);
  },

  approvedSnapshots() {
    return this.snapshots()
      .toArray()
      .filterBy('isApproved', true);
  },

  unapprovedSnapshots() {
    return this.snapshots()
      .toArray()
      .filterBy('isUnapproved', true);
  },

  isNoDiffsBatchVisible: isVisible(SELECTORS.NO_DIFFS_TOGGLE),
  clickToggleNoDiffsSection: clickable(SELECTORS.NO_DIFFS_TOGGLE),
};

export default create(SnapshotList);
