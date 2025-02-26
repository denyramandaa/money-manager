import { db } from '../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { email, budgetCategories, yearMonth } = body;

  // Reference to the document in the Budgets collection
  const budgetDocRef = db.collection('Budgets').doc(email);

  // Create an object to store the active budget categories
  const activeBudgets = {};

  // Iterate through the budget categories array
  budgetCategories.forEach(category => {
    if (category.active && category.value !== null) {
      activeBudgets[category.id] = category.value;
    }
  });

  // Set or update the budget in the Budgets collection with the active categories
  await budgetDocRef.set({ budget: activeBudgets });

  // Reference to the main document for the specific yearMonth in the Spending collection
  const spendingDocRef = db.collection('Spending').doc(yearMonth);

  // Update the Spending document with the budget under the email field
  await spendingDocRef.update({ [email]: activeBudgets });

  return { success: true };
});
