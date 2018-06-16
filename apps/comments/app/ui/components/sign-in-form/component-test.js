import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import hbs from 'htmlbars-inline-precompile';

import { setupTestState, stubPromise } from '@cenchat/core/test-support';
import sinon from 'sinon';

module('Integration | Component | sign-in-form', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);
  });

  test('should show additional sign in info when clicking show additional info', async function (assert) {
    assert.expect(1);

    // Arrange
    await render(hbs`{{sign-in-form}}`);

    // Act
    await click('[data-test-sign-in-form="show-additional-info-button"]');

    // Assert
    assert.dom('[data-test-sign-in-form="additional-info"]').exists();
  });

  test('should hide additional sign in info by default', async function (assert) {
    assert.expect(1);

    // Act
    await render(hbs`{{sign-in-form}}`);

    // Assert
    assert.dom('[data-test-sign-in-form="additional-info"]').doesNotExist();
  });
});

module('Unit | Component | sign-in-form', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.session = ObjectProxy.create({
      content: EmberObject.create({
        currentUser: {
          uid: 'user_a',
          displayName: 'User A',
          photoURL: 'user_a.jpg',
          providerData: [{ providerId: 'facebook.com', uid: '12345' }],
        },
      }),
      fetch: sinon.stub().returns(stubPromise(true)),

      close() {},
    });
  });

  module('function: getOrCreateCurrentUserRecord', () => {
    test('should fetch current user record', async function (assert) {
      assert.expect(1);

      // Arrange
      const user = EmberObject.create({ displayName: 'User A' });
      const store = EmberObject.create({
        findRecord: sinon.stub().withArgs('user', 'user_a').returns(stubPromise(true, user)),
      });
      const factory = this.owner.factoryFor('component:sign-in-form');
      const component = await factory.create();

      component.set('session', this.session);
      component.set('store', store);

      // Act
      await component.getOrCreateCurrentUserRecord();

      // Assert
      assert.deepEqual(component.get('session.model'), user);
    });

    test('should create current user record when it does not exist yet', async function (assert) {
      assert.expect(2);

      // Arrange
      const saveStub = sinon.stub().returns(stubPromise(true));
      const user = EmberObject.create({
        displayName: 'User A',
        save: saveStub,
      });
      const store = EmberObject.create({
        createRecord: sinon.stub().withArgs('user', {
          id: 'user_a',
          displayName: 'User A',
          displayUsername: null,
          facebookId: null,
          name: 'user a',
          photoUrl: 'user_a.jpg',
          username: null,
        }).returns(user),
        findRecord: sinon.stub().withArgs('user', 'user_a').returns(stubPromise(false, {
          message: 'Document doesn\'t exist',
        })),
      });
      const factory = this.owner.factoryFor('component:sign-in-form');
      const component = await factory.create();

      component.set('session', this.session);
      component.set('store', store);

      // Act
      await component.getOrCreateCurrentUserRecord();

      // Assert
      assert.ok(saveStub.calledOnce);
      assert.deepEqual(component.get('session.model'), user);
    });

    test('should close session when feching the current user record throws a non document not existing error', async function (assert) {
      assert.expect(1);

      // Arrange
      const closeSpy = sinon.spy(this.session, 'close');
      const store = EmberObject.create({
        findRecord: sinon.stub().withArgs('user', 'user_a').returns(stubPromise(false, {})),
      });
      const factory = this.owner.factoryFor('component:sign-in-form');
      const component = await factory.create();

      component.set('session', this.session);
      component.set('store', store);

      // Act
      await component.getOrCreateCurrentUserRecord();

      // Assert
      assert.ok(closeSpy.calledOnce);
    });

    test('should close session when feching the current user record throws a non document not existing error', async function (assert) {
      assert.expect(1);

      // Arrange
      const closeSpy = sinon.spy(this.session, 'close');
      const user = EmberObject.create({
        displayName: 'User A',
        save: sinon.stub().returns(stubPromise(false)),
      });
      const store = EmberObject.create({
        createRecord: sinon.stub().withArgs('user', {
          id: 'user_a',
          displayName: 'User A',
          displayUsername: null,
          facebookId: null,
          name: 'user a',
          photoUrl: 'user_a.jpg',
          username: null,
        }).returns(user),
        findRecord: sinon.stub().withArgs('user', 'user_a').returns(stubPromise(false, {
          message: 'Document doesn\'t exist',
        })),
      });
      const factory = this.owner.factoryFor('component:sign-in-form');
      const component = await factory.create();

      component.set('session', this.session);
      component.set('store', store);

      // Act
      await component.getOrCreateCurrentUserRecord();

      // Assert
      assert.ok(closeSpy.calledOnce);
    });
  });
});
