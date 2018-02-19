import {computed} from '@ember/object';
import {filterBy, alias, bool} from '@ember/object/computed';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  slug: DS.attr(),
  versionControlIntegrations: DS.hasMany('version-control-integrations', {
    async: false,
  }),

  githubIntegration: computed('versionControlIntegrations.@each.githubIntegrationId', function() {
    return this.get('versionControlIntegrations').findBy('isGithubIntegration');
  }),

  githubEnterpriseIntegration: computed(
    'versionControlIntegrations.@each.githubEnterpriseIntegrationId',
    function() {
      return this.get('versionControlIntegrations').findBy('githubEnterpriseIntegrationId');
    },
  ),

  githubIntegrationRequest: DS.belongsTo('github-integration-request', {
    async: false,
  }),
  subscription: DS.belongsTo('subscription', {async: false}),
  projects: DS.hasMany('project'),
  billingProvider: DS.attr(),
  billingProviderData: DS.attr(),
  billingLocked: DS.attr('boolean'),

  // Filtered down to saved projects, does not include unsaved project objects:
  savedProjects: filterBy('projects', 'isNew', false),

  organizationUsers: DS.hasMany('organization-user'),

  // These are GitHub repositories that the organization has access permissions to. These are not
  // useful on their own other than for listing. A repo must be linked to a project.
  repos: DS.hasMany('repo'),

  isGithubIntegrated: computed('githubAuthMechanism', function() {
    return this.get('githubAuthMechanism') !== 'no-access';
  }),

  isGithubEnterpriseIntegrated: bool('githubEnterpriseIntegration'),

  githubAuthMechanism: computed('githubIntegration', function() {
    if (this.get('githubIntegration')) {
      return 'github-integration';
    }
    return 'no-access';
  }),

  // A funky, but efficient, way to query the API for only the current user's membership.
  // Use `organization.currentUserMembership` to get the current user's OrganizationUser object.
  currentUserMembership: alias('_filteredOrganizationUsers.firstObject'),
  _filteredOrganizationUsers: computed(function() {
    return this.store.query('organization-user', {
      organization: this,
      filter: 'current-user-only',
    });
  }),
});
