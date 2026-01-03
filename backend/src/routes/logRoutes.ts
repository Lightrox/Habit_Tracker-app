import { Router } from 'express';
import {
  createOrUpdateLog,
  getLogByDate,
  getWeekLogs,
  getMonthLogs,
} from '../controllers/logController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrUpdateLog);
router.get('/day/:date', getLogByDate);
router.get('/week/:year/:weekNumber', getWeekLogs);
router.get('/month/:year/:month', getMonthLogs);

export default router;
