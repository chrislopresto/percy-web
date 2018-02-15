/* jshint expr:true */
import {setupComponentTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach, afterEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList, manualSetup} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {resolve} from 'rsvp';
import adminMode from 'percy-web/lib/admin-mode';
import FullSnapshotPage from 'percy-web/tests/pages/components/snapshot-viewer-full';

describe('Integration: SnapshotViewerFull', function() {
  setupComponentTest('snapshot-viewer-full', {
    integration: true,
  });

  let closeSnapshotFullModalStub;
  let updateComparisonModeStub;
  let createReviewStub;
  let addedSnapshot;
  const snapshotTitle = 'Awesome snapshot title';

  beforeEach(function() {
    manualSetup(this.container);
    FullSnapshotPage.setContext(this);

    const build = make('build');
    const snapshot = make('snapshot', 'withComparisons', {
      build,
      name: snapshotTitle,
    });

    addedSnapshot = make('snapshot', 'new', {build});

    closeSnapshotFullModalStub = sinon.stub();
    updateComparisonModeStub = sinon.stub();
    createReviewStub = sinon.stub().returns(resolve());

    const snapshotSelectedWidth = snapshot
      .get('comparisons')
      .sortBy('width')
      .objectAt(1)
      .get('width');

    this.setProperties({
      build,
      snapshotSelectedWidth,
      snapshotId: snapshot.get('id'),
      comparisonMode: 'diff',
      closeSnapshotFullModal: closeSnapshotFullModalStub,
      updateComparisonMode: updateComparisonModeStub,
      createReview: createReviewStub,
      stub: sinon.stub(),
    });

    this.render(hbs`{{snapshot-viewer-full
      snapshotId=snapshotId
      build=build
      snapshotSelectedWidth=snapshotSelectedWidth
      comparisonMode=comparisonMode
      transitionRouteToWidth=stub
      updateComparisonMode=updateComparisonMode
      closeSnapshotFullModal=closeSnapshotFullModal
      createReview=createReview
    }}`);
  });

  it('displays snapshot name', function() {
    expect(FullSnapshotPage.header.isTitleVisible, 'title should be visible').to.equal(true);

    expect(FullSnapshotPage.header.titleText, 'title text should be correct').to.equal(
      snapshotTitle,
    );
  });

  describe('comparison mode switcher', function() {
    it('displays comparison mode switcher', function() {
      expect(
        FullSnapshotPage.header.isComparisonModeSwitcherVisible,
        'comparison mode switcher should be visible',
      ).to.equal(true);
    });

    it('sends updateComparisonMode action when comparison switcher is clicked', function() {
      FullSnapshotPage.header.clickBaseComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('base');

      FullSnapshotPage.header.clickDiffComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('diff');

      FullSnapshotPage.header.clickHeadComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('head');
    });

    it('shows "New" button when snapshot is new', function() {
      this.set('snapshotId', addedSnapshot.get('id'));

      expect(FullSnapshotPage.isNewComparisonModeButtonVisible).to.equal(true);
      percySnapshot(this.test);
    });
  });

  describe('width switcher', function() {
    it('displays', function() {
      expect(
        FullSnapshotPage.header.isWidthSwitcherVisible,
        'width switcher should be visible',
      ).to.equal(true);
    });

    it('displays correct number as selected', function() {
      expect(FullSnapshotPage.header.widthSwitcher.buttons(0).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(1).isActive).to.equal(true);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(2).isActive).to.equal(false);
    });

    it('updates active button when clicked', function() {
      FullSnapshotPage.header.widthSwitcher.buttons(0).click();
      expect(FullSnapshotPage.header.widthSwitcher.buttons(0).isActive).to.equal(true);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(1).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(2).isActive).to.equal(false);

      FullSnapshotPage.header.widthSwitcher.buttons(2).click();
      expect(FullSnapshotPage.header.widthSwitcher.buttons(0).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(1).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(2).isActive).to.equal(true);

      FullSnapshotPage.header.widthSwitcher.buttons(1).click();
      expect(FullSnapshotPage.header.widthSwitcher.buttons(0).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(1).isActive).to.equal(true);
      expect(FullSnapshotPage.header.widthSwitcher.buttons(2).isActive).to.equal(false);
    });
  });

  it('compares visually to previous screenshot', function() {
    percySnapshot(this.test);
  });

  describe('full screen toggle button', function() {
    it('displays', function() {
      expect(FullSnapshotPage.header.isFullScreenToggleVisible).to.equal(true);
    });

    it('sends closeSnapshotFullModal when toggle fullscreen button is clicked', function() {
      FullSnapshotPage.header.clickToggleFullscreen();
      expect(closeSnapshotFullModalStub).to.have.been.calledWith(
        this.get('build.id'),
        this.get('snapshotId'),
      );
    });
  });
});

describe('Integration: SnapshotViewerFull with per snapshot approval', function() {
  setupComponentTest('snapshot-viewer-full', {
    integration: true,
  });

  let closeSnapshotFullModalStub;
  let updateComparisonModeStub;
  let createReviewStub;
  const snapshotTitle = 'Awesome snapshot title';

  beforeEach(function() {
    adminMode.setAdminMode();
  });
  afterEach(function() {
    adminMode.clear();
  });

  beforeEach(function() {
    manualSetup(this.container);
    FullSnapshotPage.setContext(this);

    const snapshots = makeList('snapshot', 5, 'withComparisons');
    snapshots[0].set('name', snapshotTitle);
    const build = make('build', 'finished');
    build.set('snapshots', snapshots);
    const snapshotSelectedWidth = snapshots[0]
      .get('comparisons')
      .sortBy('width')
      .get('lastObject.width');

    closeSnapshotFullModalStub = sinon.stub();
    updateComparisonModeStub = sinon.stub();
    createReviewStub = sinon.stub().returns(resolve());

    this.setProperties({
      build,
      snapshotSelectedWidth,
      snapshotId: build.get('snapshots.firstObject.id'),
      comparisonMode: 'diff',
      closeSnapshotFullModal: closeSnapshotFullModalStub,
      updateComparisonMode: updateComparisonModeStub,
      createReview: createReviewStub,
      stub: sinon.stub(),
    });

    this.render(hbs`{{snapshot-viewer-full
      snapshotId=snapshotId
      build=build
      snapshotSelectedWidth=snapshotSelectedWidth
      comparisonMode=comparisonMode
      transitionRouteToWidth=stub
      updateComparisonMode=updateComparisonMode
      closeSnapshotFullModal=closeSnapshotFullModal
      createReview=createReview
    }}`);
  });

  // TODO: move this test into main block when the feature ships for real
  describe('approve snapshot button', function() {
    it('sends createReview with correct arguments when approve button is clicked', function() {
      FullSnapshotPage.header.clickApprove();
      expect(createReviewStub).to.have.been.calledWith('approve', this.get('build'), [
        this.get('build.snapshots.firstObject'),
      ]);
    });

    it('does not display when build is not finished', function() {
      this.set('build.state', 'pending');
      expect(FullSnapshotPage.header.snapshotApprovalButton.isVisible).to.equal(false);
    });
  });
});
