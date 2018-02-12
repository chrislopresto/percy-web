import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  cachedSnapshotOrder: service(),
  queryParams: {
    activeSnapshotId: {as: 'snapshot', replace: true},
  },
  afterModel(model) {
    model.reload().then(model => {
      if (!model.get('isExpired')) {
        // Force reload because these async-hasMany's won't reload themselves if the build's
        // state has changed, such as going from processing --> finished and we don't want to show
        // fewer comparisons than there are.
        model.get('comparisons').reload();
      }
    });
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      // Clear the query parameter when exiting the route.
      controller.set('activeSnapshotId', undefined);
      // Clear cached snapshot order between route transitions.
      this.get('cachedSnapshotOrder').resetCachedSnapshotOrder();
    }
  },
  actions: {
    didTransition() {
      this._super.apply(this, arguments);

      let build = this.modelFor(this.routeName);
      let organization = build.get('project.organization');
      let eventProperties = {
        project_id: build.get('project.id'),
        project_slug: build.get('project.slug'),
        build_id: build.get('id'),
        state: build.get('state'),
      };
      this.analytics.track('Build Viewed', organization, eventProperties);
    },
    updateActiveSnapshotId(snapshotId) {
      this.set('controller.activeSnapshotId', snapshotId);
    },
    updateModalState(state) {
      this.get('currentModel').set('isShowingModal', state);
    },
    openSnapshotFullModal(snapshotId, snapshotSelectedWidth) {
      let build = this.modelFor(this.routeName);
      let organization = build.get('project.organization');
      let eventProperties = {
        project_id: build.get('project.id'),
        project_slug: build.get('project.slug'),
        build_id: build.get('id'),
        snapshot_id: snapshotId,
      };
      this.analytics.track('Snapshot Fullscreen Selected', organization, eventProperties);

      this.send('updateModalState', true);
      this.transitionTo(
        'organization.project.builds.build.snapshot',
        snapshotId,
        snapshotSelectedWidth,
        {
          queryParams: {mode: 'diff'},
        },
      );
    },
    closeSnapshotFullModal(buildId, snapshotId) {
      this.send('updateModalState', false);
      this.transitionTo('organization.project.builds.build', buildId, {
        queryParams: {activeSnapshotId: snapshotId},
      });
    },

    createReview(action, build, snapshots) {
      const review = this.get('store').createRecord('review', {
        build: build,
        snapshots: snapshots,
      });
      return review.save().then(() => {
        const build = this.modelFor(this.routeName);
        build.get('comparisons').reload();
        build.reload();
      });
    },
  },
});
