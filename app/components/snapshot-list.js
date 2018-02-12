import {next} from '@ember/runloop';
import {A} from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import $ from 'jquery';
import {computed} from '@ember/object';
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  classNames: ['SnapshotList'],
  attributeBindings: ['data-test-snapshot-list'],
  'data-test-snapshot-list': true,

  activeSnapshotId: null,
  buildContainerSelectedWidth: null,
  buildWidths: [],
  lastSnapshotIndex: null,
  selectedSnapshotIndex: -1,
  snapshotComponents: null,
  updateActiveSnapshotId: null,
  updateSelectedWidth: null,

  sortedSnapshots: computed('snapshots.[]', 'buildContainerSelectedWidth', function() {
    let snapshots = this.get('snapshots');
    let width = parseInt(this.get('buildContainerSelectedWidth'));

    function comparisonAtCurrentWidth(snapshot) {
      return snapshot.get('comparisons').findBy('width', width);
    }

    return snapshots.sort(function(a, b) {
      // Prioritize snapshots with diffs at any widths over snapshots with no diffs at any widths
      function maxDiffRatioAnyWidth(comparisons) {
        let comparisonWidths = comparisons.mapBy('smartDiffRatio').filter(x => x);
        return Math.max(0, ...comparisonWidths); // Provide minimum of one param to avoid -Infinity
      }

      let maxComparisonDiffA = maxDiffRatioAnyWidth(a.get('comparisons'));
      let maxComparisonDiffB = maxDiffRatioAnyWidth(b.get('comparisons'));
      if (maxComparisonDiffA > 0 && maxComparisonDiffB == 0) {
        // First snapshot has diffs, second doesn't at any widths
        return -1;
      } else if (maxComparisonDiffA == 0 && maxComparisonDiffB > 0) {
        // Second snapshot has diffs, first doesn't at any widths
        return 1;
      }

      // Next prioritize snapshots with comparisons at the current width
      let comparisonForA = comparisonAtCurrentWidth(a);
      let comparisonForB = comparisonAtCurrentWidth(b);
      if (comparisonForA && !comparisonForB) {
        // First snapshot has a comparison at the current width.
        return -1;
      } else if (!comparisonForA && comparisonForB) {
        // Second snapshot has a comparison at the current width.
        return 1;
      } else if (comparisonForA && comparisonForB) {
        // Both snapshots have a comparison for the current width, sort by diff percentage.
        return comparisonForB.get('smartDiffRatio') - comparisonForA.get('smartDiffRatio');
      }

      // Finally, sort by diff ratio across all widths.
      // Sorts descending.
      return maxComparisonDiffB + maxComparisonDiffA;
    });
  }),
  hideNoDiffs: computed('noDiffSnapshotsCount', function() {
    let noDiffsCount = this.get('noDiffSnapshotsCount');
    let activeSnapshotId = this.get('activeSnapshotId');
    let activeSnapshotIsNoDiff = this.get('snapshotsWithoutDiffs').findBy('id', activeSnapshotId);

    return noDiffsCount > 0 && activeSnapshotIsNoDiff === undefined;
  }),
  snapshotsWithDiffs: computed('sortedSnapshots', function() {
    return this.get('sortedSnapshots').filter(snapshot => {
      return snapshot.get('comparisons').isAny('isDifferent');
    });
  }),
  snapshotsWithoutDiffs: computed('snapshots', function() {
    return this.get('snapshots').filter(snapshot => {
      return snapshot.get('comparisons').isEvery('isSame');
    });
  }),
  noDiffSnapshotsCount: computed('snapshotsWithoutDiffs', function() {
    return this.get('snapshotsWithoutDiffs').reduce((total, snapshot) => {
      return total + snapshot.get('comparisons.length');
    }, 0);
  }),

  cachedSnapshotOrder: service(),
  computedSnapshots: computed(
    'build.isFinished',
    'hideNoDiffs',
    'snapshotsWithDiffs.@each.isApproved',
    'snapshotsWithoutDiffs.@each.isApproved',
    function() {
      if (
        this.get('build.isFinished') &&
        this.get('cachedSnapshotOrder').shouldUseCachedSnapshots()
      ) {
        return this.get('cachedSnapshotOrder').getOrderedSnapshots();
      }

      const snapshots = this.get('hideNoDiffs')
        ? this.get('snapshotsWithDiffs')
        : [].concat(this.get('snapshotsWithDiffs'), this.get('snapshotsWithoutDiffs'));
      const approvedSnapshots = [];
      const unapprovedSnapshots = [];
      snapshots.forEach(snapshot => {
        if (snapshot.get('isApproved')) {
          approvedSnapshots.push(snapshot);
        } else {
          unapprovedSnapshots.push(snapshot);
        }
      });

      const orderedSnapshots = [].concat(unapprovedSnapshots, approvedSnapshots);
      this.get('cachedSnapshotOrder').setOrderedSnapshots(orderedSnapshots);
      return orderedSnapshots;
    },
  ),
  isDefaultExpanded: computed('snapshotsWithDiffs', function() {
    return this.get('snapshotsWithDiffs.length') < 150;
  }),
  didInsertElement() {
    $(document).bind(
      'keydown.snapshots',
      function(e) {
        if (!this.get('isShowingModal')) {
          if (e.keyCode === 40) {
            // down arrow
            this.send('nextSnapshot');
          } else if (e.keyCode === 38) {
            // up arrow
            this.send('previousSnapshot');
          }
        }
      }.bind(this),
    );
  },
  willDestroyElement() {
    $(document).unbind('keydown.snapshots');
  },
  scrollToChild: function(component) {
    if (!component) {
      return;
    }
    $('.BuildContainer-body').animate({scrollTop: component.$().get(0).offsetTop}, 250);
  },
  actions: {
    registerChild(component) {
      if (!this.get('snapshotComponents')) {
        this.set('snapshotComponents', ArrayProxy.create({content: A()}));
      }
      this.get('snapshotComponents').pushObject(component);

      // While we are registering children components, notice if the current query parameter matches
      // and, if so, setup to scroll to that component after load.
      if (this.get('activeSnapshotId')) {
        let index = this.get('snapshotComponents.length') - 1;
        let addedSnapshotId = this.get('sortedSnapshots')
          .objectAt(index)
          .get('id');

        if (this.get('activeSnapshotId') === addedSnapshotId) {
          this.send('changeSelectedSnapshotIndex', () => index);

          // After the list is inserted and rendered, scroll to this child component.
          next(() => {
            this.scrollToChild(component);
          });
        }
      }
    },
    unregisterChild(component) {
      // Assume all components are being destroyed and we should reset the selection. TODO: improve.
      this.set('selectedSnapshotIndex', 0);
      this.get('snapshotComponents').removeObject(component);
    },
    selectChild(component) {
      this.send('changeSelectedSnapshotIndex', () => component.get('listIndex'));
    },
    nextSnapshot() {
      this.send('changeSelectedSnapshotIndex', lastIndex => lastIndex + 1);
      let lastIndex = this.get('selectedSnapshotIndex');

      next(() => {
        this.scrollToChild(this.get('snapshotComponents').objectAtContent([lastIndex]));
      });
    },
    previousSnapshot() {
      this.send('changeSelectedSnapshotIndex', lastIndex => lastIndex - 1);
      let lastIndex = this.get('selectedSnapshotIndex');

      next(() => {
        this.scrollToChild(this.get('snapshotComponents').objectAtContent([lastIndex]));
      });
    },
    changeSelectedSnapshotIndex(computeNextIndex) {
      let lastIndex = this.get('selectedSnapshotIndex');
      let newIndex = computeNextIndex(lastIndex);
      let computedSnapshotsLen = this.get('computedSnapshots.length');
      let newIndexWrapped = (newIndex + computedSnapshotsLen) % computedSnapshotsLen;
      this.set('lastSnapshotIndex', lastIndex);
      this.set('selectedSnapshotIndex', newIndexWrapped);
      this.send('updateSelectedSnapshot');
    },
    updateSelectedSnapshot() {
      let snapshotComponents = this.get('snapshotComponents');

      if (snapshotComponents.length == 0) {
        return;
      }

      let selectedIndex = this.get('selectedSnapshotIndex');
      let selectedComponent = snapshotComponents.objectAt(selectedIndex);
      let lastIndex = this.get('lastSnapshotIndex');

      this.get('updateActiveSnapshotId')(selectedComponent.get('snapshot.id'));

      // Expand the selected component.
      selectedComponent.get('setAsSelected').call(selectedComponent);

      // Grab the last component, if it exists, and different
      if (lastIndex !== -1 && lastIndex != selectedIndex) {
        let lastComponent = snapshotComponents.objectAt(lastIndex);
        lastComponent.set('isExpanded', this.get('isDefaultExpanded'));
        lastComponent.set('isFocus', false);
      }
    },
    toggleNoDiffSnapshots() {
      this.toggleProperty('hideNoDiffs');
      this.get('cachedSnapshotOrder').setHideNoDiffsChanged();
      window.scrollTo(0, 0);
    },
  },
});
