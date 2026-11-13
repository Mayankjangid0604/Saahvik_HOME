import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import propertyRoutes from './routes/property.routes';
import residentRoutes from './routes/resident.routes';
import billingRoutes from './routes/billing.routes';
import paymentRoutes from './routes/payment.routes';
import staffRoutes from './routes/staff.routes';
import complaintRoutes from './routes/complaint.routes';
import communicationRoutes from './routes/communication.routes';
import reportRoutes from './routes/report.routes';
import fileRoutes from './routes/file.routes';
import auditRoutes from './routes/audit.routes';
import settingsRoutes from './routes/settings.routes';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('short'));

app.get('/health', (_req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/invoices', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);
