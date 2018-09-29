import { run } from '@ember/runloop';
import Service from '@ember/service';

import MockFirebase from 'mock-cloud-firestore';
import sinon from 'sinon';

import { initialize as initializeWindowOverrides } from '@cenchat/core/initializers/window-overrides';
import { stubService, stubSession } from './stub-service';
import getFixtureData from '../fixture-data';

/**
 * @param {Object} owner
 * @param {Object} fixtureData
 * @return {Ember.Service} Firebase service
 * @function
 */
function mockCloudFirestore(owner, fixtureData) {
  const mockFirebase = new MockFirebase();

  const mockFirebasePojo = {
    _data: fixtureData,
    initializeApp: mockFirebase.initializeApp,
    firestore: mockFirebase.firestore,
  };
  const firebaseService = Service.extend(mockFirebasePojo);

  owner.register('service:firebase', firebaseService);

  return owner.lookup('service:firebase', { as: 'firebase' });
}

/**
 * @param {Object} context
 * @function
 */
export async function setupTestState(context) {
  initializeWindowOverrides(context.owner);
  stubService(context, 'firebaseui', { startAuthUi() {}, resetAuthUi() {} });

  context.set('firebase', mockCloudFirestore(context.owner, getFixtureData()));
  context.set('firebase.auth', () => ({ isSignInWithEmailLink: sinon.stub().returns(false) }));
  context.set('db', context.firebase.firestore());
  context.set('router', stubService(context, 'router', { transitionTo() {}, urlFor() {} }));
  context.set('session', stubSession(context));

  const store = context.owner.lookup('service:store');

  context.set('store', store);

  const db = context.firebase.firestore();

  await store.getAll('chat', {
    fetch: () => db.collection('chats').get().then(snap => snap.docs),
  });
  await store.getAll('page', {
    fetch: () => db.collection('pages').get().then(snap => snap.docs),
  });
  await store.getAll('message', {
    fetch: () => db.collection('messages').get().then(snap => snap.docs),
  });
  await store.getAll('site', {
    fetch: () => db.collection('sites').get().then(snap => snap.docs),
  });
  await store.getAll('sticker', {
    fetch: () => db.collection('stickers').get().then(snap => snap.docs),
  });
  await store.getAll('stickerPack', {
    fetch: () => db.collection('stickerPacks').get().then(snap => snap.docs),
  });
  await store.getAll('userMetaInfo', {
    fetch: () => db.collection('userMetaInfos').get().then(snap => snap.docs),
  });
  await store.getAll('user', {
    fetch: () => db.collection('users').get().then(snap => snap.docs),
  });

  const user = await db.doc('users/user_a').get();

  context.set('session.content.model', { ...user.data(), id: user.id });
  context.store.subscribe(async () => (
    context.set('session.content.model', await context.store.get('user', user.id))
  ));
}

/**
 * @param {Object} context
 * @function
 */
export async function setupApplicationTestState(context) {
  context.set('firebase', mockCloudFirestore(context.owner, getFixtureData()));
  context.set('firebase.messaging', () => ({
    onTokenRefresh(callback) {
      return callback();
    },

    getToken() {
      return Promise.resolve('token_a');
    },

    requestPermission() {
      return Promise.resolve();
    },
  }));
  context.set('firebase.auth', () => ({
    signOut() {
      return Promise.resolve();
    },
  }));
  context.set('db', context.firebase.firestore());

  const session = context.owner.lookup('service:session');
  const { stateMachine } = session;

  run(() => {
    stateMachine.send('startOpen');
    stateMachine.send('finishOpen', {
      currentUser: {
        displayName: 'User A',
        email: 'user_a@gmail.com',
        isAnonymous: false,
        photoURL: 'user_a.jpg',
        providerData: [
          {
            displayName: 'User A',
            photoURL: 'user_a.jpg',
            providerId: 'facebook.com',
          },
        ],
        uid: 'user_a',

        getIdToken() {
          return Promise.resolve(12345);
        },

        updateProfile() {},
      },
      isAuthenticated: true,
    });
  });
}
