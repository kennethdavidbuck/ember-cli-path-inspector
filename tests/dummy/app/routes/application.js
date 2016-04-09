import BaseRoute from './base';

export default BaseRoute.extend({
  renderTemplate() {
    this._super(... this);
    this.render('application', {
      controller: this.get('controller')
    });
  }
});
