import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('site', { path: '/sites/:site_id' }, function() {
    this.route('page', { path: '/pages/:page_id' }, function() {
      this.route('comments');
    });
  });
  this.route('sign-in');
});

export default Router;
