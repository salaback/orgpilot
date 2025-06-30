import React, { useState, useRef, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Note {
  id: number;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: Array<{id: number, name: string}>;
}

interface NotesSectionProps {
  notes: Note[];
  entityType: string;
  entityId: number;
  orgNodes?: Array<{id: number, first_name: string, last_name: string, email: string}>;
  onNotesUpdate?: (notes: Note[]) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  notes = [],
  entityId,
  orgNodes = []
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [detectedMentions, setDetectedMentions] = useState<Array<{id: number, name: string}>>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{id: number, first_name: string, last_name: string, email: string}>>([]);
  const [currentMentionQuery, setCurrentMentionQuery] = useState('');
  const textareaRef = useRef<HTMLDivElement>(null);

  // Extract hashtags from content
  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#([^\s\t]+)(?=\s|\t|$)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  // Extract mentions from content
  const extractMentions = (text: string): Array<{id: number, name: string}> => {
    const mentionRegex = /@([^\s\t]+)(?=\s|\t|$)/g;
    const matches = text.match(mentionRegex);
    const mentions: Array<{id: number, name: string}> = [];

    if (matches) {
      matches.forEach(match => {
        const mentionName = match.substring(1); // Remove @
        // Try to find matching org node
        const foundNode = orgNodes.find(node =>
          `${node.first_name}${node.last_name}`.toLowerCase().replace(/\s/g, '') === mentionName.toLowerCase() ||
          `${node.first_name}.${node.last_name}`.toLowerCase() === mentionName.toLowerCase() ||
          node.first_name.toLowerCase() === mentionName.toLowerCase() ||
          node.last_name.toLowerCase() === mentionName.toLowerCase()
        );

        if (foundNode) {
          mentions.push({
            id: foundNode.id,
            name: `${foundNode.first_name} ${foundNode.last_name}`.trim()
          });
        }
      });
    }

    return mentions;
  };

  // Get mention suggestions based on current input
  const getMentionSuggestions = (query: string) => {
    if (!query || query.length < 2) return [];

    const results = orgNodes.filter(node => {
      // Add null checks for all fields
      const firstName = node.first_name?.toLowerCase() || '';
      const lastName = node.last_name?.toLowerCase() || '';
      const email = node.email?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const searchQuery = query.toLowerCase();

      return firstName.startsWith(searchQuery) ||
             lastName.startsWith(searchQuery) ||
             fullName.startsWith(searchQuery) ||
             firstName.includes(searchQuery) ||
             lastName.includes(searchQuery) ||
             email.includes(searchQuery);
    }).slice(0, 5);

    return results;
  };

  // Process content to replace hashtags and mentions with styled spans for display
  const processContentForDisplay = (content: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combined regex for both hashtags and mentions
    const combinedRegex = /(#[^\s\t]+|@[^\s\t]+)(?=\s|\t|$)/g;
    let match;

    while ((match = combinedRegex.exec(content)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      if (match[1].startsWith('#')) {
        // Handle hashtag
        parts.push(
          <span
            key={`tag-${match.index}`}
            style={{
              color: '#667eea',
              fontWeight: 600,
              marginRight: '4px'
            }}
          >
            {match[1]}
          </span>
        );
      } else if (match[1].startsWith('@')) {
        // Handle mention - check if it's a valid org node
        const mentionName = match[1].substring(1);
        const foundNode = orgNodes.find(node =>
          `${node.first_name}${node.last_name}`.toLowerCase().replace(/\s/g, '') === mentionName.toLowerCase() ||
          `${node.first_name}.${node.last_name}`.toLowerCase() === mentionName.toLowerCase() ||
          node.first_name.toLowerCase() === mentionName.toLowerCase() ||
          node.last_name.toLowerCase() === mentionName.toLowerCase()
        );

        parts.push(
          <span
            key={`mention-${match.index}`}
            style={{
              color: foundNode ? '#28a745' : '#666',
              fontWeight: foundNode ? 700 : 600,
              marginRight: '4px'
            }}
          >
            {match[1]}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };


  // Handle content change and tag detection for contenteditable div
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    setNewNote({ ...newNote, content: newContent });

    // Extract and update detected tags
    const tags = extractHashtags(newContent);
    setDetectedTags(tags);

    // Extract and update detected mentions
    const mentions = extractMentions(newContent);
    setDetectedMentions(mentions);

    // Check for active @ mention typing
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;

      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const textContent = textNode.textContent || '';
        const cursorPosition = range.startOffset;

        // Look for @ symbol before cursor
        const textBeforeCursor = textContent.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
          const mentionQuery = textBeforeCursor.substring(lastAtIndex + 1);

          // Check if we have at least 2 characters after @ and no spaces
          if (mentionQuery.length >= 2 && !mentionQuery.includes(' ') && !mentionQuery.includes('\t')) {
            const suggestions = getMentionSuggestions(mentionQuery);
            setMentionSuggestions(suggestions);
            setCurrentMentionQuery(mentionQuery);
            setShowMentionSuggestions(true);
          } else if (mentionQuery.length < 2) {
            setShowMentionSuggestions(false);
          }
        } else {
          setShowMentionSuggestions(false);
        }
      }
    }
  };

  // Handle key events for contenteditable div
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Allow normal text editing behavior
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow Shift+Enter for new lines
      return;
    }

    // Handle navigation through mention suggestions
    if (showMentionSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // TODO: Implement navigation through suggestions
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // TODO: Implement selection of suggestion
      }
    }
  };

  // Process content to create HTML with inline bold hashtags and mentions
  const createInlineStyledContent = (content: string): string => {
    const hashtagRegex = /#([^\s\t]+)(?=\s|\t|$)/g;
    const mentionRegex = /@([^\s\t]+)(?=\s|\t|$)/g;

    // First replace hashtags
    let styledContent = content.replace(hashtagRegex, (match, tagName) => {
      return `<strong style="color: #667eea; font-weight: 600;">#${tagName}</strong>`;
    });

    // Then replace mentions
    styledContent = styledContent.replace(mentionRegex, (match, mentionName) => {
      return `<strong style="color: #28a745; font-weight: 600;">@${mentionName}</strong>`;
    });

    return styledContent;
  };

  // Effect to update contenteditable div content with bold hashtags and mentions
  useEffect(() => {
    if (textareaRef.current && newNote.content) {
      const selection = window.getSelection();
      const currentRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const currentOffset = currentRange ? currentRange.startOffset : 0;
      const currentContainer = currentRange ? currentRange.startContainer : null;

      const styledContent = createInlineStyledContent(newNote.content);

      if (textareaRef.current.innerHTML !== styledContent) {
        textareaRef.current.innerHTML = styledContent;

        // Restore cursor position more carefully
        try {
          if (selection && currentContainer) {
            const newRange = document.createRange();
            const walker = document.createTreeWalker(
              textareaRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );

            let currentPos = 0;
            let targetNode = null;
            let targetOffset = 0;

            while (walker.nextNode()) {
              const textNode = walker.currentNode;
              const textLength = textNode.textContent?.length || 0;

              if (currentPos + textLength >= currentOffset) {
                targetNode = textNode;
                targetOffset = currentOffset - currentPos;
                break;
              }
              currentPos += textLength;
            }

            if (targetNode) {
              newRange.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        } catch (error) {
          // Cursor positioning failed, place at end
          if (selection && textareaRef.current.lastChild) {
            const range = document.createRange();
            range.selectNodeContents(textareaRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }
  }, [newNote.content]);

  const handleAddNote = async () => {
    if (!newNote.content.trim()) return;

    setIsSubmitting(true);

    try {
      // Extract tags from content before submitting
      const tags = extractHashtags(newNote.content);

      Inertia.post(`/initiatives/${entityId}/notes`, {
        title: newNote.title || null,
        content: newNote.content,
        tags: tags, // Send extracted tags
      }, {
        onSuccess: () => {
          setNewNote({ title: '', content: '' });
          setDetectedTags([]);
          setDetectedMentions([]);
          setIsAdding(false);
          // No need to manually reload as Inertia handles this
        },
        onError: (errors) => {
          console.error('Failed to create note:', errors);
          alert('Failed to create note. Please try again.');
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error creating note:', error);
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 500,
          color: '#222',
          margin: 0
        }}>
          Notes ({notes.length})
        </h3>

        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            style={{
              background: '#228be6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Add Note
          </Button>
        )}
      </div>

      {/* Add New Note Form */}
      {isAdding && (
        <Card style={{
          padding: 16,
          marginBottom: 16,
          border: '2px solid #228be6',
          borderRadius: 8
        }}>
          <div style={{ marginBottom: 12 }}>
            <Label htmlFor="note-title" style={{
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 4,
              display: 'block',
              color: '#222'
            }}>
              Title (optional)
            </Label>
            <Input
              id="note-title"
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e9ecef',
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label htmlFor="note-content" style={{
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 4,
              display: 'block',
              color: '#222'
            }}>
              Content * <span style={{ fontSize: 12, color: '#666' }}>Use #hashtags to create tags</span>
            </Label>

            {/* Contenteditable div instead of textarea for inline hashtag styling */}
            <div style={{ position: 'relative' }}>
              <div
                ref={textareaRef}
                contentEditable
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  lineHeight: '1.4',
                  outline: 'none',
                  backgroundColor: '#fff',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'auto',
                  resize: 'vertical'
                }}
                className="content-editable-placeholder"
              />

              {/* Show placeholder when empty */}
              {!newNote.content && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    color: '#999',
                    fontSize: 14,
                    fontStyle: 'italic',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  Write your note here... Use #hashtags to create tags automatically
                </div>
              )}
            </div>

            {/* Show detected tags and mentions preview */}
            {(detectedTags.length > 0 || detectedMentions.length > 0) && (
              <div style={{ marginTop: 8 }}>
                {detectedTags.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      Detected tags:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {detectedTags.map((tag, index) => (
                        <span
                          key={`preview-${index}`}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: 12,
                            opacity: 0.8
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {detectedMentions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      Detected mentions:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {detectedMentions.map((mention) => (
                        <span
                          key={`mention-preview-${mention.id}`}
                          style={{
                            background: 'rgba(40, 167, 69, 0.1)',
                            color: '#28a745',
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mention.name)}&background=28a745&color=fff`}
                            alt={mention.name}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              flexShrink: 0
                            }}
                          />
                          {mention.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mention suggestions dropdown */}
            {showMentionSuggestions && currentMentionQuery && (
              <div style={{
                border: '1px solid #e9ecef',
                borderRadius: 6,
                background: '#fff',
                marginTop: 8,
                maxHeight: 200,
                overflowY: 'auto',
                zIndex: 1000,
                position: 'absolute',
                width: 'calc(100% - 32px)',
                padding: '8px 0',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}>
                {mentionSuggestions.length === 0 ? (
                  <div style={{
                    padding: '8px 12px',
                    color: '#666',
                    fontSize: 14,
                    textAlign: 'center'
                  }}>
                    No suggestions found
                  </div>
                ) : (
                  mentionSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => {
                        // Simplified approach: Replace the entire content with proper mention
                        const currentContent = newNote.content;
                        const mentionTag = `@${suggestion.first_name}${suggestion.last_name}`;

                        // Find the @ symbol and replace from there
                        const atIndex = currentContent.lastIndexOf('@' + currentMentionQuery);

                        if (atIndex !== -1) {
                          // Replace the @query with the full mention
                          const beforeMention = currentContent.substring(0, atIndex);
                          const afterMention = currentContent.substring(atIndex + 1 + currentMentionQuery.length);
                          const newContent = beforeMention + mentionTag + ' ' + afterMention;


                          // Update the content
                          setNewNote({ ...newNote, content: newContent });

                          // Hide suggestions
                          setShowMentionSuggestions(false);
                          setCurrentMentionQuery('');

                          // Focus back to editor
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();

                              // Place cursor at the end
                              const range = document.createRange();
                              range.selectNodeContents(textareaRef.current);
                              range.collapse(false);
                              const selection = window.getSelection();
                              if (selection) {
                                selection.removeAllRanges();
                                selection.addRange(range);
                              }
                            }
                          }, 10);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(suggestion.first_name + ' ' + suggestion.last_name)}&background=28a745&color=fff`}
                        alt={suggestion.first_name + ' ' + suggestion.last_name}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          flexShrink: 0
                        }}
                      />
                      <div style={{
                        flexGrow: 1,
                        fontSize: 14,
                        color: '#222',
                        fontWeight: 600
                      }}>
                        {suggestion.first_name} {suggestion.last_name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewNote({ title: '', content: '' });
                setDetectedTags([]);
                setDetectedMentions([]);
              }}
              disabled={isSubmitting}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={isSubmitting || !newNote.content.trim()}
              style={{
                background: newNote.content.trim() ? '#228be6' : '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 14,
                cursor: newNote.content.trim() ? 'pointer' : 'not-allowed',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </Card>
      )}

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notes.length === 0 ? (
          <Card style={{
            padding: 24,
            textAlign: 'center',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            background: '#f8f9fa'
          }}>
            <p style={{
              color: '#666',
              fontSize: 14,
              margin: 0,
              fontStyle: 'italic'
            }}>
              No notes yet. Add your first note to get started.
            </p>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} style={{
              padding: 16,
              border: '1px solid #e9ecef',
              borderRadius: 8,
              background: '#fff'
            }}>
              {note.title && (
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: '#222',
                  margin: '0 0 8px 0'
                }}>
                  {note.title}
                </h4>
              )}

              <div style={{
                color: '#444',
                fontSize: 14,
                lineHeight: 1.5,
                margin: '0 0 12px 0',
                whiteSpace: 'pre-wrap'
              }}>
                {processContentForDisplay(note.content)}
              </div>

              {/* Display note tags if they exist */}
              {note.tags && note.tags.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {note.tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 500,
                          padding: '2px 8px',
                          borderRadius: 12,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                fontSize: 12,
                color: '#666',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 8,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Created: {formatDate(note.created_at)}</span>
                {note.updated_at !== note.created_at && (
                  <span>Updated: {formatDate(note.updated_at)}</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;
