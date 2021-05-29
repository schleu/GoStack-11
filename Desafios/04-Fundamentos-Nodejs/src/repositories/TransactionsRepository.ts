import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface CreateTransacionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const { transactions } = this;
    const balance: Balance = { income: 0, outcome: 0, total: 0 };

    transactions.reduce((accumulator, transaction) => {
      const balanceAccumulator = accumulator;
      if (transaction.type === 'income') {
        balanceAccumulator.income += transaction.value;
      } else if (transaction.type === 'outcome') {
        balanceAccumulator.outcome += transaction.value;
      }
      return balanceAccumulator;
    }, balance);

    balance.total = balance.income - balance.outcome;

    return balance;
  }

  public create({ title, value, type }: CreateTransacionDTO): Transaction {
    const transacion = new Transaction({ title, value, type });

    this.transactions.push(transacion);

    return transacion;
  }
}

export default TransactionsRepository;
