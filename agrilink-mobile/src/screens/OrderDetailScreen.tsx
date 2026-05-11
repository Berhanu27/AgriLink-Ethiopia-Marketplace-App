import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Order, OrderMessage } from '../types';
import { api } from '../lib/api';
import { formatDateTime, safeDate } from '../lib/dateUtils';

export default function OrderDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { currentUser, updateOrder } = useApp();
  const { order } = route.params as { order: Order };
  
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [farmerResponse, setFarmerResponse] = useState(order.farmerResponse || '');
  const [availableQuantity, setAvailableQuantity] = useState(order.availableQuantity || '');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const isBuyer = currentUser?.role === 'buyer';
  const isSeller = currentUser?.role === 'farmer' || currentUser?.role === 'cooperative';

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, []);

  const loadMessages = async () => {
    try {
      const msgs = await api.orders.getMessages(Number(order.id));
      setMessages(msgs.map(m => ({
        id: String(m.id),
        orderId: String(m.orderId),
        senderId: String(m.senderId),
        senderName: m.senderName,
        message: m.message,
        createdAt: safeDate(m.createdAt),
        updatedAt: m.updatedAt ? safeDate(m.updatedAt) : undefined,
        isEdited: m.isEdited,
      })));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await api.orders.markMessagesAsRead(Number(order.id));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      await api.orders.sendMessage(Number(order.id), { message: newMessage.trim() });
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = (msg: OrderMessage) => {
    setEditingMessageId(msg.id);
    setEditingMessageText(msg.message);
  };

  const saveEditMessage = async () => {
    if (!editingMessageId || !editingMessageText.trim()) return;
    
    setLoading(true);
    try {
      await api.orders.updateMessage(Number(editingMessageId), { message: editingMessageText.trim() });
      setEditingMessageId(null);
      setEditingMessageText('');
      await loadMessages();
    } catch (error) {
      Alert.alert('Error', 'Failed to update message');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleDeleteMessage = (msgId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.orders.deleteMessage(Number(msgId));
              await loadMessages();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleAccept = async () => {
    if (!farmerResponse.trim()) {
      Alert.alert('Required', 'Please provide a response message');
      return;
    }

    setLoading(true);
    try {
      await updateOrder(order.id, {
        status: 'accepted',
        farmerResponse: farmerResponse.trim(),
        availableQuantity: availableQuantity.trim() || undefined,
      });
      Alert.alert('Success', 'Order accepted');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!farmerResponse.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection');
      return;
    }

    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await updateOrder(order.id, {
                status: 'rejected',
                farmerResponse: farmerResponse.trim(),
              });
              Alert.alert('Order Rejected', 'The buyer has been notified');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    Alert.alert(
      'Complete Order',
      'Mark this order as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setLoading(true);
            try {
              await updateOrder(order.id, { status: 'completed' });
              Alert.alert('Success', 'Order marked as completed');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to complete order');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'completed': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Order Info */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <Text style={styles.cropName}>{order.cropName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Requested Quantity:</Text>
            <Text style={styles.value}>{order.requestedQuantity} {order.unit}</Text>
          </View>

          {order.offeredPrice && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Offered Price:</Text>
              <Text style={styles.priceValue}>ETB {order.offeredPrice.toLocaleString()}</Text>
            </View>
          )}

          {order.availableQuantity && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Available Quantity:</Text>
              <Text style={styles.value}>{order.availableQuantity}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>{isBuyer ? 'Seller:' : 'Buyer:'}</Text>
            <Text style={styles.value}>
              {isBuyer ? order.sellerName : order.buyerName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>
              {isBuyer ? order.sellerPhone : order.buyerPhone}
            </Text>
          </View>

          {order.buyerMessage && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Buyer Message:</Text>
              <Text style={styles.messageText}>{order.buyerMessage}</Text>
            </View>
          )}

          {order.farmerResponse && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Seller Response:</Text>
              <Text style={styles.messageText}>{order.farmerResponse}</Text>
            </View>
          )}
        </View>

        {/* Seller Actions */}
        {isSeller && order.status === 'pending' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Respond to Order</Text>
            
            <Text style={styles.inputLabel}>Your Response *</Text>
            <TextInput
              style={styles.textArea}
              value={farmerResponse}
              onChangeText={setFarmerResponse}
              placeholder="Provide details about availability, pricing, delivery..."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Available Quantity (optional)</Text>
            <TextInput
              style={styles.input}
              value={availableQuantity}
              onChangeText={setAvailableQuantity}
              placeholder="e.g., 50 kg"
            />

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={handleAccept}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Accept Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={handleReject}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Complete Button */}
        {order.status === 'accepted' && (
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={handleComplete}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Mark as Completed</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <View style={styles.card}>
          <View style={styles.messageSectionHeader}>
            <Text style={styles.sectionTitle}>💬 Chat Messages</Text>
            {messages.length > 0 && (
              <Text style={styles.messageCount}>{messages.length} message{messages.length > 1 ? 's' : ''}</Text>
            )}
          </View>
          
          {messages.length === 0 ? (
            <View style={styles.noMessagesContainer}>
              <Text style={styles.noMessagesIcon}>💬</Text>
              <Text style={styles.noMessages}>No messages yet</Text>
              <Text style={styles.noMessagesSub}>Start a conversation with {isBuyer ? 'the seller' : 'the buyer'}</Text>
            </View>
          ) : (
            <View style={styles.messagesContainer}>
              {messages.map((msg) => {
                const isMyMessage = msg.senderId === currentUser?.id;
                const isEditing = editingMessageId === msg.id;
                
                return (
                  <View key={msg.id}>
                    {isEditing ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editingMessageText}
                          onChangeText={setEditingMessageText}
                          multiline
                          autoFocus
                        />
                        <View style={styles.editButtons}>
                          <TouchableOpacity
                            style={styles.editCancelButton}
                            onPress={cancelEdit}
                          >
                            <Text style={styles.editCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editSaveButton}
                            onPress={saveEditMessage}
                            disabled={loading}
                          >
                            <Text style={styles.editSaveText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.messageBubble,
                          isMyMessage ? styles.myMessage : styles.theirMessage,
                        ]}
                      >
                        <View style={styles.messageHeader}>
                          <Text style={styles.messageSender}>{msg.senderName}</Text>
                          {isMyMessage && (
                            <TouchableOpacity
                              onPress={() => setMenuVisible(msg.id)}
                              style={styles.messageMenuButton}
                            >
                              <Text style={styles.messageMenuIcon}>⋮</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={styles.messageContent}>{msg.message}</Text>
                        <Text style={styles.messageTime}>
                          {formatDateTime(msg.createdAt)}
                          {msg.isEdited && ' (edited)'}
                        </Text>
                        
                        {/* Message Menu Modal */}
                        {menuVisible === msg.id && (
                          <Modal
                            transparent
                            visible={menuVisible === msg.id}
                            onRequestClose={() => setMenuVisible(null)}
                            animationType="fade"
                          >
                            <TouchableOpacity 
                              style={styles.modalOverlay}
                              activeOpacity={1}
                              onPress={() => setMenuVisible(null)}
                            >
                              <View style={styles.messageMenuDropdown}>
                                <TouchableOpacity 
                                  style={styles.menuItem}
                                  onPress={() => {
                                    setMenuVisible(null);
                                    handleEditMessage(msg);
                                  }}
                                >
                                  <Text style={styles.menuItemIcon}>✏️</Text>
                                  <Text style={styles.menuItemText}>Edit</Text>
                                </TouchableOpacity>
                                <View style={styles.menuDivider} />
                                <TouchableOpacity 
                                  style={styles.menuItem}
                                  onPress={() => {
                                    setMenuVisible(null);
                                    handleDeleteMessage(msg.id);
                                  }}
                                >
                                  <Text style={styles.menuItemIcon}>🗑️</Text>
                                  <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          </Modal>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || loading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={loading || !newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    color: '#16a34a',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '700',
  },
  messageBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#16a34a',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  completeButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noMessages: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 4,
  },
  noMessagesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noMessagesIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.3,
  },
  noMessagesSub: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  },
  messageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageCount: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messagesContainer: {
    marginBottom: 16,
    maxHeight: 400,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageMenuButton: {
    padding: 4,
    paddingHorizontal: 8,
  },
  messageMenuIcon: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageMenuDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemIcon: { fontSize: 16 },
  menuItemText: { 
    fontSize: 14, 
    fontWeight: '600',
    color: '#111827',
  },
  menuItemTextDanger: { color: '#991b1b' },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  messageActionText: {
    fontSize: 16,
  },
  editContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  editCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  editCancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  editSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#16a34a',
  },
  editSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  myMessage: {
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
    maxWidth: '80%',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageContent: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  messageInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
