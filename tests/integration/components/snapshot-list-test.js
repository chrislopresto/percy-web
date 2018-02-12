/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupComponentTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList, manualSetup} from 'ember-data-factory-guy';
import sinon from 'sinon';
import SnapshotListPageObject from 'percy-web/tests/pages/components/snapshot-list';
import wait from 'ember-test-helpers/wait';

describe('Integration: SnapshotList', function() {
  setupComponentTest('snapshot-list', {
    integration: true,
  });

  const approvedSnapshotTitle = 'Approved snapshot!!';
  const unapprovedSnapshotTitle = 'Unapproved snapshot!!';
  let approvedSnapshot;
  let unapprovedSnapshot;

  beforeEach(function() {
    manualSetup(this.container);
    SnapshotListPageObject.setContext(this);

    const stub = sinon.stub();
    const build = make('build');

    unapprovedSnapshot = make('snapshot', 'withComparisons', {
      build,
      name: unapprovedSnapshotTitle,
    });
    approvedSnapshot = make('snapshot', 'approved', 'withComparisons', {
      build,
      name: approvedSnapshotTitle,
    });
    const snapshots = [approvedSnapshot, unapprovedSnapshot];

    this.setProperties({
      snapshots,
      build,
      stub,
    });
  });

  it('displays snapshots in the correct order, before and after approval', function() {
    this.render(hbs`{{snapshot-list
        snapshots=snapshots
        build=build
        createReview=stub
        updateActiveSnapshotId=stub
        snapshotWidthChangeTriggered=stub
        showSnapshotFullModalTriggered=stub
      }}`);

    const titlesBeforeApproval = SnapshotListPageObject.snapshotTitles;

    expect(titlesBeforeApproval[0]).to.equal(unapprovedSnapshotTitle);
    expect(titlesBeforeApproval[1]).to.equal(approvedSnapshotTitle);

    unapprovedSnapshot.set('isApproved', true);

    return wait().then(() => {
      const titlesAfterApproval = SnapshotListPageObject.snapshotTitles;
      expect(titlesAfterApproval).to.eql(titlesBeforeApproval);
    });
  });

  it('expands batched hidden snapshots', function() {
    const numSnapshots = 3;
    const snapshots = makeList('snapshot', numSnapshots, 'withNoDiffs');
    this.set('snapshots', snapshots);
    this.render(hbs`{{snapshot-list
      snapshots=snapshots
      hideNoDiffs=true
      build=build
      createReview=stub
      updateActiveSnapshotId=stub
      snapshotWidthChangeTriggered=stub
      showSnapshotFullModalTriggered=stub
    }}`);

    expect(SnapshotListPageObject.isNoDiffsBatchVisible).to.equal(true);

    SnapshotListPageObject.clickToggleNoDiffsSection();

    expect(SnapshotListPageObject.isNoDiffsBatchVisible).to.equal(false);
    expect(SnapshotListPageObject.snapshots().count).to.equal(numSnapshots);
  });
});
