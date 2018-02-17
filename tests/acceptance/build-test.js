import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import moment from 'moment';
import sinon from 'sinon';
import BuildPage from 'percy-web/tests/pages/build-page';
import {TEST_IMAGE_URLS} from 'percy-web/mirage/factories/screenshot';

describe('Acceptance: Pending Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'pending build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'pending',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as pending', function() {
    BuildPage.visitBuild(urlParams);
    andThen(() => {
      expect(currentPath()).to.equal('organization.project.builds.build.index');
    });
    percySnapshot(this.test.fullTitle() + ' on the build page');

    BuildPage.toggleBuildInfoDropdown();

    percySnapshot(this.test.fullTitle() + ' on the build page with build info open');
  });
});

describe('Acceptance: Processing Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'project-with-processing-build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'processing',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as processing', function() {
    BuildPage.visitBuild(urlParams);
    andThen(() => {
      expect(currentPath()).to.equal('organization.project.builds.build.index');
    });
    percySnapshot(this.test.fullTitle() + ' on the build page');

    BuildPage.toggleBuildInfoDropdown();

    percySnapshot(this.test.fullTitle() + ' on the build page with build info open');
  });
});

describe('Acceptance: Failed Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'project-with-failed-build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'failed',
      failureReason: 'render_timeout',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as failed', function() {
    BuildPage.visitBuild(urlParams);

    andThen(() => {
      expect(currentPath()).to.equal('organization.project.builds.build.index');
    });
    percySnapshot(this.test.fullTitle() + ' on the build page');

    BuildPage.toggleBuildInfoDropdown();

    percySnapshot(this.test.fullTitle() + ' on the build page with build info open');

    window.Intercom = sinon.stub();

    BuildPage.clickShowSupportLink();
    andThen(() => {
      expect(window.Intercom).to.have.been.calledWith('show');
    });
  });
});

describe('Acceptance: Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let project;
  let defaultSnapshot;
  let noDiffsSnapshot;
  let twoWidthsSnapshot;
  let urlParams;

  setupSession(function(server) {
    const organization = server.create('organization', 'withUser');
    project = server.create('project', {name: 'project-with-finished-build', organization});
    const build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      finishedAt: moment().subtract(5, 'seconds'),
    });

    defaultSnapshot = server.create('snapshot', 'withComparison', {build});
    noDiffsSnapshot = server.create('snapshot', 'noDiffs', {
      build,
      name: 'No Diffs snapshot',
    });
    twoWidthsSnapshot = server.create('snapshot', 'withComparison', 'withMobile', {
      build,
      name: 'Two widths snapshot',
    });
    // not used yet, but assign to variable when it's important
    server.create('snapshot', 'withMobile', {
      build,
      name: 'Mobile only snapshot',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  // TODO: test number of snapshots, expanded, actionable status for all
  it('shows build overview info dropdown', function() {
    BuildPage.visitBuild(urlParams);
    BuildPage.toggleBuildInfoDropdown();
    percySnapshot(this.test.fullTitle());
  });

  it('toggles the image and pdiff', function() {
    let snapshot;
    BuildPage.visitBuild(urlParams);

    andThen(() => {
      snapshot = BuildPage.findSnapshotByName(defaultSnapshot.name);
      expect(currentPath()).to.equal('organization.project.builds.build.index');
      expect(BuildPage.snapshots(0).isDiffImageVisible).to.equal(true);

      snapshot.clickDiffImage();
    });

    andThen(() => {
      expect(snapshot.isDiffImageVisible).to.equal(false);
    });

    percySnapshot(this.test.fullTitle() + ' | hides overlay');

    andThen(() => {
      snapshot.clickDiffImageBox();
    });

    andThen(() => {
      expect(snapshot.isDiffImageVisible).to.equal(true);
    });

    percySnapshot(this.test.fullTitle() + ' | shows overlay');
  });

  it('walk across snapshots with arrow keys', function() {
    let firstSnapshot;
    let secondSnapshot;
    let thirdSnapshot;
    const urlBase = `/${project.fullSlug}/builds/1`;

    BuildPage.visitBuild(urlParams);

    andThen(() => {
      firstSnapshot = BuildPage.snapshots(0);
      secondSnapshot = BuildPage.snapshots(1);
      thirdSnapshot = BuildPage.snapshots(2);

      expect(currentPath()).to.equal('organization.project.builds.build.index');
      expect(currentURL()).to.equal(urlBase);
    });

    BuildPage.typeDownArrow();
    percySnapshot(this.test.fullTitle() + ' | Down');

    andThen(() => {
      expect(BuildPage.focusedSnapshot().name).to.equal(defaultSnapshot.name);
      expect(firstSnapshot.isFocused).to.equal(true);
      expect(secondSnapshot.isFocused).to.equal(false);
      expect(thirdSnapshot.isFocused).to.equal(false);
    });

    BuildPage.typeDownArrow();
    percySnapshot(this.test.fullTitle() + ' | Down > Down');

    andThen(() => {
      expect(BuildPage.focusedSnapshot().name).to.equal(twoWidthsSnapshot.name);
      expect(firstSnapshot.isFocused).to.equal(false);
      expect(secondSnapshot.isFocused).to.equal(true);
      expect(thirdSnapshot.isFocused).to.equal(false);
    });

    BuildPage.typeUpArrow();
    percySnapshot(this.test.fullTitle() + ' | Down > Down > Up');

    andThen(() => {
      expect(BuildPage.focusedSnapshot().name).to.equal(defaultSnapshot.name);
      expect(firstSnapshot.isFocused).to.equal(true);
      expect(secondSnapshot.isFocused).to.equal(false);
      expect(thirdSnapshot.isFocused).to.equal(false);
    });
  });

  it('jumps to snapshot for query params', function() {
    BuildPage.visitBuild(Object.assign(urlParams, {snapshot: twoWidthsSnapshot.id}));

    andThen(() => {
      const focusedSnapshot = BuildPage.focusedSnapshot();

      expect(currentPath()).to.equal('organization.project.builds.build.index');
      expect(focusedSnapshot.isFocused).to.equal(true);
      expect(focusedSnapshot.name).to.equal(twoWidthsSnapshot.name);
    });

    percySnapshot(this.test.fullTitle());
  });

  it('jumps to snapshot for query params when snapshot has no diffs ', function() {
    BuildPage.visitBuild(Object.assign(urlParams, {snapshot: noDiffsSnapshot.id}));
    andThen(() => {
      const focusedSnapshot = BuildPage.focusedSnapshot();

      expect(focusedSnapshot.name).to.equal(noDiffsSnapshot.name);
      expect(focusedSnapshot.isExpanded).to.equal(true);
    });

    percySnapshot(this.test.fullTitle());
  });

  it('shows and hides unchanged diffs', function() {
    const snapshotName = noDiffsSnapshot.name;

    BuildPage.visitBuild(urlParams);

    andThen(() => {
      expect(BuildPage.isNoDiffsPanelVisible).to.equal(true);
      expect(BuildPage.findSnapshotByName(snapshotName)).to.not.exist;
    });

    percySnapshot(this.test.fullTitle() + ' | shows batched no diffs');

    BuildPage.clickToggleNoDiffsSection();
    andThen(() => {
      const snapshot = BuildPage.findSnapshotByName(snapshotName);

      expect(BuildPage.isNoDiffsPanelVisible).to.equal(false);
      expect(snapshot.isExpanded, 'three').to.equal(true);
      expect(snapshot.isNoDiffBoxVisible).to.equal(true);
    });

    percySnapshot(this.test.fullTitle() + ' | shows expanded no diffs');
  });

  it('toggles full view', function() {
    BuildPage.visitBuild(urlParams);
    BuildPage.snapshots(0).header.clickToggleFullscreen();

    andThen(() => {
      expect(currentPath()).to.equal('organization.project.builds.build.snapshot');
      expect(BuildPage.snapshotFullscreen.isVisible).to.equal(true);
    });

    BuildPage.snapshotFullscreen.header.clickToggleFullscreen();

    andThen(() => {
      expect(currentPath()).to.equal('organization.project.builds.build.index');
      expect(BuildPage.snapshotFullscreen.isVisible).to.equal(false);
    });
  });
});

describe('Acceptance: Fullscreen Snapshot', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let project;
  let snapshot;
  let urlParams;

  setupSession(function(server) {
    const organization = server.create('organization', 'withUser');
    project = server.create('project', {name: 'project-with-finished-build', organization});
    const build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      finishedAt: moment().subtract(5, 'seconds'),
    });
    snapshot = server.create('snapshot', 'withComparison', {build});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
      snapshotId: snapshot.id,
      width: snapshot.comparisons.models[0].width,
      mode: 'diff',
    };
  });

  it('responds to keystrokes and click in full view', function() {
    BuildPage.visitFullPageSnapshot(urlParams);

    BuildPage.snapshotFullscreen.typeRightArrow();

    andThen(() => {
      expect(currentURL()).to.include('mode=head');
    });

    BuildPage.snapshotFullscreen.typeLeftArrow();

    andThen(() => {
      expect(currentURL()).to.include('mode=diff');
    });

    BuildPage.snapshotFullscreen.clickComparisonViewer();
    andThen(() => {
      expect(currentURL()).to.include('mode=head');
    });

    BuildPage.snapshotFullscreen.typeEscape();
    andThen(() => {
      expect(currentPath()).to.equal('organization.project.builds.build.index');
      expect(BuildPage.snapshotFullscreen.isVisible).to.equal(false);
    });
  });

  it('toggles between old/diff/new comparisons when interacting with comparison mode switcher', function() { // eslint-disable-line
    BuildPage.visitFullPageSnapshot(urlParams);

    BuildPage.snapshotFullscreen.clickBaseComparisonMode();

    andThen(() => {
      expect(BuildPage.snapshotFullscreen.comparisonImageUrl).to.equal(TEST_IMAGE_URLS.V1);
    });

    BuildPage.snapshotFullscreen.clickHeadComparisonMode();

    andThen(() => {
      expect(BuildPage.snapshotFullscreen.comparisonImageUrl).to.equal(TEST_IMAGE_URLS.V2);
    });

    BuildPage.snapshotFullscreen.clickDiffComparisonMode();

    andThen(() => {
      expect(BuildPage.snapshotFullscreen.diffImageUrl).to.equal(TEST_IMAGE_URLS.DIFF_URL);
    });
  });
});
