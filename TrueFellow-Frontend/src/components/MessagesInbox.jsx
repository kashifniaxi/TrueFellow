import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, DEFAULT_AVATAR } from '../utils/imageUrl';
import {
  MY_CONVERSATIONS_QUERY,
  CONVERSATION_QUERY,
  SEND_MESSAGE_MUTATION,
} from '../graphql/operations';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

const MessagesInbox = ({ initialSelectedUser = null }) => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser);
  const [messageText, setMessageText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const threadEndRef = useRef(null);

  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  const {
    data: convsData,
    loading: convsLoading,
    refetch: refetchConvs,
  } = useQuery(MY_CONVERSATIONS_QUERY, {
    pollInterval: 8000,
    fetchPolicy: 'network-only',
  });

  const {
    data: messagesData,
    loading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery(CONVERSATION_QUERY, {
    variables: { otherUserId: selectedUser?.id },
    skip: !selectedUser?.id,
    pollInterval: 3500,
    fetchPolicy: 'network-only',
  });

  const [sendMessage, { loading: sendLoading }] = useMutation(SEND_MESSAGE_MUTATION);

  const rawMessages = messagesData?.conversation?.messages || [];
  const messages = [...rawMessages].reverse();
  const conversations = convsData?.myConversations || [];

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedUser?.id) return;
    setErrorMsg('');

    try {
      await sendMessage({
        variables: {
          input: {
            recipientId: selectedUser.id,
            content: messageText.trim(),
          },
        },
      });
      setMessageText('');
      refetchMessages();
      refetchConvs();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send message.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPartner = (c) => {
    const isSender = c.sender?.id === user?.id;
    return isSender ? c.recipient : c.sender;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={750} color="#081C15">
            Direct Messages & Companion Chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chat with tour operators and matched travel companions in real time.
          </Typography>
        </Box>
        <Tooltip title="Refresh Messages">
          <IconButton
            onClick={() => { refetchConvs(); refetchMessages(); }}
            size="small"
            sx={{ border: '1px solid #E4EDE6' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* Contact List */}
        <Grid size={{ xs: 12, md: 4.5 }}>
          <Paper
            sx={{
              height: { xs: 260, md: '62vh' },
              overflowY: 'auto',
              borderRadius: 3.5,
              border: '1px solid #E4EDE6',
              boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
              bgcolor: '#FFFFFF',
            }}
            variant="outlined"
          >
            <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #F0F4F1' }}>
              <Typography variant="subtitle2" fontWeight={750} color="#081C15">
                Conversations ({conversations.length})
              </Typography>
            </Box>

            {convsLoading && conversations.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={28} color="primary" />
              </Box>
            ) : conversations.length > 0 ? (
              <List sx={{ p: 0 }}>
                {conversations.map((c) => {
                  const partner = getPartner(c);
                  if (!partner) return null;
                  const isSelected = selectedUser?.id === partner.id;

                  return (
                    <ListItemButton
                      key={c.id}
                      onClick={() => {
                        setSelectedUser(partner);
                        setErrorMsg('');
                      }}
                      selected={isSelected}
                      sx={{
                        borderBottom: '1px solid #F0F4F1',
                        py: 1.6,
                        px: 2,
                        backgroundColor: isSelected ? 'rgba(45, 106, 79, 0.08) !important' : 'inherit',
                        borderLeft: isSelected ? '4px solid #2D6A4F' : '4px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={getImageUrl(partner.profilePicture, DEFAULT_AVATAR)}
                          alt={partner.name}
                          sx={{
                            width: 44,
                            height: 44,
                            border: isSelected ? '2px solid #2D6A4F' : '1px solid #E4EDE6',
                          }}
                        >
                          {partner.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={partner.name}
                        secondary={c.content}
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 750 : 600,
                          fontSize: '0.92rem',
                          color: '#081C15',
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          fontSize: '0.8rem',
                          color: isSelected ? 'primary.main' : 'text.secondary',
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.35, mb: 1 }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  No previous conversations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reach out to an organizer from a tour details page or message a matched travel companion.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Active Conversation Chat Window */}
        <Grid size={{ xs: 12, md: 7.5 }}>
          {selectedUser ? (
            <Paper
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 480, md: '62vh' },
                borderRadius: 3.5,
                border: '1px solid #E4EDE6',
                boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
                bgcolor: '#FFFFFF',
              }}
              variant="outlined"
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, pb: 1.8 }}>
                <Avatar
                  src={getImageUrl(selectedUser.profilePicture, DEFAULT_AVATAR)}
                  alt={selectedUser.name}
                  sx={{ width: 44, height: 44, border: '2px solid #2D6A4F' }}
                >
                  {selectedUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={750} color="#081C15">
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser.role || 'Member'} &bull; Direct Chat
                  </Typography>
                </Box>
              </Box>
              <Divider />

              {/* Message List */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  p: 2,
                  backgroundColor: '#F8FAF7',
                  borderRadius: 3,
                  my: 1.5,
                  border: '1px solid #EBF1EC',
                }}
              >
                {messagesLoading && messages.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={26} color="primary" />
                  </Box>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.sender?.id !== selectedUser.id;
                    return (
                      <Box
                        key={msg.id}
                        alignSelf={isMe ? 'flex-end' : 'flex-start'}
                        sx={{
                          background: isMe
                            ? 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)'
                            : '#FFFFFF',
                          color: isMe ? '#ffffff' : '#081C15',
                          px: 2.2,
                          py: 1.2,
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          maxWidth: '75%',
                          boxShadow: isMe
                            ? '0 3px 10px rgba(45, 106, 79, 0.2)'
                            : '0 2px 8px rgba(0,0,0,0.05)',
                          border: isMe ? 'none' : '1px solid #E4EDE6',
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.55 }}>
                          {msg.content}
                        </Typography>
                        {msg.createdAt && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              textAlign: 'right',
                              fontSize: '0.68rem',
                              opacity: isMe ? 0.8 : 0.6,
                              mt: 0.4,
                            }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.35, mb: 1 }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      No messages yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Say hello to start the conversation with {selectedUser.name}!
                    </Typography>
                  </Box>
                )}
                <div ref={threadEndRef} />
              </Box>

              {/* Chat Input Bar */}
              <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1.2 }}>
                <TextField
                  fullWidth
                  placeholder="Type your message... (Press Enter to send)"
                  size="small"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendLoading}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={sendLoading || !messageText.trim()}
                  endIcon={<SendIcon />}
                  sx={{ px: 3, borderRadius: 2.5, fontWeight: 700 }}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 5,
                textAlign: 'center',
                height: { xs: 320, md: '62vh' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3.5,
                border: '1px solid #E4EDE6',
                bgcolor: '#FFFFFF',
              }}
              variant="outlined"
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.4, mb: 2 }} />
              <Typography variant="h6" fontWeight={750} color="#081C15" gutterBottom>
                No Conversation Selected
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                Pick a conversation from the left sidebar, or click "Message Companion" from your matching dashboard.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessagesInbox;
