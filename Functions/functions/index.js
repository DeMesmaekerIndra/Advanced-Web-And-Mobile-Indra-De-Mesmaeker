const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({
    origin: true
});
const allowedHttpIps = ['195.201.26.157', '116.203.134.67', '116.203.129.16'];

admin.initializeApp();
let db = admin.database();

/* HELPER FUNCTIONS */
function GetDateWithoutTime() {
    let todayAsDate = new Date();
    const todayAsString = todayAsDate.getFullYear() + '-' + (todayAsDate.getMonth() + 1) + '-' + todayAsDate.getDate();
    todayAsDate = new Date(todayAsString);

    return todayAsDate.getTime();
}

function ValidateHeader(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
        return req.headers.authorization.split('Basic ')[1];
    }
}

function DecodeAuthString(encodedAuth) {
    const buffer = new Buffer(encodedAuth, 'base64');
    return buffer.toString('ascii');
}

function IsValidLogin(decodedAuth) {
    const username = decodedAuth.split(':')[0];
    const password = decodedAuth.split(':')[1];

    return username === functions.config().cron.username && password === functions.config().cron.password;
}

async function SendMail(mailSubject, mailBody) {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: functions.config().gmail.email,
            pass: functions.config().gmail.password,
        },
    });

    const mailOptions = {
        from: '"Fme Production cloudfunctions" <advanced.web.and.mobile@gmail.com>',
        to: 'indra_dm@hotmail.com',
    };

    mailOptions.subject = mailSubject;
    mailOptions.text = mailBody;

    try {
        await transport.sendMail(mailOptions);
    } catch (error) {
        console.error('There was an error while sending the email:', error);
    }
}

/* FIREBASE TRIGGER FUNCTIONS */
exports.CreateDailyAssessment = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const sourceIp = req.ip;

        if (!allowedHttpIps.includes(sourceIp)) {
            console.error("Attempt to execute 'CreateDailyAssessments' from a non-whitelisted source: " + sourceIp);
            SendMail('UNAUTHORIZED EXECUTION ATTEMPT!', "Attempt to execute 'CreateDailyAssessments' from a non-whitelisted source: " + sourceIp);
            return res.status(403).send('Request from non-whitelisted source');
        }

        if (req.method !== 'POST') {
            console.error("Attempt to execute 'CreateDailyAssessments': Wrong method");
            return res.status(405).send('Invalid Request');
        }

        const AuthEncoded = ValidateHeader(req);
        if (!AuthEncoded) {
            return res.status(403).send('Not Authorized! No authentication found');
        }

        const AuthDecoded = DecodeAuthString(AuthEncoded);
        if (!IsValidLogin(AuthDecoded)) {
            return res.status(403).send('Not Authorized! Invalid authentication');
        }

        let updates = {};
        let postResult = {
            "Assessments_Added": 0,
            "Total_Tasks": 0,
            "Tasks_Set_To_Done": 0
        };

        return db.ref('/Users').once('value', (snapshot) => {
            snapshot.forEach((user) => {
                const tasks = user.child('Tasks');
                const todayAsDate = new Date();
                const todayAsString = todayAsDate.getFullYear() + '-' + (todayAsDate.getMonth() + 1) + '-' + todayAsDate.getDate();

                postResult.Total_Tasks = tasks.numChildren();
                tasks.forEach(task => {
                    if (task.hasChild('EndDate') && task.child('Status').val() !== "Done") {
                        const endDate = new Date(task.child('EndDate').val());

                        if (endDate.getTime() < GetDateWithoutTime()) {
                            updates[`/Users/${user.key}/Tasks/${task.key}/Status`] = "Done";
                            postResult.Tasks_Set_To_Done++;
                        }
                    }

                    if (task.child('Status').val() === "Busy") {
                        const newKey = db.ref().child(`/Users/${user.key}/Assessments/`).push().key;

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

            return res.status(200).send(`OK! ${JSON.stringify(postResult)}`);
        });
    });
});

exports.AssessmentOnCreate = functions.database.ref('/Users/{userId}/Assessments/{assessmentId}/').onCreate((snapshot) => {
    return snapshot.ref.child('Status').set('Missed');
});

exports.AssessmentOnUpdate = functions.database.ref('/Users/{userId}/Assessments/{assessmentId}/Score').onUpdate(async (snapshot) => {
    return snapshot.after.ref.parent.once('value', (assessmentSnapshot) => {
        if (assessmentSnapshot.child('Status').val() === 'Invalid') {
            return null;
        }

        const statusValue = (snapshot.after.val() > 0) ? 'Done' : 'Missed';
        return assessmentSnapshot.ref.child('Status').set(statusValue);
    });
});

exports.TaskOnCreate = functions.database.ref('/Users/{userId}/Tasks/{taskId}/').onCreate((snapshot) => {
    return snapshot.ref.child('Status').set('Busy');
});

exports.TaskOnUpdate = functions.database.ref('/Users/{userId}/Tasks/{taskId}/').onUpdate(async (snapshot) => {
    const fullpath = snapshot.after.ref.toString();
    const delimited = fullpath.split('/');
    const assessmentSnapshot = await db.ref(`/Users/${delimited[4]}/Assessments`).orderByChild('TaskId').equalTo(delimited[6]).once('value');
    let updates = {};

    if (!snapshot.after.hasChild('EndDate')) {
        assessmentSnapshot.forEach(a => {
            const path = `/Users/${delimited[4]}/Assessments/${a.key}/Status`;

            if (a.child('Status').val() === 'Invalid') {
                updates[path] = (a.child('Score').val() > 0) ? 'Done' : 'Missed';
            }
        });

        db.ref().update(updates);
        return snapshot.after.ref.child('Status').set('Busy');

    } else {
        const endDate = new Date(snapshot.after.child('EndDate').val());

        assessmentSnapshot.forEach(a => {
            const assessmentDate = new Date(a.child('Date').val());
            const path = `/Users/${delimited[4]}/Assessments/${a.key}/Status`;

            if (assessmentDate.getTime() > endDate.getTime() && a.child('Status').val() !== 'Invalid') {
                updates[path] = 'Invalid';

            } else if (assessmentDate.getTime() <= endDate.getTime() && a.child('Status').val() === 'Invalid') {
                updates[path] = (a.child('Score').val() > 0) ? 'Done' : 'Missed';
            }
        });

        db.ref().update(updates);

        const statusValue = (endDate.getTime() >= GetDateWithoutTime()) ? 'Busy' : 'Done';
        return snapshot.after.ref.child('Status').set(statusValue);
    }
});