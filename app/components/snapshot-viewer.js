import {not, alias, notEmpty, or, sort} from '@ember/object/computed';
import {computed} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  snapshot: null,
  classNames: ['SnapshotViewer mb-2'],
  classNameBindings: [
    'isFocus:SnapshotViewer--focus',
    'isExpanded::SnapshotViewer--collapsed',
    'isActionable:SnapshotViewer--actionable',
  ],
  attributeBindings: ['data-test-snapshot-viewer'],
  'data-test-snapshot-viewer': true,

  buildContainerSelectedWidth: null,
  registerChild() {},
  unregisterChild() {},
  selectChild() {},

  comparisons: alias('snapshot.comparisons'),
  comparisonsSortedByWidth: sort('comparisons', 'widthSort'),
  widthSort: ['width'],

  snapshotSelectedWidth: or('userSelectedWidth', 'defaultWidth'),
  userSelectedWidth: null,

  defaultWidth: computed('comparisons.@each.width', 'isExpanded', function() {
    let width = this.get('comparisonsSortedByWidth')
      .filterBy('isDifferent')
      .get('lastObject.width');

    if (!width) {
      width = this.get('comparisonsSortedByWidth').get('lastObject.width');
    }

    return width;
  }),

  selectedComparison: computed('comparisons.@each.width', 'snapshotSelectedWidth', function() {
    let width = this.get('snapshotSelectedWidth');
    let comparisons = this.get('comparisons') || [];
    let comparison = comparisons.findBy('width', parseInt(width, 10));

    if (!comparison) {
      comparison = this.get('comparisonsSortedByWidth').get('lastObject');
    }

    return comparison;
  }),

  isDefaultExpanded: true,
  isFocus: false,
  isExpanded: computed('isDefaultExpanded', 'snapshot.isApproved', 'build.isApproved', function() {
    if (this.get('build.isApproved')) {
      return true;
    } else if (this.get('snapshot.isApproved')) {
      return false;
    } else {
      return this.get('isDefaultExpanded');
    }
  }),
  isNotExpanded: not('isExpanded'),
  isActionable: alias('isNotExpanded'),

  comparisonForSelectedWidth: computed('snapshot.comparisons', 'snapshotSelectedWidth', function() {
    let comparisons = this.get('snapshot.comparisons') || [];
    return comparisons.findBy('width', this.get('snapshotSelectedWidth'));
  }),

  hasComparisonAtSelectedWidth: notEmpty('comparisonForSelectedWidth'),

  didInsertElement() {
    this._super(...arguments);
    this.send('registerChild', this);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.send('unregisterChild', this);
  },

  click() {
    this.send('selectChild');
  },

  setAsSelected() {
    this.set('showNoDiffSnapshot', true);
    this.set('isFocus', true);

    if (this.get('isNotExpanded')) {
      this.set('isExpanded', true);
    }
  },

  actions: {
    selectChild() {
      this.get('setAsSelected').call(this);
      this.get('selectChild')(this);
    },

    registerChild() {
      this.get('registerChild')(this);
    },

    unregisterChild() {
      this.get('unregisterChild')(this);
    },

    updateSelectedWidth(value) {
      this.set('userSelectedWidth', value);
    },
  },
});
