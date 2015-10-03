import Ember from 'ember';

export default Ember.Route.extend({
	setupController(controller) {
		const pathInspector = this.get('pathInspectorService');
		const routeName = this.get('routeName');
		const node = pathInspector.nodeForRouteName(routeName);

		controller.setProperties({
			childNodes: node.children
		});
	},
});
