# ember-cli-path-inspector [![Build Status](https://travis-ci.org/kennethdavidbuck/ember-cli-path-inspector.svg?branch=develop)](https://travis-ci.org/kennethdavidbuck/ember-cli-path-inspector)

Path Inspector acquires a list of your applications paths at run time and constructs a parallel tree of nodes for querying. This allows you to ask questions about your applications routes without having to probe them directly. You can use this service throughout your application to answer different questions such as:

- Is a given routeName for a leaf route?
- Is a given route a leaf route?
- What are all of the application leaf routeNames?
- What are the routeNames of all siblings for a given routeName?
- What is the parent routeName for a given routeName?
- What are the immediate child routeNames for a given routName?

Does it deal with dynamically generated routes? No, not yet.

**You can view a demo app that uses the inspector [HERE](https://kennethdavidbuck.github.io/ember-cli-path-inspector), 
along with the [API DOCS](https://kennethdavidbuck.github.io/ember-cli-path-inspector/docs/).**

Is it production ready? While current implementation is being used in production apps the api is subject to change until 1.0.0 is reached

## Installation
```
ember install ember-cli-path-inspector
```

## Basic Usage - Some Contrived Examples


### The Node Tree
Each node in the parallel tree has 4 properties:

- parent: The current nodes parent node
- nodeName: Given a path to a leaf node, this is the segment representing the current node.
- routeName: What you would expect, the path leading to the the route.
- children: A list of immediate child route names for the current node.

### Determining Leaf Routes
```javascript
  // ...snip...
  setupController(controller, model) {
   this._super(controller, model);
    if(this.get('pathInspectorService').isLeafRouteName(this.get('routeName')) {
      // do stuff
    }
    
    // or...
    if(this.get('pathInspectorService').isLeafRoute(this)) {
      // do stuff
    }
  }
  // ...snip...
```

### Get All Route Names
```javascript
  // ...snip...
  setupController(controller, model) {
    this._super(controller, model);
    this.get('pathInspectorService.routeNames').forEach((routeName) => {
      // do stuff
    });
  }
  // ...snip...
```

### Get All Leaf Route Names
```javascript
  // ...snip...
  setupController(controller, model) {
    this._super(controller, model);
    this.get('pathInspectorService.leafRouteNames').forEach((routeName) => {
      // do other stuff
    });
  }
  // ...snip...
```

### Get Sibling Route Names
```javascript
  // ...snip...
  setupController(controller, model) {
    this._super(controller, model);
    this.get('pathInspectorService').siblingPathsForRouteName(this.get('routeName')).forEach((routeName) => {
      // do other stuff
    });
  }
  // ...snip...
```

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
