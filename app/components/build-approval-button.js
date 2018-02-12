import {alias} from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  build: null,
  approve: null,
  isApproved: alias('build.isApproved'),
  isLoading: false,
  tagName: 'button',
  classNames: ['build-approval-button btn btn-md btn-success ml-2 px-2 pl-7 flex align-center'],
  classNameBindings: ['classes', 'isLoading:is-loading', 'isApproved:is-approved'],
  attributeBindings: ['data-test-build-approval-button'],
  'data-test-build-approval-button': true,

  click() {
    this.set('isLoading', true);
    const snapshots = this.get('build.snapshots');

    this.createReview('approve', this.get('build'), snapshots)
      .then(() => {
        return this.get('build').reloadAll();
      })
      .finally(() => {
        this.set('isLoading', false);
      });
  },
});
