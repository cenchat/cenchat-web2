/* eslint no-await-in-loop: 'off' */

import { hasMany } from 'ember-data/relationships';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

import { promiseObject } from '@cenchat/core/utils/computed-promise';

/**
 * @class User
 * @namespace Model
 * @extends DS.Model
 */
export default Model.extend({
  /**
   * @type {string}
   */
  displayName: attr('string'),

  /**
   * @type {string}
   */
  displayUsername: attr('string'),

  /**
   * @type {string}
   */
  facebookId: attr('string'),

  /**
   * @type {string}
   */
  photoUrl: attr('string'),

  /**
   * Lower cased version of `displayUsername`
   *
   * @type {string}
   */
  username: attr('string'),

  /**
   * @type {Array.<Model.User>}
   */
  followers: hasMany('user', {
    inverse: 'followings',

    filter(reference) {
      return reference.limit(8);
    },
  }),

  /**
   * @type {Array.<Model.User>}
   */
  followings: hasMany('user', {
    inverse: 'followers',

    filter(reference) {
      return reference.limit(8);
    },
  }),

  /**
   * @type {Array.<Model.Notification>}
   */
  notifications: hasMany('notification', {
    inverse: 'to',

    filter(reference) {
      return reference.limit(10);
    },
  }),

  /**
   * @type {Array.<Model.Site>}
   */
  sitesAsAdmin: hasMany('site', {
    inverse: 'admins',

    filter(reference) {
      return reference.limit(8);
    },
  }),

  /**
   * @type {Array.<Model.StickerPack>}
   */
  stickerPacks: hasMany('sticker-pack'),

  /**
   * @type {Ember.Service}
   * @readonly
   */
  firebase: inject(),

  /**
   * @type {Model.BetaTester}
   */
  betaTester: promiseObject(context => (
    context.get('store').findRecord('betaTester', context.get('id'))
  )),

  /**
   * @type {Model.UserMetaInfo}
   */
  metaInfo: promiseObject(context => (
    context.get('store').findRecord('userMetaInfo', context.get('id'))
  )),

  /**
   * @type {string}
   */
  urlKey: computed('username', {
    get() {
      return this.get('username') || this.get('id');
    },
  }),

  /**
   * Checks if current user is following the userId
   *
   * @param {string} userId
   * @return {Promise} Resolves to true if following userId. Otherwise, false.
   */
  async isFollowing(userId) {
    const db = this.get('firebase').firestore();
    const following = await db
      .collection('users')
      .doc(this.get('id'))
      .collection('followings')
      .doc(userId)
      .get();

    return following.exists;
  },

  /**
   * Checks if the user has `userId` as a follower
   *
   * @param {string} userId
   * @return {Promise.<boolean>} Resolves to true if is a follower. Otherwise, false.
   */
  async hasFollower(userId) {
    const db = this.get('firebase').firestore();
    const follower = await db
      .collection('users')
      .doc(this.get('id'))
      .collection('followers')
      .doc(userId)
      .get();

    return follower.exists;
  },

  /**
   * Checks if the user is a site admin of `siteId`
   *
   * @param {string} siteId
   * @return {Promise.<boolean>} Resolves to true if is a site admin. Otherwise, false.
   */
  async isSiteAdmin(siteId) {
    const db = this.get('firebase').firestore();

    try {
      const admin = await db
        .collection('sites')
        .doc(siteId)
        .collection('admins')
        .doc(this.get('id'))
        .get();

      return admin.exists;
    } catch (error) {
      return false;
    }
  },

  /**
   * Fetches unfollowed Facebook friends
   *
   * @param {number} limit
   * @return {Array.<Model.User>} Unfollowings
   */
  async getUnfollowedFacebookFriends(limit) {
    const facebookId = this.get('facebookId');
    const userMetaInfo = await this.get('metaInfo');
    const url = `https://graph.facebook.com/v2.12/${facebookId}/friends?access_token=${userMetaInfo.get('facebookAccessToken')}&limit=5000`;
    const response = await fetch(url);
    const { data } = await response.json();
    const unfollowings = [];

    for (const { id } of data) {
      const friends = await this.get('store').query('user', {
        filter(reference) {
          return reference.where('facebookId', '==', id).limit(1);
        },
      });
      const friend = friends.get('firstObject');

      if (!await this.isFollowing(friend.get('id'))) {
        unfollowings.push(friend);
      }

      if (unfollowings.length >= limit) {
        break;
      }
    }

    return unfollowings;
  },
});
