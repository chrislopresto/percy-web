import {clickable, create} from 'ember-cli-page-object';

const SELECTORS = {
  BUTTON: '[data-test-build-approval-button]',
};

export const BuildApprovalButton = {
  clickButton: clickable(SELECTORS.BUTTON),
};

export default create(BuildApprovalButton);
