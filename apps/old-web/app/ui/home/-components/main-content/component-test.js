import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { setupTestState, spyComponent } from '@cenchat/core/test-support';

module('Integration | Component | home/-components/main-content', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);

    this.set('onHandleSignInSuccess', () => {});
  });

  test('should show <EmailLinkAuth /> when not in fastboot', async function (assert) {
    assert.expect(1);

    // Arrange
    const fastboot = this.owner.lookup('service:fastboot');

    fastboot.set('isFastBoot', false);

    const spy = spyComponent(this, 'email-link-auth');

    // Act
    await render(hbs`
      {{home/-components/main-content
          --onHandleSignInSuccess=(action onHandleSignInSuccess)}}
    `);

    // Assert
    assert.ok(spy.calledOnce);
  });

  test('should hide <EmailLinkAuth /> when in fastboot', async function (assert) {
    assert.expect(1);

    // Arrange
    const fastboot = this.owner.lookup('service:fastboot');

    fastboot.set('isFastBoot', true);

    const spy = spyComponent(this, 'email-link-auth');

    // Act
    await render(hbs`
      {{home/-components/main-content
          --onHandleSignInSuccess=(action onHandleSignInSuccess)}}
    `);

    // Assert
    assert.ok(spy.notCalled);
  });
});
