import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { setupTestState, spyComponent } from '@cenchat/core/test-support';
import sinon from 'sinon';

module('Integration | Component | site/page/-components/main-content/main-content-page-comments', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await setupTestState(this);

    const comments = await this.store.query('comment', {
      filter(reference) {
        return reference.limit(2);
      },
    });

    this.set('comments', comments);
    this.set('prioritizedComments', []);
    this.set('filterCommentsBy', 'relevance');
    this.set('pageUrl', 'http://foobar.com');
    this.set('onFilterCommentsClick', () => {});
  });

  test('should show <CommentList />', async function (assert) {
    assert.expect(1);

    // Arrange
    const spy = spyComponent(this, 'comment-list');

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert.deepEqual(spy.componentArgsType, {
      comments: 'instance',
      prioritizedComments: 'array',
      emptyStateMessage: 'string',
      threadLevel: 'number',
      onLoadMoreCommentsClick: 'function',
    });
  });

  test('should show filter comments button when signed in', async (assert) => {
    assert.expect(1);

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert.dom('[data-test-main-content-page-comments="filter-comments-button"]').exists();
  });

  test('should hide filter comments button when signed out', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('session.model', null);

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert.dom('[data-test-main-content-page-comments="filter-comments-button"]').doesNotExist();
  });

  test('should show active class for filter by relevance to you button when comments are filtered by relevance', async (assert) => {
    assert.expect(1);

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert
      .dom('[data-test-main-content-page-comments="filter-comments-by-relevance-button"]')
      .hasClass('list-item__action--active');
  });

  test('should hide active class for filter by relevance to you button when comments aren\'t filtered by relevance', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('filterCommentsBy', 'all');

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert
      .dom('[data-test-main-content-page-comments="filter-comments-by-relevance-button"]')
      .doesNotHaveClass('list-item__action--active');
  });

  test('should show active class for filter by all button when comments are filtered by all', async function (assert) {
    assert.expect(1);

    // Arrange
    this.set('filterCommentsBy', 'all');

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert
      .dom('[data-test-main-content-page-comments="filter-comments-by-all-button"]')
      .hasClass('list-item__action--active');
  });

  test('should hide active class for filter by all button when comments aren\'t filtered by all', async (assert) => {
    assert.expect(1);

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert
      .dom('[data-test-main-content-page-comments="filter-comments-by-all-button"]')
      .doesNotHaveClass('list-item__action--active');
  });

  test('should fire an external action when rendering while there are no comments filtered by relevance', async function (assert) {
    assert.expect(1);

    // Assert
    const spy = sinon.spy(this, 'onFilterCommentsClick');

    this.set('comments', []);

    // Act
    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Assert
    assert.ok(spy.calledWith('all'));
  });

  test('should fire an external action when clicking filter by relevance to you', async function (assert) {
    assert.expect(1);

    // Arrange
    const spy = sinon.spy(this, 'onFilterCommentsClick');

    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Act
    await click('[data-test-main-content-page-comments="filter-comments-button"]');
    await click('[data-test-main-content-page-comments="filter-comments-by-relevance-button"]');

    // Assert
    assert.ok(spy.calledWith('relevance'));
  });

  test('should fire an external action when clicking filter by all', async function (assert) {
    assert.expect(1);

    // Arrange
    const spy = sinon.spy(this, 'onFilterCommentsClick');

    await render(hbs`
      {{site/page/-components/main-content/main-content-page-comments
          --session=session
          --comments=comments
          --prioritizedComments=prioritizedComments
          --filterCommentsBy=filterCommentsBy
          --pageUrl=pageUrl
          --onFilterCommentsClick=(action onFilterCommentsClick)}}
    `);

    // Act
    await click('[data-test-main-content-page-comments="filter-comments-button"]');
    await click('[data-test-main-content-page-comments="filter-comments-by-all-button"]');

    // Assert
    assert.ok(spy.calledWith('all'));
  });
});