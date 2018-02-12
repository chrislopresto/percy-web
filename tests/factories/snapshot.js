import FactoryGuy from 'ember-data-factory-guy';
import {make} from 'ember-data-factory-guy';
import {SNAPSHOT_APPROVED_STATE, SNAPSHOT_UNAPPROVED_STATE} from 'percy-web/models/snapshot';

FactoryGuy.define('snapshot', {
  default: {
    name: f => `Snapshot ${f.id}`,
    createdAt: () => new Date(),
    updatedAt: () => new Date(),

    comparisons: FactoryGuy.hasMany('comparison'),
    build: FactoryGuy.belongsTo('build'),
    // screenshots: FactoryGuy.belongsTo('screenshot')

    reviewState: SNAPSHOT_UNAPPROVED_STATE,
  },
  traits: {
    approved: {
      reviewState: SNAPSHOT_APPROVED_STATE,
    },

    withBuild: {
      build: () => {
        return make('build');
      },
    },
    withComparisons: {
      comparisons: () => {
        const widths = [375, 550, 1024];
        return widths.map(width => {
          return make('comparison', {width});
        });
      },
    },
    withNoDiffs: {
      comparisons: () => {
        const widths = [375, 550, 1024];
        return widths.map(width => {
          return make('comparison', {width, diffRatio: 0});
        });
      },
    },
    withScreenshots: {},
    completeExample: {},
  },
});
