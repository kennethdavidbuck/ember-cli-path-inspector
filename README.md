# ember-cli-path-inspector

RouteInspector acquires a list of your applications paths at run time and constructs a parallel tree of nodes for querying. This allows you to ask questions about your applications routes without having to probe them directly. You can now use this service throughout your application to answer different questions such as:

- Is a given routeName for a leaf route?
- Is a given route a leaf route?
- What are all of the application leaf routeNames?
- What are the routeNames of all siblings for a given routeName?
- What is the parent routeName for a given routeName
- What are the children routeNames for a given routName

## Basic Usage - Some Contrived Examples

### Inspect for Leaf Routes
```javascript
  // A route
  // ...snip...
  setupController(controller, model) {
   this._super(controller, model);
    if(this.get('pathInspectorService').isLeafRouteName(this.get('routeName')) {
      // do stuff
    }
    
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

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
