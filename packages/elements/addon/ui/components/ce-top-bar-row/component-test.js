import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ce-top-bar-row', (hooks) => {
  setupRenderingTest(hooks);

  test('should render yield', async function (assert) {
    assert.expect(1);

    // Act
    await this.render(hbs`
      {{#ce-top-bar-row data-test="host"}}Foo{{/ce-top-bar-row}}
    `);

    // Assert
    assert.dom('[data-test="host"]').hasText('Foo');
  });
});
