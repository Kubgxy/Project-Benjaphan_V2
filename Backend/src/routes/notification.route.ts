import express from 'express';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadNotificationCount
} from '../controllers/notification.controller';
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";

const notification = express.Router();

notification.get('/getNotifications',verifyToken, verifyAdmin, getAllNotifications);
notification.patch('/read/:notificationId',verifyToken, verifyAdmin, markAsRead);
notification.patch('/read-all',verifyToken, verifyAdmin, markAllAsRead);
notification.delete('/:notificationId',verifyToken, verifyAdmin, deleteNotification);
notification.delete('/clearAllNotifications',verifyToken, verifyAdmin, clearAllNotifications);
notification.get('/unread-count',verifyToken, verifyAdmin, getUnreadNotificationCount);

export default notification;
