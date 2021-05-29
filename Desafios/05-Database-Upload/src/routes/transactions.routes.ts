import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';
import CategoriesRepository from '../repositories/CategoriesRepository';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();

  try {
    return response.status(200).json({ transactions, balance });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.get('/category', async (request, response) => {
  const categoryRepository = getCustomRepository(CategoriesRepository);
  const transactions = await categoryRepository.find();

  try {
    return response.status(200).json({ transactions });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();

  try {
    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category,
    });
    return response.status(200).json(transaction);
  } catch (err) {
    return response
      .status(err.statusCode)
      .json({ status: 'error', message: err.message });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  try {
    await deleteTransaction.execute(id);
    return response.status(200).json({ message: 'Transaction deleted.' });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    try {
      const importTransactionsService = new ImportTransactionsService();
      const transactions = await importTransactionsService.execute(file.path);
      return response.status(200).json({ transactions });
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  },
);

export default transactionsRouter;
