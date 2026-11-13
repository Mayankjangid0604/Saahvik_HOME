import { Request, Response } from 'express';
import { communicationService } from '../../services/communication/communication.service';
import { ok } from '../../utils/response';

export const sendNotification = async (req: Request, res: Response) => {
  ok(res, await communicationService.sendNotification(req.user!.orgId, req.body));
};

export const getNotifications = async (req: Request, res: Response) => {
  ok(res, await communicationService.getUserNotifications(req.user!.userId, req.query.unread === 'true'));
};

export const markAsRead = async (req: Request, res: Response) => {
  await communicationService.markAsRead(req.user!.userId, req.body.notificationIds);
  ok(res, { message: 'Marked as read' });
};

export const getEmailUsage = async (req: Request, res: Response) => {
  ok(res, await communicationService.getEmailUsage(req.user!.orgId));
};
