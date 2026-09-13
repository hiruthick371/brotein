import { Router } from 'express';
import {
  createEntry,
  deleteEntry,
  listEntries,
  updateEntry,
} from '../controllers/entryController';

const router = Router();

router.post('/', createEntry);
router.get('/', listEntries);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
