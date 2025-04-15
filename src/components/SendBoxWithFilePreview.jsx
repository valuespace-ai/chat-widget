// Custom implementation for file upload preview
import React, { useEffect, useState } from 'react';

// Create a custom SendBox component that shows file previews
export const SendBoxWithFilePreview = ({ sendBoxProps }) => {
    const {
        attachments,
        onAttachmentSend,
        onButtonClick,
        onTextChange,
        onSubmit,
        text,
        ...restSendBoxProps
    } = sendBoxProps;

    // Maintain local state of attachments
    const [fileAttachments, setFileAttachments] = useState([]);

    // Update the local state when attachments change
    useEffect(() => {
        // Filter out only file attachments
        const newFileAttachments = attachments.filter(
            attachment => attachment.contentType.startsWith('file-')
        );

        setFileAttachments(newFileAttachments);
    }, [attachments]);

    // Render previews for file attachments
    const renderFilePreview = () => {
        if (fileAttachments.length === 0) return null;

        return (
            <div className="webchat-file-previews">
                <div className="webchat-file-preview-header">
                    <span>Selected files ({fileAttachments.length})</span>
                </div>

                {fileAttachments.map((attachment, index) => {
                    const file = attachment.content;
                    return (
                        <div key={index} className="webchat-file-preview-item">
                            {/* File icon based on type */}
                            <div className="webchat-file-preview-icon">
                                {getFileIcon(file.type)}
                            </div>

                            {/* File details */}
                            <div className="webchat-file-preview-details">
                                <div className="webchat-file-preview-name" title={file.name}>
                                    {file.name}
                                </div>
                                <div className="webchat-file-preview-size">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>

                            {/* Remove button */}
                            <button
                                className="webchat-file-preview-remove"
                                onClick={() => {
                                    // Remove this attachment
                                    const newAttachments = [...attachments];
                                    newAttachments.splice(index, 1);

                                    // Update attachments in WebChat
                                    onAttachmentSend(newAttachments);
                                }}
                                aria-label="Remove file"
                                title="Remove file"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}

                {/* Optional: Image previews */}
                {fileAttachments.some(attachment =>
                    attachment.content.type.startsWith('image/')) && (
                        <div className="webchat-file-image-previews">
                            {fileAttachments
                                .filter(attachment => attachment.content.type.startsWith('image/'))
                                .map((attachment, index) => {
                                    const file = attachment.content;
                                    return (
                                        <div key={`img-${index}`} className="webchat-file-image-preview">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                onLoad={(e) => {
                                                    // Clean up the object URL after loading
                                                    setTimeout(() => {
                                                        URL.revokeObjectURL(e.target.src);
                                                    }, 1000);
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    )}
            </div>
        );
    };

    return (
        <div className="webchat-custom-send-box-container">
            {/* Render the original SendBox */}
            <div
                {...restSendBoxProps}
                className={(restSendBoxProps.className || '') + ' webchat-custom-send-box'}
            >
                <input
                    className="webchat-send-box-text-box"
                    onChange={onTextChange}
                    onKeyPress={event => {
                        if (event.key === 'Enter') {
                            onSubmit();
                        }
                    }}
                    placeholder="Type your message"
                    type="text"
                    value={text}
                />
                <button
                    className="webchat-send-box-button"
                    onClick={onButtonClick}
                    title="Send"
                    type="button"
                >
                    Send
                </button>
            </div>

            {/* Render file previews */}
            {renderFilePreview()}
        </div>
    );
};

// Helper function to get an icon based on file type
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
        return <span role="img" aria-label="Image">🖼️</span>;
    } else if (fileType.startsWith('video/')) {
        return <span role="img" aria-label="Video">🎬</span>;
    } else if (fileType.startsWith('audio/')) {
        return <span role="img" aria-label="Audio">🔊</span>;
    } else if (fileType.includes('pdf')) {
        return <span role="img" aria-label="PDF">📄</span>;
    } else if (fileType.includes('word') || fileType.includes('document')) {
        return <span role="img" aria-label="Document">📝</span>;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        return <span role="img" aria-label="Spreadsheet">📊</span>;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        return <span role="img" aria-label="Presentation">📊</span>;
    } else {
        return <span role="img" aria-label="File">📁</span>;
    }
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}