import { db } from '../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { yearMonth, day, spendingDataId } = body;

  // Reference to the main document for the specific yearMonth
  const mainDocRef = db.collection('Spending').doc(yearMonth);

  // Reference to the document for the specific day in the detail subcollection
  const dayDocRef = mainDocRef.collection('detail').doc(day);

  // Reference to the document in the spendingData subcollection
  const spendingDataDocRef = dayDocRef.collection('spendingData').doc(spendingDataId);

  // Check if the document exists
  const spendingDataDoc = await spendingDataDocRef.get();
  if (!spendingDataDoc.exists) {
    return { success: false, message: 'Document not found' };
  }

  // Delete the document
  await spendingDataDocRef.delete();

  return { success: true, message: 'Document deleted successfully' };
});
