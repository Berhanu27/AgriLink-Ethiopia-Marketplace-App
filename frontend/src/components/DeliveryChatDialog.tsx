"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeliveryMessage {
  id: number;
  senderId: number;
  senderName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

interface DeliveryChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryRequestId: number;
  currentUserId: number;
  deliveryDetails: {
    cargoType: string;
    buyerName: string;
    transporterName: string;
  };
}

export default function DeliveryChatDialog({
  open,
  onOpenChange,
  deliveryRequestId,
  currentUserId,
  deliveryDetails,
}: DeliveryChatDialogProps) {
  const [messages, setMessages] = useState<DeliveryMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      loadMessages();
      markAsRead();
    }
  }, [open, deliveryRequestId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.deliveryRequests.getMessages(deliveryRequestId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.deliveryRequests.markMessagesAsRead(deliveryRequestId);
      console.log('Messages marked as read for delivery request:', deliveryRequestId);
      // Trigger a custom event to refresh notifications
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await api.deliveryRequests.sendMessage(deliveryRequestId, { message: newMessage.trim() });
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = (msg: DeliveryMessage) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.message);
  };

  const handleSaveEdit = async (messageId: number) => {
    if (!editingText.trim()) return;

    try {
      const updated = await api.deliveryRequests.updateMessage(messageId, { message: editingText.trim() });
      setMessages(messages.map(msg => msg.id === messageId ? updated : msg));
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Failed to update message:", error);
      alert("Failed to update message. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await api.deliveryRequests.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[500px] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b bg-white">
          <DialogTitle className="text-base font-semibold text-gray-900">
            {deliveryDetails.cargoType}
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{deliveryDetails.buyerName}</span>
            <span>•</span>
            <span>{deliveryDetails.transporterName}</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#e4ddd4]" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                <Send className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-gray-600 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => {
                // Convert both to numbers for comparison
                const msgSenderId = Number(msg.senderId);
                const userId = Number(currentUserId);
                const isCurrentUser = msgSenderId === userId;
                const isEditing = editingMessageId === msg.id;
                console.log('Message:', msg.id, 'senderId:', msg.senderId, '(as number:', msgSenderId, ') currentUserId:', currentUserId, '(as number:', userId, ') isCurrentUser:', isCurrentUser);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                      {isEditing ? (
                        <div className={`w-full rounded-lg px-3 py-2 shadow-sm ${
                          isCurrentUser
                            ? "bg-[#dcf8c6] text-gray-900"
                            : "bg-white text-gray-900"
                        }`}>
                          <p className="text-xs font-medium mb-1 text-gray-600">
                            {msg.senderName}
                          </p>
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="mb-2 text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(msg.id)}
                              className="h-7 text-xs bg-[#2b5278] hover:bg-[#1e3a5f]"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-lg px-3 py-2 shadow-sm relative group ${
                            isCurrentUser
                              ? "bg-[#dcf8c6] text-gray-900"
                              : "bg-white text-gray-900"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium mb-0.5 text-gray-600">
                                {msg.senderName}
                              </p>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {formatTime(msg.createdAt)}
                                {msg.isEdited && <span className="ml-1">(edited)</span>}
                              </p>
                            </div>
                            {isCurrentUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                                    <Pencil className="h-3 w-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 px-3 py-3 border-t bg-white">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message"
            disabled={sending}
            className="flex-1 h-9 text-sm border-gray-300 rounded-full px-4"
          />
          <Button 
            type="submit" 
            disabled={sending || !newMessage.trim()}
            size="sm"
            className="h-9 w-9 rounded-full p-0 bg-[#2b5278] hover:bg-[#1e3a5f]"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
