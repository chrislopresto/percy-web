import FactoryGuy from 'ember-data-factory-guy';
import moment from 'moment';
import faker from 'faker';

FactoryGuy.define('build', {
  sequences: {
    buildNumber: num => num,
  },
  default: {
    buildNumber: FactoryGuy.generate('buildNumber'),
    state: 'pending',
    branch: 'master',
    userAgent: () => faker.lorem.slug(10),
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
    commit: FactoryGuy.belongsTo('commit'),
    snapshots: FactoryGuy.hasMany('snapshot'),
  },
  traits: {
    withLongBranch: {branch: () => faker.lorem.slug(20)},
    withBaseBuild: {baseBuild: {baseBuild: FactoryGuy.belongsTo('build')}},
    withRepo: {repo: FactoryGuy.belongsTo('repo')},
    finished: {
      state: 'finished',
      finishedAt: () =>
        moment()
          .add(2, 'minutes')
          .add(31, 'seconds'),
      totalComparisonsDiff: 10,
      totalComparisonsFinished: 15,
      totalSnapshotsUnreviewed: 8,
    },
    pending: {state: 'pending'},
    processing: {state: 'processing'},
    failed: {state: 'failed'},
    expired: {state: 'expired'},
    noDiffs: {
      totalComparisonsDiff: 0,
      totalComparisonsFinished: 12,
    },
    missingResources: {failureReason: 'missing_resources'},
    noSnapshots: {failureReason: 'no_snapshots'},
    renderTimeout: {failureReason: 'render_timeout'},
    hasPullRequest: {
      isPullRequest: true,
      pullRequestNumber: 123,
      pullRequestTitle: () => faker.lorem.sentence(5),
    },
    hasPullRequestWithoutTitle: {
      isPullRequest: true,
      pullRequestNumber: 456,
    },

    // TODO: refactor these commit message customizations out of this build factory
    // https://github.com/percy/percy-web/pull/154#discussion_r129167477
    withLongHeadCommitMessage: {
      commit: FactoryGuy.belongsTo('commit', 'longMessage'),
    },
    withNoSpacesMessageCommitMessage: {
      commit: FactoryGuy.belongsTo('commit', 'noSpacesMessage'),
    },
  },
});
