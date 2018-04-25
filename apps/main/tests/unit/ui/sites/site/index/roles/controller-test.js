import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';

import { setupTestState } from '@cenchat/core/test-support';

module('Unit | Controller | sites/site/index/roles', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);
  });

  module('getter/setter: areThereAnyRoleChanges', () => {
    test('should return true when there are role changes', function (assert) {
      assert.expect(1);

      // Arrange
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      controller.set('roleChange.admin.additions', [{ id: 'user_b' }]);

      // Act
      const result = controller.get('areThereAnyRoleChanges');

      // Assert
      assert.equal(result, true);
    });

    test('should return false when there are no role changes', function (assert) {
      assert.expect(1);

      // Arrange
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      // Act
      const result = controller.get('areThereAnyRoleChanges');

      // Assert
      assert.equal(result, false);
    });
  });

  module('function: handleSearchUserInput', () => {
    test('should categorize users with and without roles when query is provided', async function (assert) {
      assert.expect(2);

      // Arrange
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      controller.set('model', { site: await this.store.findRecord('site', 'site_a') });

      // Act
      await controller.handleSearchUserInput('user_');

      // Assert
      assert.equal(controller.get('usersWithRole.length'), 1);
      assert.equal(controller.get('usersWithoutRole.length'), 2);
    });

    test('should empty users with and without roles when query is not provided', async function (assert) {
      assert.expect(2);

      // Arrange
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      controller.set('model', { admins: ['foo'] });

      // Act
      await controller.handleSearchUserInput();

      // Assert
      assert.deepEqual(controller.get('usersWithRole'), ['foo']);
      assert.deepEqual(controller.get('usersWithoutRole'), []);
    });
  });

  module('function: handleAddRoleClick', () => {
    test('should track user for add role changes', function (assert) {
      assert.expect(1);

      // Arrange
      const user = EmberObject.create({ id: 'user_b' });
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      // Act
      controller.handleAddRoleClick(user);

      // Assert
      assert.deepEqual(controller.get('roleChange'), {
        admin: {
          additions: [user],
          removals: [],
        },
      });
    });
  });

  module('function: handleRemoveRoleClick', () => {
    test('should track user for remove role changes', function (assert) {
      assert.expect(1);

      // Arrange
      const user = EmberObject.create({ id: 'user_b' });
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      // Act
      controller.handleRemoveRoleClick(user);

      // Assert
      assert.deepEqual(controller.get('roleChange'), {
        admin: {
          additions: [],
          removals: [user],
        },
      });
    });
  });

  module('function: handleRemoveRoleChangeClick', () => {
    test('should remove user from being tracked for addition when tracked', function (assert) {
      assert.expect(1);

      // Arrange
      const user = EmberObject.create({ id: 'user_b' });
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      controller.handleAddRoleClick(user);

      // Act
      controller.handleRemoveRoleChangeClick(user);

      // Assert
      assert.deepEqual(controller.get('roleChange'), {
        admin: {
          additions: [],
          removals: [],
        },
      });
    });

    test('should remove user from being tracked for removal when tracked', function (assert) {
      assert.expect(1);

      // Arrange
      const user = EmberObject.create({ id: 'user_b' });
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      controller.handleRemoveRoleClick(user);

      // Act
      controller.handleRemoveRoleChangeClick(user);

      // Assert
      assert.deepEqual(controller.get('roleChange'), {
        admin: {
          additions: [],
          removals: [],
        },
      });
    });
  });

  module('function: handleSaveRolesClick', () => {
    test('should save roles', async function (assert) {
      assert.expect(4);

      // Arrange
      const userToAdd = EmberObject.create({ id: 'user_b' });
      const userToRemove = EmberObject.create({ id: 'user_c' });
      const controller = this.owner.lookup('controller:sites/site/index/roles');

      controller.set('model', { site: await this.store.findRecord('site', 'site_a') });
      controller.handleAddRoleClick(userToAdd);
      controller.handleRemoveRoleClick(userToRemove);

      // Act
      await controller.handleSaveRolesClick();

      // Assert
      const userBAdminDocSnapshot = await this.db
        .collection('sites')
        .doc('site_a')
        .collection('admins')
        .doc('user_b')
        .get();

      assert.ok(userBAdminDocSnapshot.exists);

      const userBSitesAsAdminDocSnapshot = await this.db
        .collection('users')
        .doc('user_b')
        .collection('sitesAsAdmin')
        .doc('site_a')
        .get();

      assert.ok(userBSitesAsAdminDocSnapshot.exists);

      const userCAdminDocSnapshot = await this.db
        .collection('sites')
        .doc('site_a')
        .collection('admins')
        .doc('user_c')
        .get();

      assert.notOk(userCAdminDocSnapshot.exists);

      const userCSitesAsAdminDocSnapshot = await this.db
        .collection('users')
        .doc('user_c')
        .collection('sitesAsAdmin')
        .doc('site_a')
        .get();

      assert.notOk(userCSitesAsAdminDocSnapshot.exists);
    });
  });
});