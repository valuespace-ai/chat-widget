import React from 'react';

const CustomAudioAttachment = ({ attachment }) => {
  // Support both contentUrl (for audio/webm, audio/mp3, etc.)
  const url = attachment.contentUrl || (attachment.content && attachment.content.media && attachment.content.media[0] && attachment.content.media[0].url);

  if (!url) return null;

  return (
    <audio controls style={{ width: '100%' }}>
      <source src={url} type={'audio/webm'} />
      Your browser does not support the audio element.
    </audio>
  );
};

export default CustomAudioAttachment;
