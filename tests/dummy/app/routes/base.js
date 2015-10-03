import Ember from 'ember';

export default Ember.Route.extend({
	setupController(controller) {
		const pathInspector = this.get('pathInspectorService');
		const routeName = this.get('routeName');
		const node = pathInspector.nodeForRouteName(routeName);
		const nodeName = node.nodeName;

		controller.setProperties({
			node: node,
			nodeName: nodeName,
			routeName: routeName,
			siblingNodes: pathInspector.siblingNodesForRouteName(routeName)
		});
	},

	renderTemplate() {
		this._super(... this);
		this.render('inspect', {
			controller: this.get('controller')
		});
	}
});
