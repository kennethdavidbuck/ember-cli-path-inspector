//import d3 from 'd3';
import Ember from 'ember';
import layout from '../templates/components/graph-tree';

export default Ember.Component.extend({
  classNames: ['graph-tree'],
  layout: layout,
  node: {},

  didInsertElement() {
    this._super(...arguments);

    this.getAttr('tree');
  }
});
