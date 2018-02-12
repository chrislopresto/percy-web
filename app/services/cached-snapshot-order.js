import Service from '@ember/service';

// This service is an ok solution for keeping snapshots in the same order during one page view,
// even if the snapshot's approval state changes.
// Without this in place, when a snapshot is approved, it will send an api request to create a new
// review object. The request will return, and this will cause all computed properties involving
// snapshots to re-run.
// This service caches the order of the snapshots on initial page-load, so that initially unreviewed
// snapshots will be displayed at the top, initially approved snapshots will all be at the bottom,
// and as the user interacts with the page, the snapshots do not jump when they are approved.

// The `hasHideNoDiffsChanged` property is important because when there are snapshots with no diffs
// batched at the bottom of the build page, and a user expands it, we need to recalculate the order
// of the snapshots to _include_ these snapshots. If this property was not present, the snapshots
// batched within the no-diffs section would not display when the user clicks "show snapshots
// with no diffs".

// Also important is resetting the caching when transitioning to a new build, so the correct
// snapshots are displayed for the current build.

export default Service.extend({
  _orderedSnapshots: null,
  _hasHideNoDiffsChanged: false,

  shouldUseCachedSnapshots() {
    return this.get('_orderedSnapshots') && !this.get('_hasHideNoDiffsChanged');
  },

  getOrderedSnapshots() {
    return this.get('_orderedSnapshots');
  },

  setOrderedSnapshots(snapshots) {
    this.set('_orderedSnapshots', snapshots);
  },

  setHideNoDiffsChanged() {
    this.set('_hasHideNoDiffsChanged', true);
  },

  resetCachedSnapshotOrder() {
    this.setProperties({
      _orderedSnapshots: null,
      _hasHideNoDiffsChanged: false,
    });
  },
});
