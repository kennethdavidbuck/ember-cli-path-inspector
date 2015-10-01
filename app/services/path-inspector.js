/**
 * Route Inspector Service is for cases where it is necessary to determine which routes in an application are leaf routes.
 * This can be done as a list leaf route names that is retrieved or as a check based on a given route or routeName.
 *
 * Update: The service has been extended to include other types of inspections concerning the application route map.
 * Read the document annotations below fore more information.
 *
 * @class Ebanking.Services.route-inspector
 * @extends {Ember.Service}
 */

import Ember from 'ember';

export default Ember.Service.extend({
	/**
	 * Application Router
	 *
	 * @property {Object} router
	 */
	router: {
		router: {
			recognizer: {
				names: {}
			}
		}
	},

	/**
	 * List of all route names in the application.
	 *
	 * @property {[String]} routes
	 */
	routes: Ember.computed('router', function () {
	const routes = this.get('router.router.recognizer.names');

		Ember.assert('Should have been given an object of route names', Ember.typeOf(routes) === 'object');
		Ember.assert('At a minimum the names object should contain the application route name', routes.hasOwnProperty('application'));

		return Ember.A(Ember.keys(routes));
	}),

	/**
	 * Determines whether a given route is a leaf route in the application
	 *
	 * @method isLeafRoute
	 * @param {string} candidateRoute an application route
	 * @return {Boolean} whether or not the supplied route is a leaf route in the application
	 */
	isLeafRoute(candidateRoute) {
		return this.isLeafRouteName(candidateRoute.get('routeName'));
	},

	/**
	 * Determines whether or not a given route is a leaf route in the application.
	 *
	 * @method isLeafRouteName
	 * @param candidateRouteName
	 * @return {*}
	 */
	isLeafRouteName(candidateRouteName) {
		const leafRouteMap = this.get('leafRouteMap');

		Ember.assert('Route Inspector: You queried a route that is not part of this application', leafRouteMap.hasOwnProperty(candidateRouteName));

		return leafRouteMap[candidateRouteName];
	},

	/**
	 * Retrieves a list of all leaf routeNames in the current application.
	 *
	 * @property leafRouteNames
	 * @type {[String]}
	 */
	leafRouteNames: Ember.computed(function () {
		const leafRouteMap = this.get('leafRouteMap');

		return Ember.A(Ember.A(Ember.keys(leafRouteMap)).filter((key) => {
			return leafRouteMap[key];
		}));
	}),

	/**
	 * Constructs a hash map of all routeNames in the application, where the key is the routeName and the value is
	 * a boolean indicating whether or not the routeName is that of a leaf route.
	 *
	 * @property leafRouteMap
	 * @type {PlainObject}
	 */
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

	/**
	 * Finds routeNames representing siblings for a given route name.
	 *
	 * @method siblingPathsForRouteName
	 * @param {string} routeName
	 * @return {[PlainObject]}
	 */
	siblingPathsForRouteName(routeName) {
		return Ember.A(this.siblingNodesForRouteName(routeName).mapBy('routeName'));
	},

	/**
	 * Finds nodes representing information about the siblings for a given route name.
	 *
	 * @method siblingPathsForRouteName
	 * @param {string} routeName
	 * @return {[PlainObject]}
	 */
	siblingNodesForRouteName(routeName) {
		// Application is the root, so it is not possible for it to have a parent or any siblings.
		if (routeName === 'application') {
			return Ember.A([]);
		}

		return Ember.A(Ember.A(this.nodeForRouteName(routeName).parent.children).filter((siblingNode) => {
			return siblingNode.routeName !== routeName;
		}));
	},

	/**
	 * Finds a node (subtree) that represents a route in the application. A node contains the name of the node, the
	 * routeName that points to the node, as well as a list of its children which can be recursively traversed.
	 *
	 * @method nodeForRouteName
	 * @param {string} routeName
	 * @return {PlainObject}
	 */
	nodeForRouteName(routeName) {
		Ember.assert('Route Inspector: You queried a node for a route that does not exist!', this.get('leafRouteMap').hasOwnProperty(routeName));

		const routeMapTree = this.get('routeMapTree');

		// Application is the root so we can simply return the tree.
		if (routeName === 'application') {
			return routeMapTree;
		}

		return routeName.split('.').reduce((prev, nodeName) => {
			return prev.children.findBy('nodeName', nodeName);
		}, routeMapTree);
	},

	/**
	 * Consumes all of the application routeNames and constructs a b-tree. Each node contains the name of the node, the
	 * full routePath up to and including that node, its parent node, and an array of all of its children. Leaf routes can be
	 * inferred by checking the count of a given nodes children (i.e. where a count of 0 indicates a leaf node).
	 *
	 * @property routeMapTree
	 * @type {PlainObject}
	 */
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
