import Ember from 'ember';

export default Ember.Service.extend({

  router: {
    router: {
      recognizer: {
        names: {}
      }
    }
  },

  routes: Ember.computed('router', function () {
    const routes = this.get('router.router.recognizer.names');

    Ember.assert('Should have been given an object of route names', Ember.typeOf(routes) === 'object');
    Ember.assert('At a minimum the names object should contain the application route name', routes.hasOwnProperty('application'));

    return Ember.A(Object.keys(routes));
  }),


  isLeafRoute(candidateRoute) {
    return this.isLeafRouteName(candidateRoute.get('routeName'));
  },

  isLeafRouteName(candidateRouteName) {
    const leafRouteMap = this.get('leafRouteMap');

    Ember.assert('Route Inspector: You queried a route that is not part of this application', leafRouteMap.hasOwnProperty(candidateRouteName));

    return leafRouteMap[candidateRouteName];
  },

  leafRouteNames: Ember.computed(function () {
    const leafRouteMap = this.get('leafRouteMap');

    return Ember.A(Ember.A(Object.keys(leafRouteMap)).filter((key) => {
      return leafRouteMap[key];
    }));
  }),

  leafRouteMap: Ember.computed(function () {
    // We don't want the application route because, by convention, Ember does not prepend it to any routeNames.
    // This means the algorithm will determine that it is a leaf route when it is not.
    const routes = this.get('routes').without('application');

    const leafRouteMap = {
      application: false
    };

    routes.forEach((route) => {
      leafRouteMap[route] = true;
    });

    routes.forEach((route) => {
      const segments = route.split('.');

      // Set all second to last nodes for each route path to false.
      if (segments.length > 1) {
        leafRouteMap[segments.slice(0, -1).join('.')] = false;
      }
    });

    return leafRouteMap;
  }),

  siblingPathsForRouteName(routeName) {
    return Ember.A(this.siblingNodesForRouteName(routeName).mapBy('routeName'));
  },

  siblingNodesForRouteName(routeName) {
    // Application is the root, so it is not possible for it to have a parent or any siblings.
    if (routeName === 'application') {
      return Ember.A([]);
    }

    return Ember.A(Ember.A(this.nodeForRouteName(routeName).parent.children).filter((siblingNode) => {
      return siblingNode.routeName !== routeName;
    }));
  },

  nodeForRouteName(routeName) {
    Ember.assert('Route Inspector: You queried a node for a route that does not exist!', this.get('leafRouteMap').hasOwnProperty(routeName));

    const routeMapTree = this.get('routeMapTree');

    // Application is the root so we can simply return the tree.
    if (routeName === 'application') {
      return routeMapTree;
    }

    return Ember.A(Ember.A(routeName.split('.')).reduce((prev, nodeName) => {
      return prev.children.findBy('nodeName', nodeName);
    }, routeMapTree));
  },

  routeMapTree: Ember.computed(function () {
    const routeMapTree = {
      nodeName: 'application',
      routeName: 'application',
      children: Ember.A([])
    };

    this.get('routes').without('application').forEach((routeName) => {
      let currentNode = routeMapTree;

      routeName.split('.').forEach((nodeName) => {
        let nextNode = currentNode.children.findBy('nodeName', nodeName);

        if (!nextNode) {
          nextNode = {
            parent: currentNode,
            nodeName: nodeName,
            children: Ember.A([])
          };

          currentNode.children.pushObject(nextNode);
        }

        currentNode = nextNode;
      });

      currentNode.routeName = routeName;
    });

    return routeMapTree;
  })
});
