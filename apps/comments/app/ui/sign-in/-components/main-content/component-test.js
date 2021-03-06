import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { setupTestState, spyComponent } from '@cenchat/core/test-support';

module('Integration | Component | sign-in/-components/main-content', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);
  });

  test('should show <EmailLinkAuth />', async function (assert) {
    assert.expect(1);

    // Arrange
    const spy = spyComponent(this, 'email-link-auth');

    // Act
    await render(hbs`{{sign-in/-components/main-content}}`);

    // Assert
    assert.deepEqual(spy.componentArgsType, { redirectUrl: 'null' });
  });
});
