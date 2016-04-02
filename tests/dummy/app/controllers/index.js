import Ember from 'ember';

const errorOrLoading = /(loading|error)/;

export default Ember.Controller.extend({

  routes: Ember.computed('pathInspectorService.routes.length', function () {
    const pathInspector = this.get('pathInspectorService');

    return pathInspector.get('routes')
      .filter(routeName => !routeName.match(errorOrLoading))
      .map(routeName => {
        const node = pathInspector.nodeForRouteName(routeName);
        const siblingPaths = pathInspector.siblingPathsForRouteName(routeName).filter(routeName => !routeName.match(errorOrLoading));
        const isLeafRoute = pathInspector.isLeafRouteName(node.routeName);
        const children =  node.children.filter(childNode => !childNode.routeName.match(errorOrLoading));

        return {
          routeName: node.routeName,
          pathSegment: node.nodeName,
          parentPath: node.parent ? node.parent.routeName : 'n/a',
          childCount: children.length,
          children: children,
          siblingCount: siblingPaths.length,
          siblingPaths: siblingPaths.filter(routeName => !routeName.match(errorOrLoading)),
          isLeaf: isLeafRoute
        };
    });
  })
});
