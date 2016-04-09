import Ember from 'ember';
import layout from '../templates/components/graph-tree';

export default Ember.Component.extend({
  classNames: ['graph-tree'],
  layout: layout,
  node: {}
});
