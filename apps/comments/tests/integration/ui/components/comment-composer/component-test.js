import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { setupTestState, spyComponent } from '@cenchat/core/test-support';

module('Integration | Component | comment-composer', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);

    const comment = await this.store.findRecord('comment', 'comment_a');

    // Preload parsed attachments
    await comment.get('parsedAttachments');

    comment.set('isTextAllowed', false);
    comment.set('isMessageValid', true);

    this.set('comment', comment);
  });

  test('should show <ComposerMessage /> when comment message valid', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.isMessageValid', true);

    const spy = spyComponent(this, 'comment-composer/comment-composer-message');

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.deepEqual(spy.componentArgsType, {
      comment: 'instance',
      onTextBoxInput: 'function',
      onRemoveAttachmentClick: 'function',
    });
  });

  test('should show <ComposerMessage /> when text comment is allowed', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.isTextAllowed', true);

    const spy = spyComponent(this, 'comment-composer/comment-composer-message');

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.deepEqual(spy.componentArgsType, {
      comment: 'instance',
      onTextBoxInput: 'function',
      onRemoveAttachmentClick: 'function',
    });
  });

  test('should hide <ComposerMessage /> when comment message is invalid and text aren\'t allowed', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.isMessageValid', false);
    this.set('comment.isTextAllowed', false);

    const spy = spyComponent(this, 'comment-composer/comment-composer-message');

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.ok(spy.notCalled);
  });

  test('should show <CommentComposerTaggedEntityList /> when there is a tagged entity', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.taggedEntities', { user_b: 'user' });

    const spy = spyComponent(this, 'comment-composer/comment-composer-tagged-entity-list');

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.deepEqual(spy.componentArgsType, {
      entities: 'instance',
      onUntagEntityClick: 'function',
    });
  });

  test('should hide <CommentComposerTaggedEntityList /> when there are no tagged entities', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.taggedEntities', null);

    const spy = spyComponent(this, 'comment-composer/comment-composer-tagged-entity-list');

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.ok(spy.notCalled);
  });

  test('should show <ComposerToolbar />', async function (assert) {
    assert.expect(1);

    // Arrange
    const spy = spyComponent(this, 'components/comment-composer/comment-composer-toolbar');

    // Act
    await render(hbs` {{comment-composer --comment=comment}}`);

    // Assert
    assert.deepEqual(spy.componentArgsType, {
      comment: 'instance',
      onAddAttachmentClick: 'function',
      onAskMeAnythingClick: 'function',
      onSendCommentClick: 'function',
      onTagEntityClick: 'function',
    });
  });

  test('should add attachment when clicking it', async function (assert) {
    assert.expect(1);

    // Arrange
    await render(hbs`{{comment-composer --comment=comment}}`);
    await click('[data-test-composer-toolbar="sticker-button"]');

    // Act
    await click('[data-test-toolbar-sticker-panel="sticker-button__sticker_a1"]');

    // Assert
    assert.dom('[data-test-message-image="attachment-image"]').exists({ count: 3 });
  });

  test('should limit adding of attachments to 4 items', async function (assert) {
    assert.expect(1);

    // Arrange
    await render(hbs`{{comment-composer --comment=comment}}`);
    await click('[data-test-composer-toolbar="sticker-button"]');

    // Act
    await click('[data-test-toolbar-sticker-panel="sticker-button__sticker_a1"]');
    await click('[data-test-toolbar-sticker-panel="sticker-button__sticker_a1"]');
    await click('[data-test-toolbar-sticker-panel="sticker-button__sticker_a1"]');
    await click('[data-test-toolbar-sticker-panel="sticker-button__sticker_a1"]');
    await click('[data-test-toolbar-sticker-panel="sticker-button__sticker_a1"]');

    // Assert
    assert.dom('[data-test-message-image="attachment-image"]').exists({ count: 4 });
  });

  test('should remove attachment when clicking the its remove button', async function (assert) {
    assert.expect(1);

    // Arrange
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Act
    await click('[data-test-message-image="remove-attachment-button"]');

    // Assert
    assert.dom('[data-test-message-image="attachment-image"]').exists({ count: 1 });
  });

  test('should disable send button when comment message is invalid', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.isMessageValid', false);

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.dom('[data-test-composer-toolbar="send-button"]').hasAttribute('disabled');
  });

  test('should enable send button when comment is valid', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.isMessageValid', true);

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.dom('[data-test-composer-toolbar="send-button"]').doesNotHaveAttribute('disabled');
  });

  test('should show hint when text comment isn\'t allowed', async function (assert) {
    assert.expect(1);

    // Assert
    this.set('comment.isTextAllowed', false);

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.dom('[data-test-comment-composer="hint"]').exists();
  });

  test('should hide hint when text comment is allowed', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('comment.isTextAllowed', true);

    // Act
    await render(hbs`{{comment-composer --comment=comment}}`);

    // Assert
    assert.dom('[data-test-comment-composer="hint"]').doesNotExist();
  });
});
