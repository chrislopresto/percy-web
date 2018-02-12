/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupComponentTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach, afterEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList, manualSetup} from 'ember-data-factory-guy';
import sinon from 'sinon';
import SnapshotViewerPO from 'percy-web/tests/pages/components/snapshot-viewer-full';
import {resolve} from 'rsvp';
import adminMode from 'percy-web/lib/admin-mode';

describe('Integration: SnapshotViewerFull', function() {
  setupComponentTest('snapshot-viewer-full', {
    integration: true,
  });

  let closeSnapshotFullModalStub;
  let updateComparisonModeStub;
  let createReviewStub;
  const snapshotTitle = 'Awesome snapshot title';
  const widthIndex = 1;
  // NOTE: these need to be the same as the widths in the snapshot factory
  const buildWidths = [375, 550, 1024];
  const snapshotSelectedWidth = buildWidths[widthIndex];

  beforeEach(function() {
    manualSetup(this.container);
    SnapshotViewerPO.setContext(this);

    const snapshots = makeList('snapshot', 5, 'withComparisons');
    snapshots[0].set('name', snapshotTitle);
    const build = make('build');
    build.set('snapshots', snapshots);

    closeSnapshotFullModalStub = sinon.stub();
    updateComparisonModeStub = sinon.stub();
    createReviewStub = sinon.stub().returns(resolve());

    this.setProperties({
      build,
      buildWidths,
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
      buildWidths=buildWidths
      snapshotSelectedWidth=snapshotSelectedWidth
      comparisonMode=comparisonMode
      transitionRouteToWidth=stub
      updateComparisonMode=updateComparisonMode
      closeSnapshotFullModal=closeSnapshotFullModal
      createReview=createReview
    }}`);
  });

  it('displays snapshot name', function() {
    expect(SnapshotViewerPO.header.isTitleVisible, 'title should be visible').to.equal(true);

    expect(SnapshotViewerPO.header.titleText, 'title text should be correct').to.equal(
      snapshotTitle,
    );
  });

  describe('comparison mode switcher', function() {
    it('displays comparison mode switcher', function() {
      expect(
        SnapshotViewerPO.header.isComparisonModeSwitcherVisible,
        'comparison mode switcher should be visible',
      ).to.equal(true);
    });

    it('sends updateComparisonMode action when comparison switcher is clicked', function() {
      SnapshotViewerPO.header.clickBaseComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('base');

      SnapshotViewerPO.header.clickDiffComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('diff');

      SnapshotViewerPO.header.clickHeadComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('head');
    });
  });

  describe('width switcher', function() {
    it('displays', function() {
      expect(
        SnapshotViewerPO.header.isWidthSwitcherVisible,
        'width switcher should be visible',
      ).to.equal(true);
    });

    it('has the right number of buttons', function() {
      expect(
        SnapshotViewerPO.header.widthSwitcher.buttons().count,
        'there should be correct number of buttons',
      ).to.equal(buildWidths.length);
    });

    it('displays the correct text on the buttons', function() {
      SnapshotViewerPO.header.widthSwitcher.buttons().forEach((button, i) => {
        expect(button.text, `button ${i} should contain correct width`).to.equal(
          `${buildWidths[i]}px`,
        );
      });
    });

    it('displays correct number as selected', function() {
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(0).isActive).to.equal(false);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(widthIndex).isActive).to.equal(true);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(2).isActive).to.equal(false);
    });

    it('updates active button when clicked', function() {
      SnapshotViewerPO.header.widthSwitcher.buttons(0).click();
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(0).isActive).to.equal(true);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(1).isActive).to.equal(false);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(2).isActive).to.equal(false);

      SnapshotViewerPO.header.widthSwitcher.buttons(2).click();
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(0).isActive).to.equal(false);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(1).isActive).to.equal(false);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(2).isActive).to.equal(true);

      SnapshotViewerPO.header.widthSwitcher.buttons(1).click();
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(0).isActive).to.equal(false);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(1).isActive).to.equal(true);
      expect(SnapshotViewerPO.header.widthSwitcher.buttons(2).isActive).to.equal(false);
    });
  });

  it('compares visually to previous screenshot', function() {
    percySnapshot(this.test);
  });

  describe('full screen toggle button', function() {
    it('displays', function() {
      expect(SnapshotViewerPO.header.isFullScreenToggleVisible).to.equal(true);
    });

    it('sends closeSnapshotFullModal when toggle fullscreen button is clicked', function() {
      SnapshotViewerPO.header.clickToggleFullscreen();
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
  const widthIndex = 1;
  // NOTE: these need to be the same as the widths in the snapshot factory
  const buildWidths = [375, 550, 1024];
  const snapshotSelectedWidth = buildWidths[widthIndex];

  beforeEach(function() {
    adminMode.setAdminMode();
  });
  afterEach(function() {
    adminMode.clear();
  });

  beforeEach(function() {
    manualSetup(this.container);
    SnapshotViewerPO.setContext(this);

    const snapshots = makeList('snapshot', 5, 'withComparisons');
    snapshots[0].set('name', snapshotTitle);
    const build = make('build');
    build.set('snapshots', snapshots);

    closeSnapshotFullModalStub = sinon.stub();
    updateComparisonModeStub = sinon.stub();
    createReviewStub = sinon.stub().returns(resolve());

    this.setProperties({
      build,
      buildWidths,
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
      buildWidths=buildWidths
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
      percySnapshot(this.test);
      SnapshotViewerPO.header.clickApprove();
      expect(createReviewStub).to.have.been.calledWith('approve', this.get('build'), [
        this.get('build.snapshots.firstObject'),
      ]);
    });
  });
});
