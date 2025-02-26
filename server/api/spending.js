import { db } from '../services/firebaseAdmin';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { yearMonth, day, dayDetail, spendingData } = body;

  // Reference to the main document for the specific yearMonth
  const mainDocRef = db.collection('Spending').doc(yearMonth);

  // Check if the main document for the yearMonth already exists
  const mainDoc = await mainDocRef.get();
  if (!mainDoc.exists) {
    await mainDocRef.set({ id: yearMonth });
  }

  // Reference to the document for the specific day in the detail subcollection
  const dayDocRef = mainDocRef.collection('detail').doc(day);

  // Check if the document for the day already exists
  const dayDoc = await dayDocRef.get();

  const formatDayDetail = {
    ...dayDetail,
    date: new Date(dayDetail.date)
  }
  if (!dayDoc.exists) {
    await dayDocRef.set(formatDayDetail);
  }

  const formatSpendingData = {
    ...spendingData,
    date: new Date(spendingData.date)
  }
  // Add the spendingData to the subcollection and get the reference to the new document
  const newSpendingDocRef = await dayDocRef.collection('spendingData').add(formatSpendingData);

  // Update the document with the ID of the new spendingData document
  await newSpendingDocRef.update({ id: newSpendingDocRef.id });

  return { success: true };
});
