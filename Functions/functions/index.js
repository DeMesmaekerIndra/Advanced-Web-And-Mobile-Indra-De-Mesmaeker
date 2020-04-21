const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
    origin: true
});

admin.initializeApp();
let db = admin.database();

/* HELPER FUNCTIONS */
function ValidateHeader(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
        return req.headers.authorization.split('Basic ')[1];
    }
}

function DecodeAuthString(encodedAuth) {
    let buffer = new Buffer(encodedAuth, 'base64');
    return buffer.toString('ascii');
}

function IsValidLogin(decodedAuth) {
    let username = decodedAuth.split(':')[0];
    let password = decodedAuth.split(':')[1];

    return username === 'IndraDeMesmaeker' && password === '`YDD5p*54M3S(FoXHtf)Sct3s&p(';
}

/* FIREBASE TRIGGER FUNCTIONS */
exports.CreateDailyAssessment = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {

        let AuthEncoded = ValidateHeader(request);
        if (!AuthEncoded) {
            console.error("UNAUTHORIZED ATTEMPT TO EXECUTE 'CreateDailyAssessments: No authentication in header'");
            return response.status(403).send('Not Authorized! No authentication found');
        }

        let AuthDecoded = DecodeAuthString(AuthEncoded);
        if (!IsValidLogin(AuthDecoded)) {
            console.error("UNAUTHORIZED ATTEMPT TO EXECUTE 'CreateDailyAssessments: Invalid credentials'");
            return response.status(403).send('Not Authorized! Invalid authentication');
        }

        let updates = {};
        let postResult = {
            "Assessments_Added": 0,
            "Total_Tasks": 0,
            "Tasks_Set_To_Done": 0
        };

        return db.ref('/Users').once('value').then((snapshot) => {
            snapshot.forEach((user) => {
                let tasks = user.child('Tasks');
                let todayAsDate = new Date();
                let todayAsString = todayAsDate.getFullYear() + '-' + (todayAsDate.getMonth() + 1) + '-' + todayAsDate.getDate();

                postResult.Total_Tasks = tasks.numChildren();
                tasks.forEach(task => {
                    if (task.hasChild('EndDate') && task.child('Status').val() !== "Done") {
                        let endDate = new Date(task.child('EndDate').val());

                        if (endDate.getTime() < todayAsDate.getTime()) {
                            updates[`/Users/${user.key}/Tasks/${task.key}/Status`] = "Done";
                            postResult.Tasks_Set_To_Done++;
                        }
                    }

                    if (task.child('Status').val() === "Busy") {
                        let newKey = db.ref().child(`/Users/${user.key}/Assessments/`).push().key;

                        updates[`/Users/${user.key}/Assessments/${newKey}`] = {
                            "Date": todayAsString,
                            "Score": 0,
                            "Status": "Missed",
                            "TaskId": task.key
                        };

                        postResult.Assessments_Added++;
                    }
                });

                db.ref().update(updates);
            });

            return response.status(200).send(`OK! ${JSON.stringify(postResult)}`);
        });
    });
});

exports.AssessmentOnCreate = functions.database.ref('/Users/{userId}/Assessments/{assessmentId}/').onCreate((snapshot) => {
    if (!snapshot.hasChild('Status')) {

        console.log(`Assessment: ${snapshot.key} was set to missed`);
        return snapshot.ref.child('Status').set('Missed');
    }

    return null;
});

exports.AssessmentOnUpdate = functions.database.ref('/Users/{userId}/Assessments/{assessmentId}/').onUpdate((snapshot) => {
    if (snapshot.after.child('Score').val() > 0) {

        console.log(`Assessment: ${snapshot.after.key} was set to done`);
        return snapshot.after.ref.child('Status').set('Done');
    } else if (snapshot.after.child('Score').val() === 0) {

        console.log(`Assessment: ${snapshot.after.key} was set to missed`);
        return snapshot.after.ref.child('Status').set('Missed');
    }

    return null;
});

exports.TaskOnCreate = functions.database.ref('/Users/{userId}/Tasks/{taskId}/').onCreate((snapshot) => {
    if (!snapshot.hasChild('Status')) {

        console.log(`Task: ${snapshot.key} was set to busy`);
        return snapshot.ref.child('Status').set('Busy');
    }

    return null;
});

exports.TaskOnUpdate = functions.database.ref('/Users/{userId}/Tasks/{taskId}/').onUpdate((snapshot) => {
    if (!snapshot.hasChild('EndDate')) {

        console.log(`Task: ${snapshot.key} was set to Busy`);
        return snapshot.after.ref.child('Status').set('Busy');
    } else {
        let todayAsDate = new Date();
        let endDate = new Date(task.child('EndDate').val());

        if (endDate.getTime() > todayAsDate.getTime()) {
            return snapshot.after.ref.child('Status').set('Busy');
        } else if (endDate.getTime() < todayAsDate.getTime()) {
            //If the user sets an enddate for 1 week ago.
            //Should we allow this? --> We have no choice
            //What happens to the assessments of that week? --> Implement an invalid status
        }
    }
    return null;
});

//Remove this when going to production
exports.SecureEndPointTest = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {
        let AuthEncoded = ValidateHeader(req);
        if (!AuthEncoded) {
            return res.status(403).send('Not Authorized! No authentication found');
        }

        let AuthDecoded = DecodeAuthString(AuthEncoded);
        if (!IsValidLogin(AuthDecoded)) {
            return res.status(403).send('Not Authorized! Invalid authentication');
        }
        return res.status(200).send('OK! Authentication successful!');
    });
});