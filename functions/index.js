const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

exports.makeAdmin = functions.https.onCall((data, context) => {

  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated as admin.');
  }

  auth.getUserByEmail(data.email)
    .then(user => auth.setCustomUserClaims(user.uid, { admin: true }))
    .then(() => { message: `User ${data.email} is admin now.` })
    .catch(err => err)
});

// exports.testDb = functions.https.onRequest((request, response) => {

//   db.collection('tests')
//     .add({ data: Math.random() * 100 })
//     .then(docRef => {
//       response.send(docRef.id);
//     })
//     .catch(error => response.send(error));
// });
