import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne({ id });

    if (typeof transaction === 'undefined') {
      const error = new AppError('Id is invalid!', 400);
      throw error;
    }

    await transactionsRepository.delete({ id });
  }
}

export default DeleteTransactionService;
