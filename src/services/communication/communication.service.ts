import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { badRequest } from '../../utils/errors';
import { NotificationChannel } from '@prisma/client';
import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export class CommunicationService {
  async sendNotification(orgId: string, data: { userIds: string[]; title: string; body: string; channel: NotificationChannel }) {
    if (data.channel === NotificationChannel.EMAIL) {
      const canSend = await this.checkEmailCap(orgId, data.userIds.length);
      if (!canSend) throw badRequest(`Email monthly cap (${env.EMAIL_MONTHLY_CAP}) reached`);
    }

    const notifications = await prisma.notification.createManyAndReturn({
      data: data.userIds.map(userId => ({
        orgId,
        userId,
        title: data.title,
        body: data.body,
        channel: data.channel,
      })),
    });

    if (data.channel === NotificationChannel.EMAIL) {
      const users = await prisma.user.findMany({ where: { id: { in: data.userIds } }, select: { email: true } });
      const emails = users.map(u => u.email).filter(Boolean) as string[];
      if (emails.length > 0) {
        await this.sendEmails(emails, data.title, data.body);
        await this.incrementEmailUsage(orgId, emails.length);
      }
    }

    return notifications;
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationIds: string[]) {
    await prisma.notification.updateMany({
      where: { id: { in: notificationIds }, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getEmailUsage(orgId: string) {
    const now = new Date();
    const usage = await prisma.emailUsage.findUnique({
      where: { orgId_month_year: { orgId, month: now.getMonth() + 1, year: now.getFullYear() } },
    });
    return { used: usage?.count || 0, cap: env.EMAIL_MONTHLY_CAP, remaining: env.EMAIL_MONTHLY_CAP - (usage?.count || 0) };
  }

  private async checkEmailCap(orgId: string, count: number): Promise<boolean> {
    const usage = await this.getEmailUsage(orgId);
    return usage.remaining >= count;
  }

  private async sendEmails(to: string[], subject: string, body: string) {
    if (!env.SMTP_USER) return; // skip in dev/test
    const transport = getTransporter();
    await transport.sendMail({ from: env.SMTP_FROM, to: to.join(','), subject, html: body });
  }

  private async incrementEmailUsage(orgId: string, count: number) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    await prisma.emailUsage.upsert({
      where: { orgId_month_year: { orgId, month, year } },
      update: { count: { increment: count } },
      create: { orgId, month, year, count },
    });
  }
}

export const communicationService = new CommunicationService();
