/**
 * Provides additional non-invasive route tree introspection using a parallel tree of nodes
 *
 *        // Example Node:
 *        {
 *          nodeName: 'index',
 *          isLeafNode: true,
 *          routeName: 'index',
 *          children: [],
 *          depth: 1,
 *          parent: {
 *            nodeName: 'application',
 *            isLeafNode: false,
 *            routeName: 'application',
 *            depth: 0,
 *            children: [] // this would contain the same outer node we are dealing with
 *          }
 *        }
 *
 * @class EmberCliRoutePathInspector.Services.PathInspector
 * @constructor
 * @extends Ember.Service
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
   *        let routeNames = this.get('pathInspectorService.routes'); // ex. ['index', 'foo.bar', 'baz.qux']
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
   * A list of all leaf route names in the application
   *
   *        // Assuming a boilerplate application with only an index route.
   *        let leafRouteNames = this.get('pathInspectorService.leafRouteNames'); // ['index']
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
   *        // Assuming a boilerplate application with only an index route
   *        let leafRouteMap = this.get('pathInspectorService.leafRouteMap'); // {application: false, 'application.index': true}
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
   * A parallel tree of nodes to that of the applications route map/tree.
   *
   *        // Assuming the following routes: application, application.index
   *        let routeMapTree = this.get('pathInspectorService.routeMapTree');
   *
   *        // result:
   *              {
   *                nodeName: 'application',
   *                routeName: 'application',
   *                isLeafNode: false,
   *                depth: 0,
   *                children: [
   *                  nodeName: 'index',
   *                  routeName: 'index',
   *                  children: [],
   *                  depth: 1,
   *                  parent: {} // the same outer node we are dealing with
   *                ]
   *              }
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
  }),

  /**
   * Determines whether or not a given route is a leaf route within the application
   *
   *       let isLeafRoute = this.get('pathInspectorService').isLeafRoute(this); // true / false
   *
   * @method isLeafRoute
   * @param {Ember.Route} route An application route to inspect and determine whether or not it is a leaf route
   * @returns {Boolean} Whether or not the route is a leaf route
   * @public
   */
  isLeafRoute({routeName}) {
    return this.isLeafRouteName(routeName);
  },

  /**
   * Determines whether or not a given routeName is that of a leaf route within the application.
   *
   *        let isLeafRouteName = this.get('pathInspectorService').isLeafRouteName(this.get('routeName')); // true / false
   *
   * @method isLeafRouteName
   * @param {String} candidateRouteName An application route name to inspect and determine whether or not it is a leaf route.
   * @returns {Boolean} Whether or not the route name is that of an application leaf route
   * @public
   */
  isLeafRouteName(candidateRouteName) {
    const leafRouteMap = this.get('leafRouteMap');

    assert('Route Inspector: You queried a route that is not part of this application', leafRouteMap.hasOwnProperty(candidateRouteName));

    return leafRouteMap[candidateRouteName];
  },

  /**
   * Retrieves the route names for the siblings of a given route name
   *
   *        // Assuming the following routes: application, application.index, application.foo
   *        let siblingPaths = this.get('pathInspectorService').siblingPathsForRouteName('application.index'); // ['foo']
   *
   * @method siblingPathsForRouteName
   * @param {String} routeName A route name to fetch the sibling route names for
   * @returns {[String]} A list of found sibling route names
   * @public
   */
  siblingPathsForRouteName(routeName) {
    return this.siblingNodesForRouteName(routeName).map(node => node.routeName);
  },

  /**
   * Retrieves the parallel route tree nodes representing the siblings for a given route name
   *
   *        // Assuming the following routes: application, application.index, application.foo
   *        let siblingNodes = this.get('pathInspectorService').siblingNodesForRouteName('application.index');
   *
   *        // result:
   *              [
   *                {
   *                  nodeName: 'foo',
   *                  isLeafNode: true,
   *                  routeName: 'foo',
   *                  children: [],
   *                  depth: 1,
   *                  parent: {
   *                    nodeName: 'application'
   *                  }
   *                }
   *              ]
   *
   * @method siblingNodesForRouteName
   * @param {String} routeName A route name to fetch the sibling parallel tree nodes for
   * @returns {[Object]} A list of parallel tree nodes representing the siblings for a given route name
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
   *        let node = this.get('pathInspectorService').nodeForRouteName('application.index');
   *
   *        // result:
   *              {
   *                nodeName: 'index',
   *                isLeafNode: true,
   *                routeName: 'index',
   *                children: [],
   *                depth: 1,
   *                parent: {
   *                  nodeName: 'application',
   *                  isLeafNode: false,
   *                  routeName: 'application',
   *                  depth: 0,
   *                  children: [] // this would contain the same outer node we are dealing with
   *                }
   *              }
   *
   * @method nodeForRouteName
   * @param {String} routeName An application route name to fetch a parallel tree node for
   * @returns {Object} The parallel tree node for a given route name
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
  }
});
