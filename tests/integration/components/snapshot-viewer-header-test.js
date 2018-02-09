/* jshint expr:true */
import {setupComponentTest} from 'ember-mocha';
import {beforeEach, it, describe} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, manualSetup} from 'ember-data-factory-guy';
import SnapshotViewerHeaderPO from 'percy-web/tests/pages/components/snapshot-viewer-header';
import sinon from 'sinon';

describe('Integration: SnapshotViewerHeader', function() {
  setupComponentTest('snapshot-viewer-header', {
    integration: true,
  });

  beforeEach(function() {
    manualSetup(this.container);
    SnapshotViewerHeaderPO.setContext(this);
  });

  describe('dropdown', function() {
    beforeEach(function() {
      this.set('stub', sinon.stub());

      this.render(hbs`{{snapshot-viewer-header
        toggleViewMode=stub
        updateSelectedWidth=stub
      }}`);
    });

    it('shows dropdown toggle', function() {
      expect(SnapshotViewerHeaderPO.isDropdownToggleVisible).to.equal(true);
    });

    it('toggles dropdown pane when dropdown toggle is clicked', function() {
      expect(SnapshotViewerHeaderPO.isDropdownPaneVisible).to.equal(false);
      SnapshotViewerHeaderPO.clickDropdownToggle();
      expect(SnapshotViewerHeaderPO.isDropdownPaneVisible).to.equal(true);
      SnapshotViewerHeaderPO.clickDropdownToggle();
      expect(SnapshotViewerHeaderPO.isDropdownPaneVisible).to.equal(false);
    });

    it('shows copy url option', function() {
      SnapshotViewerHeaderPO.clickDropdownToggle();
      expect(SnapshotViewerHeaderPO.dropdownOptions(0).text).to.equal('Copy snapshot URL');
      percySnapshot(this.test);
    });
  });

  describe('comparison width switcher', function() {
    describe('When all comparisons for a snapshot have diffs', function() {
      beforeEach(function() {
        const snapshot = make('snapshot', 'withComparisons');
        this.set('stub', sinon.stub());
        this.set('snapshot', snapshot);
        this.render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
        }}`);
      });

      it('displays all comparison widths', function() {
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons().count).to.equal(
          this.get('snapshot.comparisons.length'),
        );
      });

      it('displays correct text on the buttons', function() {
        SnapshotViewerHeaderPO.widthSwitcher.buttons().forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${this.get('snapshot.comparisons').toArray()[i].get('width')}px` // eslint-disable-line
          );
        });
      });

      it('does not display toggle widths option in dropdown', function() {
        SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.isToggleWidthsOptionVisible).to.equal(false);
      });
    });

    describe('When some comparisons for a snapshot have diffs', function() {
      let comparisonsWithDiffs;

      beforeEach(function() {
        const snapshot = make('snapshot', 'withComparisons');
        snapshot.get('comparisons.firstObject').set('diffRatio', 0);

        comparisonsWithDiffs = snapshot.get('comparisons').filterBy('isDifferent');

        this.set('stub', sinon.stub());
        this.set('snapshot', snapshot);
        this.render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
        }}`);
      });

      it('displays only widths with diffs', function() {
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons().count).to.equal(2);
      });

      it('displays correct text on the buttons', function() {
        SnapshotViewerHeaderPO.widthSwitcher.buttons().forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${comparisonsWithDiffs.toArray()[i].get('width')}px` // eslint-disable-line
          );
        });
      });

      it('does displays toggle widths option in dropdown', function() {
        SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.isToggleWidthsOptionVisible).to.equal(true);
        percySnapshot(this.test);
      });

      it('shows all comparisons widths when toggle widths option is clicked', function() {
        SnapshotViewerHeaderPO.clickDropdownToggle();
        SnapshotViewerHeaderPO.clickToggleAllWidths();
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons().count).to.equal(3);

        SnapshotViewerHeaderPO.widthSwitcher.buttons().forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${this.get('snapshot.comparisons').toArray()[i].get('width')}px` // eslint-disable-line
          );
        });
      });
    });

    describe('When no comparisons for a snapshot have diffs', function() {
      beforeEach(function() {
        const snapshot = make('snapshot', 'withNoDiffs');

        this.set('stub', sinon.stub());
        this.set('snapshot', snapshot);
        this.render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
        }}`);
      });

      it('displays all widths', function() {
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons().count).to.equal(
          this.get('snapshot.comparisons.length'),
        );
      });

      it('displays correct text on the buttons', function() {
        SnapshotViewerHeaderPO.widthSwitcher.buttons().forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${this.get('snapshot.comparisons').toArray()[i].get('width')}px` // eslint-disable-line
          );
        });
      });

      it('does not display toggle widths option in dropdown', function() {
        SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.isToggleWidthsOptionVisible).to.equal(false);
      });
    });
  });
});
