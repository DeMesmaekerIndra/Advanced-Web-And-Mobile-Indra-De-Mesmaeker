const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();
let db = admin.database();

exports.CreateDailyAssessment = functions.https.onRequest(async (request, response) => {
    let updates = {};
    let postResult = {
        "Assessments_Added": 0,
        "Total_Tasks: ": 0,
        "Tasks_Set_To_Done": 0
    };

    await db.ref('/Users').once('value').then((snapshot) => {
        snapshot.forEach((user) => {

            let tasks = user.child('Tasks');

            tasks.forEach(task => {
                if (task.child('Status').val() === "Busy") {
                    let today = new Date();
                    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    let newKey = db.ref().child(`/Users/${user.key}/Assessments/`).push().key;

                    updates[`/Users/${user.key}/Assessments/${newKey}`] = {
                        "Date": date.toString(),
                        "Score": 0,
                        "Status": "Missed",
                        "TaskId": task.key
                    };
                }
            });

            db.ref().update(updates);
        });

        response.send(JSON.stringify(postResult));
        return null;
    });
});