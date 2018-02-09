import {next} from '@ember/runloop';
import {A} from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import $ from 'jquery';
import {computed} from '@ember/object';
import Component from '@ember/component';
import snapshotSort from 'percy-web/lib/snapshot-sort';

export default Component.extend({
  classNames: ['SnapshotList'],

  activeSnapshotId: null,
  buildContainerSelectedWidth: null,
  lastSnapshotIndex: null,
  selectedSnapshotIndex: -1,
  snapshotComponents: null,
  updateActiveSnapshotId: null,

  sortedSnapshots: computed('snapshots.[]', 'buildContainerSelectedWidth', function() {
    return snapshotSort(this.get('snapshots'));
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
  computedSnapshots: computed(
    'hideNoDiffs',
    'snapshotsWithDiffs.[]',
    'snapshotsWithoutDiffs.[]',
    function() {
      if (this.get('hideNoDiffs')) {
        return this.get('snapshotsWithDiffs');
      } else {
        return [].concat(this.get('snapshotsWithDiffs'), this.get('snapshotsWithoutDiffs'));
      }
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
      window.scrollTo(0, 0);
    },
  },
});
