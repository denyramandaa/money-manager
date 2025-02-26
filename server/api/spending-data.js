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

  try {
    const snapshot = await db.collection('Spending').doc(yearMonth).collection('detail').get();
    const spendingData = [];

    for (const doc of snapshot.docs) {
      const dayData = await doc.ref.collection('spendingData').get();
      dayData.forEach(spendingDoc => {
        spendingData.push(spendingDoc.data());
      });
    }

    return spendingData;
  } catch (error) {
    console.error('Error fetching spending data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching spending data',
    });
  }
});
