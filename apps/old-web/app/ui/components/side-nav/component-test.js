import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | side-nav', (hooks) => {
  setupRenderingTest(hooks);

  test('should show yield', async function (assert) {
    assert.expect(1);

    // Act
    await render(hbs`
      {{#side-nav}}
        <div data-test-side-nav="yield"></div>
      {{/side-nav}}
    `);

    // Assert
    assert.dom('[data-test-side-nav="yield"]').exists();
  });
});


module('Unit | Component | side-nav', (hooks) => {
  setupTest(hooks);

  test('nothing to test so far', (assert) => {
    assert.ok(true);
  });
});
