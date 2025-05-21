import Notification from "../Models_GPT/Notification";

import { Request, Response } from 'express';

// ✅ Get All Notifications
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email');

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Mark a single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return 
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Delete a single notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return 
    }
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Clear all notifications
export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ success: true, message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ GET /api/notifications/unread-count
export const getUnreadNotificationCount = async (req: Request, res: Response) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
