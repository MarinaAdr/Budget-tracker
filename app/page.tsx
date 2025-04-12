"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { PlusCircle, Wallet, ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
};

export default function Home() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription("");
    setAmount("");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const balance = transactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glassmorphism rounded-2xl p-6 border-t border-slate-700/30">
            <Wallet className="text-blue-400 h-8 w-8 mb-3" />
            <div>
              <p className="text-slate-400 text-sm">Solde total</p>
              <p className="text-2xl font-bold text-white mt-1">{balance.toFixed(2)}€</p>
            </div>
          </div>
          
          <div className="glassmorphism rounded-2xl p-6 border-t border-slate-700/30">
            <ArrowUpCircle className="text-emerald-400 h-8 w-8 mb-3" />
            <div>
              <p className="text-slate-400 text-sm">Revenus totaux</p>
              <p className="text-2xl font-bold text-white mt-1">{income.toFixed(2)}€</p>
            </div>
          </div>

          <div className="glassmorphism rounded-2xl p-6 border-t border-slate-700/30">
            <ArrowDownCircle className="text-rose-400 h-8 w-8 mb-3" />
            <div>
              <p className="text-slate-400 text-sm">Dépenses totales</p>
              <p className="text-2xl font-bold text-white mt-1">{expenses.toFixed(2)}€</p>
            </div>
          </div>
        </motion.div>

        <motion.form 
          onSubmit={addTransaction}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism rounded-2xl p-6 border-t border-slate-700/30"
        >
          <div className="flex gap-4 flex-wrap">
            <Input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
            />
            <Input
              type="number"
              placeholder="Montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-32 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
            />
            <Button
              type="button"
              onClick={() => setType(type === 'income' ? 'expense' : 'income')}
              variant="outline"
              className={`${
                type === 'income' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
              }`}
            >
              {type === 'income' ? 'Revenu' : 'Dépense'}
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`glassmorphism rounded-xl p-4 flex items-center justify-between border-l-4 ${
                transaction.type === 'income' 
                  ? 'border-l-emerald-500/50' 
                  : 'border-l-rose-500/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {transaction.type === 'income' ? (
                  <ArrowUpCircle className="text-emerald-400 h-5 w-5" />
                ) : (
                  <ArrowDownCircle className="text-rose-400 h-5 w-5" />
                )}
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-slate-400 text-sm">{transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className={`${
                  transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                } font-bold`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTransaction(transaction.id)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}