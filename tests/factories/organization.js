import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';
import {makeList} from 'ember-data-factory-guy';

FactoryGuy.define('organization', {
  default: {
    name: () => faker.company.companyName(),

    projects: FactoryGuy.hasMany('project'),
    versionControlIntegrations: FactoryGuy.hasMany('version-control-integration'),
    repos: FactoryGuy.hasMany('repo'),
  },
  traits: {
    withGithubIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['github']);
      },
    },
    withGithubEnterpriseIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['githubEnterprise']);
      },
    },
    withMultipleIntegrations: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['github', 'githubEnterprise']);
      },
    },
    withRepos: {repos: () => makeList('repo', 3)},
    withProjects: {projects: () => makeList('project', 5)},
  },
});
