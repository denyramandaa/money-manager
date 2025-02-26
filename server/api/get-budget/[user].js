import { db } from '../../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  const { user } = event.context.params;

  const budgetDocRef = db.collection('Budgets').doc(user);
  const budgetDoc = await budgetDocRef.get();

  if (budgetDoc.exists) {
    return budgetDoc.data();
  } else {
    return null;
  }
});
