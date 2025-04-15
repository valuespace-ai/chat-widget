import React from 'react';

/**
 * ActivityMiddleware provides middleware for highlighting user and bot messages
 */
const ActivityMiddleware = {
  /**
   * Creates activity middleware for highlighting user and bot messages
   * @param {boolean} userHighlighting - Whether to enable highlighting
   * @returns {function|undefined} - Activity middleware or undefined if highlighting is disabled
   */
  createHighlightingMiddleware: (userHighlighting) => {
    if (!userHighlighting) return undefined;

    return () => next => (...setupArgs) => {
      const render = next(...setupArgs);

      if (render) {
        return (...renderArgs) => {
          const element = render(...renderArgs);
          const [card] = setupArgs;
          return element && <div className={card.activity.from.role === 'user' ? 'highlightedActivity--user' : 'highlightedActivity--bot'}>{element}</div>;
        };
      }
    };
  }
};

export default ActivityMiddleware;
