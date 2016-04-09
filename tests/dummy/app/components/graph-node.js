import Ember from 'ember';
import layout from '../templates/components/graph-node';

export default Ember.Component.extend({
  classNames: ['graph-node-row'],
  layout: layout,
  node: {}
});
