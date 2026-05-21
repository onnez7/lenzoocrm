import { Router } from 'express';
import clientRoutes from './clientRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import franchiseRoutes from './franchiseRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import brandRoutes from './brandRoutes';
import saleRoutes from './saleRoutes';
import stockRoutes from './stockRoutes';
import employeeRoutes from './employeeRoutes';
import cashierRoutes from './cashierRoutes';
import orderRoutes from './orderRoutes';
import appointmentRoutes from './appointmentRoutes';
import bankAccountRoutes from './bankAccountRoutes';
import creditCardRoutes from './creditCardRoutes';
import invoiceRoutes from './invoiceRoutes';
import payableRoutes from './payableRoutes';
import receivableRoutes from './receivableRoutes';
import financeRoutes from './financeRoutes';
import adminRoutes from './adminRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import supportTicketRoutes from './supportTicketRoutes';
import franchiseChatRoutes from './franchiseChatRoutes';
import clientPaymentRoutes from './clientPaymentRoutes';
import opportunityRoutes from './opportunityRoutes';
import opportunityActivityRoutes from './opportunityActivityRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/franchises', franchiseRoutes);
router.use('/', productRoutes);
router.use('/', categoryRoutes);
router.use('/', brandRoutes);
router.use('/sales', saleRoutes);
router.use('/', stockRoutes);
router.use('/employees', employeeRoutes);
router.use('/cashier', cashierRoutes);
router.use('/orders', orderRoutes);
router.use('/appointments', appointmentRoutes);

// Rotas financeiras
router.use('/bank-accounts', bankAccountRoutes);
router.use('/credit-cards', creditCardRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payables', payableRoutes);
router.use('/receivables', receivableRoutes);
router.use('/finance', financeRoutes);

// Rotas de assinaturas (apenas SUPER_ADMIN)
router.use('/subscriptions', subscriptionRoutes);

// Rotas admin (apenas SUPER_ADMIN)
router.use('/admin', adminRoutes);

// Adicionar antes do export default router;
router.use('/support', supportTicketRoutes);
router.use('/chat', franchiseChatRoutes);
router.use('/client-payments', clientPaymentRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/', opportunityActivityRoutes);

export default router;