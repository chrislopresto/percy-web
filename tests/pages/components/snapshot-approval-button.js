import {clickable, create, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  BUTTON: '[data-test-SnapshotViewerHeader-approve]',
  APPROVED_PILL: '[data-test-snapshot-approved-pill]',
};

export const SnapshotApprovalButton = {
  clickButton: clickable(SELECTORS.BUTTON),

  isApproved: isVisible(SELECTORS.APPROVED_PILL),
  isUnapproved: isVisible(SELECTORS.BUTTON),
};

export default create(SnapshotApprovalButton);
