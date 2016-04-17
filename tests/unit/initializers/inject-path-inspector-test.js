import Ember from 'ember';
import initialize from 'ember-cli-path-inspector/initializers/inject-path-inspector';
import { module, test } from 'qunit';

var registry, application;

module('Unit | Initializer | inject path inspector', {
  beforeEach() {
    Ember.run(function () {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function (assert) {
  initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
