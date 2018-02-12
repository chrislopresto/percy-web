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
import {getContext} from 'ember-test-helpers';

describe('Integration: SnapshotList', function() {
  setupComponentTest('snapshot-list', {
    integration: true,
  });

  beforeEach(function() {
    manualSetup(this.container);
    SnapshotListPageObject.setContext(this);
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

  it('does not load cached snapshot order when build is not yet finished', function() {
    const stub = sinon.stub();
    const build = make('build');
    const snapshots = makeList('snapshot', 4);
    let [snapshot1, snapshot2, snapshot3, snapshot4] = snapshots;

    const cacheService = getContext().container.lookup('service:cached-snapshot-order');
    // set cached snapshots in random order
    cacheService.setOrderedSnapshots([snapshot3, snapshot1, snapshot4, snapshot2]);

    this.setProperties({
      build,
      snapshots,
      stub,
    });
    this.render(hbs`{{snapshot-list
        snapshots=snapshots
        build=build
        createReview=stub
        updateActiveSnapshotId=stub
        snapshotWidthChangeTriggered=stub
        showSnapshotFullModalTriggered=stub
      }}`);

    const titles = SnapshotListPageObject.snapshotTitles;
    expect(titles[0]).to.equal(snapshot1.get('name'));
    expect(titles[1]).to.equal(snapshot2.get('name'));
    expect(titles[2]).to.equal(snapshot3.get('name'));
    expect(titles[3]).to.equal(snapshot4.get('name'));
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
