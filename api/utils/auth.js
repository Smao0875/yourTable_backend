"use strict";

var jwt = require("jsonwebtoken");

const sharedSecret = '!@#yourTableSharedSecret_ohyeah';
const issuer = 'YourTable';

module.exports = {
    verifyToken: verifyToken,
    issueToken: issueToken
};

function verifyToken(token, callback) {

    var error = Error('Access token is missing or invalid');

    jwt.verify(token, sharedSecret, function(verificationError, decodedToken) {

        if (verificationError === null && decodedToken) {
            var issuerMatch = decodedToken.iss === issuer;

            if (issuerMatch) {

                return callback(null, decodedToken.sub)
            } else {
                return callback(error, null)
            }
        } else {
            return callback(error, null)
        }
    });
}

function issueToken(userID) {
    return jwt.sign(
        {
            sub: userID,
            iss: issuer
        },

        sharedSecret
    )
}
