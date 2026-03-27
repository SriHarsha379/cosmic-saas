import { Router } from 'express';
import { listCertificates, listAllCertificates, getCertificate, issueCertificate, deleteCertificate } from '../controllers/certificate.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/admin', authenticate, requireAdmin, listAllCertificates);
router.get('/', authenticate, listCertificates);
router.get('/user/:userId', authenticate, listCertificates);
router.get('/:id', authenticate, getCertificate);
router.post('/', authenticate, requireAdmin, issueCertificate);
router.delete('/:id', authenticate, requireAdmin, deleteCertificate);
export default router;
