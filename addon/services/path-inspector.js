import Ember from 'ember';

const {
  assert,
  computed,
  typeOf
  } = Ember;

const rootRouteName = 'application';

export default Ember.Service.extend({

  router: {
    router: {
      recognizer: {
        names: {}
      }
    }
  },

  routes: computed('router.router.recognizer.names', function () {
    const routes = this.get('router.router.recognizer.names');

    assert('Should have been given an object of route names', typeOf(routes) === 'object');
    assert('At a minimum the names object should contain the application route name', routes.hasOwnProperty(rootRouteName));

    return Object.keys(routes);
  }),

  isLeafRoute({routeName}) {
    return this.isLeafRouteName(routeName);
  },

  isLeafRouteName(candidateRouteName) {
    const leafRouteMap = this.get('leafRouteMap');

    assert('Route Inspector: You queried a route that is not part of this application', leafRouteMap.hasOwnProperty(candidateRouteName));

    return leafRouteMap[candidateRouteName];
  },

  leafRouteNames: computed(function () {
    const leafRouteMap = this.get('leafRouteMap');

    return Object.keys(leafRouteMap).filter(key => leafRouteMap[key]);
  }),

  leafRouteMap: computed(function () {
    // We don't want the application route because, by convention, Ember does not prepend it to any routeNames.
    // This means the algorithm will determine that it is a leaf route when it is not.
    const routes = this.get('routes').filter(routeName => routeName !== rootRouteName);

    const leafRouteMap = routes.reduce((leafRouteMap, routeName) => {
      leafRouteMap[routeName] = true;

      return leafRouteMap;
    }, {});

    leafRouteMap[rootRouteName] = false;

    // Set all second to last nodes for each route path to false.
    return routes.reduce((leafRouteMap, routeName) => {
      if (routeName.match(/(\.)+/)) {
        leafRouteMap[routeName.replace(/\.([^.]+)$/, '')] = false;
      }

      return leafRouteMap;
    }, leafRouteMap);
  }),

  siblingPathsForRouteName(routeName) {
    return this.siblingNodesForRouteName(routeName).map(node => node.routeName);
  },

  siblingNodesForRouteName(routeName) {
    if (routeName === rootRouteName) {
      return [];
    }

    return this.nodeForRouteName(routeName).parent.children.filter(siblingNode => siblingNode.routeName !== routeName);
  },

  nodeForRouteName(routeName) {
    assert('Route Inspector: You queried a node for a route that does not exist!', this.get('leafRouteMap').hasOwnProperty(routeName));

    // Application is the root so we can simply return the tree.
    if (routeName === rootRouteName) {
      return this.get('routeMapTree');
    }

    return routeName
      .split('.')
      .reduce((parentNode, nodeName) => {
        return parentNode.children.find(childNode => childNode.nodeName === nodeName);
      }, this.get('routeMapTree'));
  },

  routeMapTree: computed(function () {
    const routeMapTree = {
      nodeName: rootRouteName,
      routeName: rootRouteName,
      children: []
    };

    this.get('routes')
      .filter(route => route !== rootRouteName)
      .forEach(routeName => {
        let currentNode = routeMapTree;

        routeName.split('.').forEach(nodeName => {
          let nextNode = Ember.A(currentNode.children).find(node => node.nodeName === nodeName);

          if (!nextNode) {
            nextNode = {
              parent: currentNode,
              nodeName: nodeName,
              children: []
            };

            currentNode.children.push(nextNode);
          }

          currentNode = nextNode;
        });

        currentNode.routeName = routeName;
      });

    return routeMapTree;
  })
});
