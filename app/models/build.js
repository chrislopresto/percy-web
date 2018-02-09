import {computed} from '@ember/object';
import {bool, and, equal, not} from '@ember/object/computed';
import DS from 'ember-data';
import moment from 'moment';

const PENDING_LABEL = 'Receiving';
const PROCESSING_LABEL = 'Processing';
const UNREVIEWED_LABEL = 'Unreviewed';
const APPROVED_LABEL = 'Approved';
const FAILED_LABEL = 'Failed';
const EXPIRED_LABEL = 'Expired';

export default DS.Model.extend({
  project: DS.belongsTo('project', {async: false}),
  repo: DS.belongsTo('repo', {async: false}),

  // Check isGithubLinked before accessing repo.
  isGithubLinked: bool('repo'),

  isGithubPullRequest: and('isGithubLinked', 'isPullRequest'),

  buildNumber: DS.attr('number'),
  buildTitle: computed('buildNumber', function() {
    return `Build #${this.get('buildNumber')}`;
  }),
  branch: DS.attr(),

  // Processing state.
  state: DS.attr(),
  isPending: equal('state', 'pending'),
  isProcessing: equal('state', 'processing'),
  isFinished: equal('state', 'finished'),
  isFailed: equal('state', 'failed'),
  isExpired: equal('state', 'expired'),
  failureReason: DS.attr(),
  failureReasonHumanized: computed('failureReason', function() {
    let failureReason = this.get('failureReason');
    if (failureReason === 'missing_resources') {
      return 'Missing resources';
    } else if (failureReason === 'no_snapshots') {
      return 'No snapshots';
    } else if (failureReason === 'render_timeout') {
      return 'Timed out';
    }
  }),

  // Review state, aggregated across all reviews. This will only be set for finished builds.
  reviewState: DS.attr(),
  isUnreviewed: equal('reviewState', 'unreviewed'),
  isApproved: equal('reviewState', 'approved'),

  // reviewStateReason provides disambiguation for how reviewState was set, such as when a
  // build was approved automatically by the system when there are no diffs vs. when it is
  // approved by user review.
  //
  // reviewState --> reviewStateReason
  // - 'unreviewed' --> 'unreviewed_snapshots': Not all snapshots have been reviewed.
  // - 'approved' --> 'all_snapshots_approved': All snapshots were approved by user review.
  // - 'approved' --> 'all_snapshots_approved_previously': All snapshots were automatically approved
  //   because a user had previously approved the same snapshots in this branch.
  // - 'approved' --> 'no_diffs': All snapshots were automatically approved because there were no
  //    visual differences when compared with the baseline.
  reviewStateReason: DS.attr(),

  // Aggregate numbers for snapshots and comparisons. These will only be set for finished builds.
  // Each snapshot is a top-level UI state that may encompass multiple comparisons.
  // Each comparison represents a single individual rendering at a width and browser.
  totalSnapshots: DS.attr('number'),
  totalSnapshotsUnreviewed: DS.attr('number'),
  totalComparisonsFinished: DS.attr('number'),
  totalComparisonsDiff: DS.attr('number'),
  hasDiffs: computed('totalComparisonsDiff', function() {
    // Only have the chance to return true if the build is finished.
    if (!this.get('isFinished')) {
      return false;
    }
    return this.get('totalComparisonsDiff') > 0;
  }),

  buildStatusLabel: computed('state', 'reviewState', function() {
    if (this.get('isPending')) {
      return PENDING_LABEL;
    } else if (this.get('isProcessing')) {
      return PROCESSING_LABEL;
    } else if (this.get('isFinished')) {
      if (this.get('isApproved')) {
        return APPROVED_LABEL;
      } else if (this.get('isUnreviewed')) {
        return UNREVIEWED_LABEL;
      }
    } else if (this.get('isFailed')) {
      return FAILED_LABEL;
    } else if (this.get('isExpired')) {
      return EXPIRED_LABEL;
    }
  }),

  commit: DS.belongsTo('commit', {async: false}), // Might be null.
  baseBuild: DS.belongsTo('build', {async: false, inverse: null}),
  comparisons: DS.hasMany('comparison', {async: true}),

  snapshots: computed('comparisons', function() {
    let comparisons = this.get('comparisons');
    let snapshots = comparisons.map(comparison => comparison.get('headSnapshot')).filter(x => x);
    return [...new Set(snapshots)];
  }),

  hasNoDiffs: not('hasDiffs'),
  isPullRequest: DS.attr('boolean'),
  pullRequestNumber: DS.attr('number'),
  pullRequestTitle: DS.attr(),

  finishedAt: DS.attr('date'),
  approvedAt: DS.attr('date'),
  approvedBy: DS.belongsTo('user', {async: false}),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  userAgent: DS.attr(),

  duration: computed('finishedAt', 'createdAt', function() {
    var finished = this.get('finishedAt');
    if (!finished) {
      finished = moment();
    }
    var started = this.get('createdAt');
    var milliseconds = moment(finished).diff(started);
    return moment.duration(milliseconds);
  }),

  // Convenience methods for accessing common methods in templates.
  durationHours: computed('duration', function() {
    return this.get('duration').hours();
  }),
  durationMinutes: computed('duration', function() {
    return this.get('duration').minutes();
  }),
  durationSeconds: computed('duration', function() {
    return this.get('duration').seconds();
  }),

  reloadAll() {
    return this.store.findRecord('build', this.get('id'), {reload: true});
  },
});
