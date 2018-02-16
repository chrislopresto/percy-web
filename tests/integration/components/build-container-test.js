import {setupComponentTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList, manualSetup} from 'ember-data-factory-guy';
import sinon from 'sinon';
import BuildPage from 'percy-web/tests/pages/build-page';

describe('Integration: BuildContainer', function() {
  setupComponentTest('build-container', {
    integration: true,
  });

  beforeEach(function() {
    manualSetup(this.container);
    BuildPage.setContext(this);
  });

  it('does not display snapshots while build is processing', function() {
    const build = make('build', 'processing');
    const snapshots = makeList('snapshot', ['withComparisons', 'withNoDiffs'], {build});
    const stub = sinon.stub();
    // override the pollRefresh method for the test. This does not happen IRL, but we can't have
    // the component make requests in this integration test.
    const pollRefreshStub = sinon.stub();
    this.setProperties({build, snapshots, stub, pollRefreshStub});

    this.render(hbs`{{build-container
      build=build
      snapshots=snapshots
      createReview=stub
      pollRefresh=pollRefreshStub
    }}`);

    percySnapshot(this.test.fullTitle());
    expect(BuildPage.snapshotList.isVisible).to.equal(false);
  });

  it('displays snapshots when build is finished', function() {
    const build = make('build', 'finished');
    const diffSnapshot = make('snapshot', 'withComparisons', {build});
    const sameSnapshot = make('snapshot', 'withNoDiffs', {build});
    const stub = sinon.stub();
    this.setProperties({build, stub, snapshots: [sameSnapshot, diffSnapshot]});

    this.render(hbs`{{build-container
      build=build
      snapshots=snapshots
      createReview=stub
    }}`);
    percySnapshot(this.test.fullTitle());

    expect(BuildPage.snapshotList.isVisible).to.equal(true);
    expect(BuildPage.snapshotList.snapshots().count).to.equal(1);
    expect(BuildPage.snapshotList.isNoDiffsBatchVisible).to.equal(true);
  });
});
