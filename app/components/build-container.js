import {alias, and, not, or} from '@ember/object/computed';
import Component from '@ember/component';
import PollingMixin from 'percy-web/mixins/polling';

export default Component.extend(PollingMixin, {
  build: null,
  activeSnapshotId: null,
  classNames: ['BuildContainer'],
  classNameBindings: [
    'classes',
    'isShowingModal:BuildContainer--snapshotModalOpen:BuildContainer--snapshotModalClosed',
  ],

  currentPosition: null,

  isSnapshotsPending: alias('snapshots.isPending'),
  isSnapshotsFinished: not('isSnapshotsPending'),
  showSnapshots: and('build.isRunning', 'isSnapshotsFinished'),
  shouldPollForUpdates: or('build.isPending', 'build.isProcessing'),

  pollRefresh() {
    this.get('build')
      .reload()
      .then(build => {
        build.get('snapshots').reload();
      });
  },

  actions: {
    showSnapshotFullModalTriggered(snapshotId, snapshotSelectedWidth) {
      this.sendAction('openSnapshotFullModal', snapshotId, snapshotSelectedWidth);
    },

    showSupport() {
      this.sendAction('showSupport');
    },
  },
});
