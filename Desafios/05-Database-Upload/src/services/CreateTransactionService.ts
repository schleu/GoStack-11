import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    if (type !== 'income' && type !== 'outcome') {
      const error = new AppError('Type is invalid!');
      throw error;
    }

    // Verifica se tem R$ em conta para poder tirar kkkkk
    if (type === 'outcome') {
      const balance = transactionsRepository.getBalance();
      if ((await balance).total < 0 || (await balance).total < value) {
        const error = new AppError('Value unavailable.', 400);
        throw error;
      }
    }

    // Verifica se a categoria já existe, caso não, a cria
    let categoryFind = await categoriesRepository.findOne({ title: category });

    if (typeof categoryFind === 'undefined') {
      const newCategory = categoriesRepository.create({ title: category });
      categoryFind = await categoriesRepository.save(newCategory);
    }

    const category_id = categoryFind?.id;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
