import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { setupTestState } from '@cenchat/core/test-support';

module('Integration | Component | comments/-components/comments-content', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);

    const comment = await this.store.findRecord('comment', 'comment_b');

    this.set('comment', comment);
  });

  test('should show comment', async function (assert) {
    assert.expect(5);

    // Act
    await render(hbs`{{comments/-components/comments-content --comment=comment}}`);

    // Assert
    assert.dom('[data-test-comments-content="message"]').includesText('Foobar');
    assert.dom('[data-test-comments-content="attachment"]').exists({ count: 2 });
    assert.dom('[data-test-comments-content="author-name"]').hasText('User B');
    assert.dom('[data-test-comments-content="page-title"]').hasText('Page A Title');
    assert.dom('[data-test-comments-content="page-title"]').hasAttribute(
      'href',
      'http://site-a.com/foo/bar?cenchat_comment=comment_b',
    );
  });

  test('should have medium text comment when text is within 140 - 280 chars', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.text', 'Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo');

    // Act
    await render(hbs`{{comments/-components/comments-content --comment=comment}}`);

    // Assert
    assert
      .dom('[data-test-comments-content="blockquote"]')
      .hasClass('comments-content__blockquote--medium');
  });

  test('should have small text comment when text is within > 280 chars', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.text', 'Foooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo');

    // Act
    await render(hbs`{{comments/-components/comments-content --comment=comment}}`);

    // Assert
    assert
      .dom('[data-test-comments-content="blockquote"]')
      .hasClass('comments-content__blockquote--small');
  });
});
