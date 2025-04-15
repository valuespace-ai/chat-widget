// Rename this file to .jsx if you use JSX syntax in the middleware below.
import React from 'react';
import CustomAudioAttachment from './CustomAudioAttachment';

/**
 * Attachment middleware: handles audio and wraps in user/bot bubble
 * @param {object} styleOptions
 * @returns {function}
 */
export function AttachmentMiddleware(styleOptions) {
  return () => next => card => {
    const { attachment, activity } = card;
    if (!attachment) return next(card);

    // 1. Skip wrapping if adaptive card or text/plain
    if (
      attachment.contentType === 'application/vnd.microsoft.card.adaptive' ||
      attachment.contentType === 'text/plain'
    ) {
      return next(card);
    }

    // Calculate className
    const isUser = activity && activity.from && activity.from.role === 'user';
    const className = isUser ? 'user_attachment' : 'bot_attachment';

    // 2. Audio attachment: render custom audio inside bubble
    if (
      attachment.contentType &&
      (attachment.contentType.startsWith('audio/') || attachment.contentType === 'application/vnd.microsoft.card.audio')
    ) {
      return <div className={className}><CustomAudioAttachment attachment={attachment} /></div>;
    }

    return <div className={className}>{next(card)}</div>;
  };
}
