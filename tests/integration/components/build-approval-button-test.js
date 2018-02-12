/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupComponentTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, manualSetup, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {resolve, defer} from 'rsvp';
import wait from 'ember-test-helpers/wait';
import BuildApprovalButton from 'percy-web/tests/pages/components/build-approval-button';

describe('Integration: BuildApprovalButton', function() {
  setupComponentTest('build-approval-button', {
    integration: true,
  });

  let build;
  let createReview;

  beforeEach(function() {
    manualSetup(this.container);
    BuildApprovalButton.setContext(this);
    build = make('build', {snapshots: makeList('snapshot', 4)});
    createReview = sinon.stub().returns(resolve());
    this.setProperties({build, createReview});
  });

  it('displays correctly when build is not approved ', function() {
    this.render(hbs`{{build-approval-button
      build=build
      createReview=createReview
    }}`);
    percySnapshot(this.test);
  });

  it('displays correctly when build is approved', function() {
    this.render(hbs`{{build-approval-button
      build=build
      createReview=createReview
    }}`);
    this.set('build.reviewState', 'approved');
    percySnapshot(this.test);
  });

  it('calls createReview with correct args when clicked', function() {
    this.render(hbs`{{build-approval-button
      build=build
      createReview=createReview
    }}`);
    BuildApprovalButton.clickButton();

    expect(createReview).to.have.been.calledWith('approve', build, build.get('snapshots'));
  });

  it('displays correctly when in loading state ', function() {
    const deferred = defer();
    const createReview = sinon.stub().returns(deferred.promise);
    this.set('createReview', createReview);
    this.render(hbs`{{build-approval-button
      build=build
      createReview=(action createReview)
    }}`);

    BuildApprovalButton.clickButton();

    return wait().then(() => {
      percySnapshot(this.test);
    });
  });
});
