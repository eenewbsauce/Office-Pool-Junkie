const R = require('ramda');

class Helper {
    findTeamInStandings(teamName, standings) {
        return R.find(R.pathEq(['team', 'name'], teamName))(standings);
    }
}

module.exports = new Helper();
