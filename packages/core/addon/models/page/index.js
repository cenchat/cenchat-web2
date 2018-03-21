import { belongsTo } from 'ember-data/relationships';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

/**
 * @class Page
 * @namespace Model
 * @extends DS.Model
 */
export default Model.extend({
  /**
   * @type {Date}
   */
  createdOn: attr('timestamp'),

  /**
   * @type {string}
   */
  description: attr('string'),

  /**
   * @type {string}
   */
  imageUrl: attr('string'),

  /**
   * @type {string}
   */
  slug: attr('string'),

  /**
   * @type {string}
   */
  title: attr('string'),

  /**
   * @type {Model.Site}
   */
  site: belongsTo('site'),

  /**
   * @type {Ember.Service}
   * @readonly
   */
  session: inject(),

  /**
   * @type {string}
   * @readonly
   */
  decodedSlug: computed('slug', {
    get() {
      return decodeURIComponent(this.get('slug'));
    },
  }),

  /**
   * Loads filtered comments
   *
   * @param {string} filterBy
   * @return {Promise} Comments
   */
  async loadFilteredComments(filterBy) {
    const pageId = this.get('id');

    if (filterBy === 'all') {
      return await this.get('store').query('comment', {
        queryId: `${this.get('id')}_all_comments`,

        filter(reference) {
          const db = reference.firestore;

          return reference
            .where('page', '==', db.collection('pages').doc(pageId))
            .orderBy('createdOn')
            .limit(2);
        },
      });
    }

    const sessionId = this.get('session.model.id');

    return await this.get('store').query('comment', {
      queryId: `${this.get('id')}_${sessionId}_relevant_comments`,

      buildReference(db) {
        return db
          .collection('users')
          .doc(sessionId)
          .collection('followingComments');
      },

      filter(reference) {
        const db = reference.firestore;
        return reference
          .where('page', '==', db.collection('pages').doc(pageId))
          .orderBy('createdOn')
          .limit(2);
      },
    });
  },
});
