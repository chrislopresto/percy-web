import {equal} from '@ember/object/computed';
import DS from 'ember-data';

const GITHUB_ENTERPRISE_INTEGRATION_TYPE = 'github_enterprise';
const GITHUB_INTEGRATION_TYPE = 'github';

export default DS.Model.extend({
  organization: DS.belongsTo('organization'),
  githubInstallationId: DS.attr(),
  githubAccountAvatarUrl: DS.attr(),
  githubHtmlUrl: DS.attr(),
  integrationType: DS.attr(),
  githubEnterpriseHost: DS.attr(),
  githubEnterpriseInstallationId: DS.attr(),
  githubEnterpriseIntegrationId: DS.attr(),

  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  isGithubIntegration: equal('integrationType', GITHUB_INTEGRATION_TYPE),
  isGithubEnterpriseIntegration: equal('integrationType', GITHUB_ENTERPRISE_INTEGRATION_TYPE),
});
