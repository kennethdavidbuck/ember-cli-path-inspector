import Ember from 'ember';

const {
  assert,
  computed,
  typeOf
  } = Ember;

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
    assert('At a minimum the names object should contain the application route name', routes.hasOwnProperty('application'));

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
    const routes = this.get('routes').filter(routeName => routeName !== 'application');

    const leafRouteMap = routes.reduce((leafRouteMap, routeName) => {
      leafRouteMap[routeName] = true;

      return leafRouteMap;
    }, {application: false});

    return routes.reduce((leafRouteMap, routeName) => {
      const segments = routeName.split('.');

      // Set all second to last nodes for each route path to false.
      if (segments.length > 1) {
        leafRouteMap[segments.slice(0, -1).join('.')] = false;
      }

      return leafRouteMap;
    }, leafRouteMap);
  }),

  siblingPathsForRouteName(routeName) {
    return this.siblingNodesForRouteName(routeName).map(node => node.routeName);
  },

  siblingNodesForRouteName(routeName) {
    // Application is the root, so it is not possible for it to have a parent or any siblings.
    if (routeName === 'application') {
      return [];
    }

    const siblings = this.nodeForRouteName(routeName).parent.children;

    return siblings.filter(siblingNode => siblingNode.routeName !== routeName);
  },

  nodeForRouteName(routeName) {
    assert('Route Inspector: You queried a node for a route that does not exist!', this.get('leafRouteMap').hasOwnProperty(routeName));

    // Application is the root so we can simply return the tree.
    if (routeName === 'application') {
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
      nodeName: 'application',
      routeName: 'application',
      children: []
    };

    this.get('routes')
      .filter(route => route !== 'application')
      .forEach(routeName => {
        let currentNode = routeMapTree;

        routeName.split('.').forEach(nodeName => {
          let nextNode = currentNode.children.find(node => node.nodeName === nodeName);

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
