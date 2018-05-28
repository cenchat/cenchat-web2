import Component from '@ember/component';

/**
 * @class SitePageMainContentComments
 * @namespace Component
 * @extends Ember.Component
 */
export default Component.extend({
  /**
   * @override
   */
  tagName: '',

  /**
   * @override
   */
  init(...args) {
    this._super(...args);

    if (this.get('--comments.length') === 0 && this.get('--filterCommentsBy') === 'relevance') {
      this.get('--onFilterCommentsClick')('all');
    }
  },

  /**
   * @param {number} newLimit
   * @return {Promise} Resolves when the comments query has been updated
   * @function
   */
  async handleLoadMoreCommentsClick(newLimit) {
    this.set('--comments.query.limit', newLimit);

    console.log(this.get('--comments'));

    return this.get('--comments').update();
  },
});
