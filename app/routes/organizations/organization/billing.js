import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  // Important: this model loads extra includes, so it requires that we're always using .slug when
  // using link-to into this route so that the model hook always fires. :( Ember 3!
  model() {
    let organization = this.modelFor('organizations.organization');
    let includes = 'subscription.current-usage-stats';
    return this.store.findRecord('organization', organization.id, {include: includes});
  },
  actions: {
    didTransition() {
      this._super.apply(this, arguments);
      let organization = this.modelFor('organizations.organization');
      this.analytics.track('Billing Viewed', organization);
    },
  },
});
