/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupComponentTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList, manualSetup} from 'ember-data-factory-guy';
import sinon from 'sinon';
import SnapshotList from 'percy-web/tests/pages/components/snapshot-list';
import wait from 'ember-test-helpers/wait';
import {getContext} from 'ember-test-helpers';

describe('Integration: SnapshotList', function() {
  setupComponentTest('snapshot-list', {
    integration: true,
  });

  beforeEach(function() {
    manualSetup(this.container);
    SnapshotList.setContext(this);
  });

  it('displays snapshots in the correct order, before and after approval when build is finished', function() { // eslint-disable-line
    const approvedSnapshotTitle = 'Approved snapshot!!';
    const unapprovedSnapshotTitle = 'Unapproved snapshot!!';
    const stub = sinon.stub();
    const build = make('build', 'finished');

    const unapprovedSnapshot = make('snapshot', 'withComparisons', {
      build,
      name: unapprovedSnapshotTitle,
    });
    const approvedSnapshot = make('snapshot', 'approved', 'withComparisons', {
      build,
      name: approvedSnapshotTitle,
    });
    const snapshots = [approvedSnapshot, unapprovedSnapshot];
    this.setProperties({
      snapshots,
      build,
      stub,
    });

    this.render(hbs`{{snapshot-list
        snapshots=snapshots
        build=build
        createReview=stub
        showSnapshotFullModalTriggered=stub
      }}`);

    const titlesBeforeApproval = SnapshotList.snapshotTitles;

    expect(titlesBeforeApproval[0]).to.equal(unapprovedSnapshotTitle);
    expect(titlesBeforeApproval[1]).to.equal(approvedSnapshotTitle);

    unapprovedSnapshot.set('isApproved', true);
    return wait().then(() => {
      const titlesAfterApproval = SnapshotList.snapshotTitles;
      expect(titlesAfterApproval).to.eql(titlesBeforeApproval);
    });
  });

  it('does not render any snapshots when build is not finished', function() {
    const stub = sinon.stub();
    const build = make('build');
    const snapshots = makeList('snapshot', 2);

    const cacheService = getContext().container.lookup('service:cached-snapshot-order');

    this.setProperties({
      build,
      snapshots,
      stub,
    });
    this.render(hbs`{{snapshot-list
        snapshots=snapshots
        build=build
        createReview=stub
        showSnapshotFullModalTriggered=stub
      }}`);

    expect(SnapshotList.snapshots().count).to.equal(0);
    expect(cacheService.getOrderedSnapshots()).to.equal(null);
  });

  it('expands batched hidden snapshots', function() {
    const stub = sinon.stub();
    const build = make('build', 'finished');

    const numSnapshots = 3;
    const snapshots = makeList('snapshot', numSnapshots, 'withNoDiffs');
    this.set('snapshots', snapshots);

    this.setProperties({
      snapshots,
      build,
      stub,
    });

    this.render(hbs`{{snapshot-list
      snapshots=snapshots
      hideNoDiffs=true
      build=build
      createReview=stub
      showSnapshotFullModalTriggered=stub
    }}`);

    expect(SnapshotList.isNoDiffsBatchVisible).to.equal(true);

    SnapshotList.clickToggleNoDiffsSection();

    expect(SnapshotList.isNoDiffsBatchVisible).to.equal(false);
    expect(SnapshotList.snapshots().count).to.equal(numSnapshots);
  });
});
