import Ember from 'ember';

export default Ember.Controller.extend({

	routeName: 'index',

	node: Ember.computed('routeName', function () {
		return this.get('pathInspectorService').nodeForRouteName(this.get('routeName'));
	}),

	siblingPaths: Ember.computed('routeName', function () {
		return this.get('pathInspectorService').siblingPathsForRouteName(this.get('routeName'));
	}),

	actions: {
		inspect(routeName) {
			this.set('routeName', routeName);
		}
	}
});
