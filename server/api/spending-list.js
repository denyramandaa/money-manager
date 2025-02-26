import { db } from '../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const yearMonth = query.data;

  if (!yearMonth) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required query parameter: data',
    });
  }

  const spendingCollection = db.collection('Spending').doc(yearMonth).collection('detail');
  const snapshot = await spendingCollection.orderBy('date', 'desc').get();  // Order by date in descending order

  if (snapshot.empty) {
    return [];
  }

  const result = [];
  for (const doc of snapshot.docs) {
    const dayData = {
      id: doc.id,
      ...doc.data(),
    };

    const spendingSnapshot = await spendingCollection.doc(doc.id).collection('spendingData').orderBy('date', 'desc').get(); // Order spendingData by date
    dayData.spendingData = spendingSnapshot.docs.map(spendingDoc => ({
      id: spendingDoc.id,
      ...spendingDoc.data(),
    }));

    result.push(dayData);
  }

  return result;
});
