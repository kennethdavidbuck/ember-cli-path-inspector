/**
 *
 * @class EmberCliRoutePathInspector.Services.PathInspector
 * @constructor
 */

import Ember from 'ember';

const {
  assert,
  computed,
  typeOf
  } = Ember;

const rootRouteName = 'application';
const lastSegment = /\.([^.]+)$/;

export default Ember.Service.extend({

  router: {
    router: {
      recognizer: {
        names: {}
      }
    }
  },

  /**
   * A list of all route paths in the application
   *
   * @property {[String]} routes
   * @public
   */
  routes: computed('router.router.recognizer.names', function () {
    const routes = this.get('router.router.recognizer.names');

    assert('Should have been given an object of route names', typeOf(routes) === 'object');
    assert('At a minimum the names object should contain the application route name', routes.hasOwnProperty(rootRouteName));

    return Object.keys(routes).filter(route => !route.match(/(loading|error)/));
  }),

  /**
   * Determines whether or not a given route is a leaf route within the application
   *
   * @method isLeafRoute
   * @param {Ember.Route} routeName
   * @returns {Boolean}
   * @public
   */
  isLeafRoute({routeName}) {
    return this.isLeafRouteName(routeName);
  },

  /**
   * Determines whether or not a given routeName is that of a leaf route within the application.
   *
   * @method isLeafRouteName
   * @param {string} candidateRouteName
   * @returns {Boolean}
   * @public
   */
  isLeafRouteName(candidateRouteName) {
    const leafRouteMap = this.get('leafRouteMap');

    assert('Route Inspector: You queried a route that is not part of this application', leafRouteMap.hasOwnProperty(candidateRouteName));

    return leafRouteMap[candidateRouteName];
  },

  /**
   * A list of all leaf route names in the application
   *
   * @property {[String]} leafRouteNames
   * @public
   */
  leafRouteNames: computed(function () {
    const leafRouteMap = this.get('leafRouteMap');

    return Object.keys(leafRouteMap).filter(key => leafRouteMap[key]);
  }),

  /**
   * A hash where route names make up the keys, which are paired with either a true or false boolean value indicating
   * whether or not the keyed route name is that of a leaf route
   *
   * @property {Object} leafRouteMap
   * @public
   */
  leafRouteMap: computed('routes.[]', function () {
    // We don't want the application route because, by convention, Ember does not prepend it to any routeNames.
    // This means the algorithm will determine that it is a leaf route when it is not.
    const routes = this.get('routes').filter(routeName => routeName !== rootRouteName);

    const leafRouteMap = routes.reduce((leafRouteMap, routeName) => {
      leafRouteMap[routeName] = true;

      return leafRouteMap;
    }, {});

    leafRouteMap[rootRouteName] = false;

    // Set all second to last nodes for each route path to false (leaves all leaf routes to true)
    return routes.reduce((leafRouteMap, routeName) => {
      if (routeName.indexOf('.') > -1) {
        leafRouteMap[routeName.replace(lastSegment, '')] = false;
      }

      return leafRouteMap;
    }, leafRouteMap);
  }),

  /**
   * Retrieves the route names for the immediate siblings of a given route name
   *
   * @method siblingPathsForRouteName
   * @param {String} routeName
   * @returns {[String]}
   * @public
   */
  siblingPathsForRouteName(routeName) {
    return this.siblingNodesForRouteName(routeName).map(node => node.routeName);
  },

  /**
   * Retrieves the parallel route tree nodes representing the immediate siblings for a given route name
   *
   * @method siblingNodesForRouteName
   * @param {String} routeName
   * @returns {[Object]}
   * @public
   */
  siblingNodesForRouteName(routeName) {
    if (routeName === rootRouteName) {
      return [];
    }

    return this.nodeForRouteName(routeName).parent.children.filter(siblingNode => siblingNode.routeName !== routeName);
  },

  /**
   * Retrieves the parallel route tree node representing the a given route name.
   *
   * @method nodeForRouteName
   * @param {String} routeName
   * @returns {Object}
   * @public
   */
  nodeForRouteName(routeName) {
    assert('Route Inspector: You queried a node for a route that does not exist!', this.get('leafRouteMap').hasOwnProperty(routeName));

    if (routeName === rootRouteName) {
      return this.get('routeMapTree');
    }

    return routeName
      .split('.')
      .reduce((parentNode, nodeName) => {
        return parentNode.children.find(childNode => childNode.nodeName === nodeName);
      }, this.get('routeMapTree'));
  },

  /**
   * A parallel tree of nodes to that of the applications route map/tree.
   *
   * @property {Object} routeMapTree
   * @public
   */
  routeMapTree: computed(function () {
    const routeMapTree = {
      nodeName: rootRouteName,
      routeName: rootRouteName,
      children: [],
      depth: 0,
      isLeafNode: false
    };

    this.get('routes')
      .filter(route => route !== rootRouteName)
      .forEach(routeName => {
        let currentNode = routeMapTree;

        routeName.split('.').forEach((nodeName) => {
          let nextNode = Ember.A(currentNode.children).find(node => node.nodeName === nodeName);

          if (!nextNode) {
            nextNode = {
              parent: currentNode,
              nodeName: nodeName,
              children: [],
              depth: currentNode.depth + 1
            };

            currentNode.children.push(nextNode);
          }

          currentNode = nextNode;
        });

        currentNode.routeName = routeName;
        currentNode.isLeafNode = this.isLeafRouteName(routeName);
      });

    return routeMapTree;
  })
});
