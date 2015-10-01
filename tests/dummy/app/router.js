import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
	this.route('inspect', function () {
		this.route('one');
		this.route('two');
		this.route('three');
	});
});
