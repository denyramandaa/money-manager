import { db } from '../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  try {
    const snapshot = await db.collection('Spending').get();
    const result = snapshot.docs.map(doc => doc.id);
    return result;
  } catch (error) {
    console.error('Error fetching spending documents:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching spending documents',
    });
  }
});
