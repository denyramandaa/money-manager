import { db } from '../../../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  const { yearMonth, user } = event.context.params;

  const spendingDocRef = db.collection('Spending').doc(yearMonth);
  const spendingDoc = await spendingDocRef.get();

  if (spendingDoc.exists && spendingDoc.data()[user]) {
    return spendingDoc.data()[user];
  } else {
    return null;
  }
});
