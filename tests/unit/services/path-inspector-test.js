
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('service:path-inspector', 'Unit | Service | path inspector', {
  setup: function () {
    this.subject().set('router.router.recognizer.names', {
      'application': {},
      'foo': {},
      'foo.bar': {},
      'foo.bar.baz': {},
      'bar.baz.foo': {},
      'bar.baz': {},
      'bar': {},
      'qux': {}
    });
  },
  teardown: function () {
  }
});

test('Application correctly identified as a non-leaf route', function (assert) {
  assert.expect(1);
  assert.ok(!this.subject().isLeafRouteName('application'), 'application should not be recognized as a leaf route name');
});

test('Correct identifies leaf route', function (assert) {
  assert.expect(1);
  const route = Ember.Object.create({
    routeName: 'foo.bar.baz'
  });

  assert.ok(this.subject().isLeafRoute(route), 'should recognize a leaf route');
});

test('Correctly identifies leaf routeName', function (assert) {
  assert.expect(1);
  assert.ok(this.subject().isLeafRouteName('foo.bar.baz'), 'foo.bar.baz should be recognized as a leaf route name');
});

test('Correctly lists leaf routes', function (assert) {
  const expectedLeafRoutes = Ember.A(['foo.bar.baz', 'bar.baz.foo', 'qux']);
  const actualLeafRoutes = this.subject().get('leafRouteNames');

  assert.expect(expectedLeafRoutes.length + 1);

  assert.equal(actualLeafRoutes.length, expectedLeafRoutes.length, 'expected and actual leaf routes should be the same length');

  expectedLeafRoutes.forEach(function (routeName) {
    assert.ok(actualLeafRoutes.indexOf(routeName) !== -1, `${routeName} should be a part of the result set`);
  });
});

test('Illegal routeName causes assertion to fail', function (assert) {
  assert.expect(1);

  const service = this.subject();

  try {
    service.isLeafRouteName('ways-to-bank.index');
  } catch (e) {
    assert.ok(true, 'Illegal route name should cause assertion to fire');
  }
});

test('Correctly identifies non leaf route', function (assert) {
  assert.expect(1);
  assert.ok(!this.subject().isLeafRouteName('bar.baz'), 'bar.baz should be recognized as a non-leaf route');
});

test('Correctly identifies sibling route paths', function (assert) {
  assert.expect(8);

  const service = this.subject();

  const expectedFooSiblingPaths = Ember.A(['bar', 'qux']);
  const actualFooSiblingPaths = service.siblingPathsForRouteName('foo');

  assert.equal(expectedFooSiblingPaths.length, actualFooSiblingPaths.length, 'Should be of the same length');
  actualFooSiblingPaths.forEach((path) => {
    assert.ok(expectedFooSiblingPaths.contains(path), `foo sibling paths should contain sibling path: ${path}`);
  });

  const expectedBarSiblingPaths = Ember.A(['foo', 'qux']);
  const actualBarSiblingPaths = service.siblingPathsForRouteName('bar');

  assert.equal(expectedBarSiblingPaths.length, actualBarSiblingPaths.length, 'Should be of the same length');
  expectedBarSiblingPaths.forEach((path) => {
    assert.ok(actualBarSiblingPaths.contains(path), `bar sibling paths should contain sibling path: ${path}`);
  });

  const actualFooBarBazSiblingPaths = service.siblingPathsForRouteName('foo.bar.baz');
  assert.equal(actualFooBarBazSiblingPaths.length, 0, 'foo.bar.baz sibling paths should should have a length of zero');

  const actualBarBazFooSiblingPaths = service.siblingPathsForRouteName('bar.baz.foo');
  assert.equal(actualBarBazFooSiblingPaths.length, 0, 'bar.baz.foo sibling paths should have a length of zero');
});

test('Child nodes are of correct length', function (assert) {
  assert.expect(6);
  const service = this.subject();

  const applicationNode = service.nodeForRouteName('application');
  assert.equal(applicationNode.children.length, 3, 'application should have 3 children');

  const fooNode = service.nodeForRouteName('foo', 'foo should have 1 child');
  assert.equal(fooNode.children.length, 1);

  const barNode = service.nodeForRouteName('bar');
  assert.equal(barNode.children.length, 1, 'bar should have 1 child');

  const quxNode = service.nodeForRouteName('qux', 'qux should have no children');
  assert.equal(quxNode.children.length, 0);

  const barBazNode = service.nodeForRouteName('bar.baz');
  assert.equal(barBazNode.children.length, 1, 'bar.baz should have one child');

  const barBazFooNode = service.nodeForRouteName('bar.baz.foo');
  assert.equal(barBazFooNode.children.length, 0, 'bar.baz.foo should have no children');
});

test('Queried route name is not listed in sibling paths', function (assert) {
  assert.expect(1);
  const service = this.subject();
  const result = service.siblingNodesForRouteName('bar');

  assert.ok(!result.findBy('routeName', 'bar'), 'bar should not be in its sibling node set');
});

test('Correctly identifies sibling nodes for foo', function (assert) {
  const service = this.subject();
  const expectedPaths = Ember.A(['bar', 'qux']);
  assert.expect(expectedPaths.length);

  const result = service.siblingNodesForRouteName('foo');

  expectedPaths.forEach((path) => {
    assert.ok(result.findBy('routeName', path), `foo siblings should contain node for path: ${path}`);
  });
});

test('Correctly identifies sibling nodes for bar', function (assert) {
  const service = this.subject();
  const expectedPaths = Ember.A(['foo', 'qux']);

  assert.expect(expectedPaths.length);

  const result = service.siblingNodesForRouteName('bar');

  expectedPaths.forEach((path) => {
    assert.ok(result.findBy('routeName', path), `Should contain node for path: ${path}`);
  });
});

test('Application siblings paths are of length zero', function (assert) {
  assert.expect(1);
  const service = this.subject();

  assert.equal(service.siblingPathsForRouteName('application').length, 0, 'application should have no sibling paths');
});
