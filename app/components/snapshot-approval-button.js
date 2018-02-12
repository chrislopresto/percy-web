import {alias} from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  isApproved: alias('snapshot.isApproved'),
  isLoading: false,
  tagName: '',

  actions: {
    approveSnapshot() {
      this.set('isLoading', true);
      this.createReview([this.get('snapshot')]).finally(() => {
        this.set('isLoading', false);
      });
    },
  },
});
