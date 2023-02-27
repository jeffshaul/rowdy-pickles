const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: 'server/keys.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const authClientObject = auth.getClient();

const googleSheetsInstance = google.sheets({
    version: 'v4',
    auth: authClientObject
});

const spreadsheetId = '1YdnL1SEMP1N6nj86-7Z4vjfaV264SjkuSLA6vZ07ST8';

exports.writeToLeaderboard = (pickleNumber, score) => {
    return googleSheetsInstance.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Scores!A:B',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[`${pickleNumber}`, `${score}`]]
        }
    }).then((res => {
        return res;
    }));
}

exports.readFromLeaderboard = () => {
    return googleSheetsInstance.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Leaderboard!A:B'
    }).then((res => {
        return res.data;
    }));
}