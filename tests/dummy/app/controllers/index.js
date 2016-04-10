import Ember from 'ember';

const errorOrLoading = /(loading|error)/;

export default Ember.Controller.extend({

  routes: Ember.computed('pathInspectorService.routes.length', function () {
    const pathInspector = this.get('pathInspectorService');

    return pathInspector.get('routes')
      .filter(routeName => !routeName.match(errorOrLoading))
      .map(routeName => {
        const node = pathInspector.nodeForRouteName(routeName);
        const siblings = pathInspector.siblingNodesForRouteName(routeName).filter(node => !node.routeName.match(errorOrLoading));
        const isLeafRoute = pathInspector.isLeafRouteName(node.routeName);
        const children =  node.children.filter(childNode => !childNode.routeName.match(errorOrLoading));

        return {
          routeName: node.routeName,
          nodeName: node.nodeName,
          parentRouteName: node.parent ? node.parent.routeName : null,
          childCount: children.length,
          children: children,
          siblingCount: siblings.length,
          siblings: siblings,
          isLeaf: isLeafRoute
        };
    });
  })
});
