
import Ember from 'ember';

export default Ember.Route.extend({
	setupController(controller) {
		const pathInspector = this.get('pathInspectorService');
		const routeName = this.get('routeName');
		const nodeName = pathInspector.nodeForRouteName(routeName).nodeName;

		controller.setProperties({
			nodeName: nodeName,
			routeName: routeName,
			childRoutes: pathInspector.nodeForRouteName(routeName).children
		});
	}
});
