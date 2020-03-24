const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();
let db = admin.database();

exports.CreateDailyAssessment = functions.https.onRequest(async (request, response) => {
    let updates = {};
    await db.ref('/Users').once('value').then((snapshot) => {
        snapshot.forEach(async (user) => {

            let tasks = user.child('Tasks');
            let AssessmentPerUser = {};

            tasks.forEach(task => {
                if (task.status === "Busy") {
                    let today = new Date();
                    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    AssessmentPerUser.push({
                        "Date": date.toString(),
                        "Score": 0,
                        "Status": "Missed"
                    });
                }
            });

            updates['/Users/' + user.key + '/Assessments/' + db.ref('/Users').push().key] = AssessmentPerUser;

            //ref.update(updates);

            /*let tasks = JSON.parse(user.child('Tasks/').toJSON().toString());
            let busyTasks = Object.values(tasks).filter(t => t.Status === "Busy");

            response.send(busyTasks);*/
        });
        response.send(updates);

        //response.send("User count: " + userAmount.toString() + " | Task count: " + taskCount.toString() + " | Assessment count: " + assessmentCount.toString());
        return null;
    });
});