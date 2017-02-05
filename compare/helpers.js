const R = require('ramda');
const streakBonus = 1;
const streakDiffuser = 2;
const winningPercentageBonus = 2.5;
const homeTeamBonus = 1;
const headToHeadBonus = 1;
const pkBonus = 1;
const ppBonus = 1.5;
const shootOutBonus = 2.25;
const faceoffBonus = 0.1;
const standardAdvantageBuckets = [
    {
        min: 0,
        max: 0,
        points: 0
    },
    {
        min: 1,
        max: 5,
        points: 0.5
    },
    {
        min: 6,
        max: 10,
        points: 1
    },
    {
        min: 11,
        max: 15,
        points: 1.5
    },
    {
        min: 16,
        max: 1000,
        points: 2
    }
];

//OPJ:NHL
const abbvMap = {
  'WIN': 'WPG',
  'TB': 'TBL',
  'LA': 'LAK',
  'SJ': 'SJS',
  'NJ': 'NJD',
  'CLB': 'CBJ',
  'WAS': 'WSH',
  'MON': 'MTL'
};

let abbvReverseMap = {};

R.forEach(key => {
    abbvReverseMap[abbvMap[key]] = key;
}, R.keys(abbvMap));

const algorithmMap = {
    latest: [
        'assignWinningPercentageAdv',
        'assignGoalsForGoalsAgainstAdv',
        'assignGoalsForPerGameGoalsAgainstPerGameAdv',
        'assignOTWinsAdv',
        'assignHomeTeamAdv',
        'assignHeadToHeadAdv',
        'assignStreakAdv',
        'assignPenaltyKillAdv',
        'assignPowerPlayAdv',
        'assignShootOutAdv'
    ],
    backtester: [
        'assignWinningPercentageAdv',
        'assignGoalsForGoalsAgainstAdv',
        'assignGoalsForPerGameGoalsAgainstPerGameAdv',
    ],
    week2: ['assignWinningPercentageAdv', 'assignStreakAdv'],
    week1: ['assignPointsAdv', 'assignStreakAdv']
};

class Helper {
    constructor(algorithm, stats) {
      this.abbvMap = abbvMap;
      this.algorithmSteps = algorithmMap[algorithm];
      this.stats = stats;
    }

    static abbvReverseMap() {
      return abbvReverseMap;
    }

    digest(abbvA, abbvB) {
        let teamA = this.findTeamInStandings(abbvA);
        let teamB = this.findTeamInStandings(abbvB);
        let teamAFullStats = this.findTeamStats(abbvA);
        let teamBFullStats = this.findTeamStats(abbvB);

        this.compare = {
            a: teamA,
            aFullStats: teamAFullStats,
            aAdvAudit: {},
            aAdv: 0,
            b: teamB,
            bFullStats: teamBFullStats,
            bAdvAudit: {},
            bAdv: 0
        };

        this.algorithmSteps.forEach(step => {
            this[step]()
        });

        this.compare.aAdv = R.reduce(R.add, 0, R.values(this.compare.aAdvAudit));
        this.compare.bAdv = R.reduce(R.add, 0, R.values(this.compare.bAdvAudit));

        return this.compare;
    }

    assignPointsAdv() {
        let diff = this.compare.a.points - this.compare.b.points;
        this.differentialHelper(diff, 'points', standardAdvantageBuckets);
    }

    assignWinningPercentageAdv() {
        let teamAWinningPercentage = this.compare.a.leagueRecord.wins/this.compare.a.gamesPlayed;
        let teamBWinningPercentage = this.compare.b.leagueRecord.wins/this.compare.b.gamesPlayed;
        let diff = teamAWinningPercentage - teamBWinningPercentage;

        this.compare.aAdvAudit['winningPercentage'] = diff > 0
            ? winningPercentageBonus
            : 0;
        this.compare.aActualWinningPercentage = `%${(teamAWinningPercentage * 100).toFixed(2)}`;
        this.compare.bAdvAudit['winningPercentage'] = diff < 0
            ? winningPercentageBonus
            : 0;
        this.compare.bActualWinningPercentage = `%${(teamBWinningPercentage * 100).toFixed(2)}`;
    }

    assignOTWinsAdv() {
        let diff = this.compare.a.leagueRecord.ot - this.compare.b.leagueRecord.ot;
        this.differentialHelper(diff, 'ot', standardAdvantageBuckets);
    }

    assignGoalsForGoalsAgainstAdv() {
        let teamAWinningPercentage = this.calculateWinningPercentage(this.compare.a);
        let teamBWinningPercentage = this.calculateWinningPercentage(this.compare.b);
        let diff = teamAWinningPercentage - teamBWinningPercentage;

        this.compare.aAdvAudit['calculatedWinPer'] = diff > 0
            ? winningPercentageBonus
            : 0;
        this.compare.aCalculatedWinningPercentage = `%${(teamAWinningPercentage * 100).toFixed(2)}`;
        this.compare.bAdvAudit['calculatedWinPer'] = diff < 0
            ? winningPercentageBonus
            : 0;
        this.compare.bCalculatedWinningPercentage = `%${(teamBWinningPercentage * 100).toFixed(2)}`;
    }

    assignGoalsForPerGameGoalsAgainstPerGameAdv() {
        let teamAWinningPercentage = this.calculateWinningPercentageViaRegression(this.compare.a);
        let teamBWinningPercentage = this.calculateWinningPercentageViaRegression(this.compare.b);
        let diff = teamAWinningPercentage - teamBWinningPercentage;

        this.compare.aAdvAudit['calculatedWinPerReg'] = diff > 0
            ? winningPercentageBonus
            : 0;
        this.compare.aCalculatedWinningPercentageReg = `%${(teamAWinningPercentage * 100).toFixed(2)}`;
        this.compare.bAdvAudit['calculatedWinPerReg'] = diff < 0
            ? winningPercentageBonus
            : 0;
        this.compare.bCalculatedWinningPercentageReg = `%${(teamBWinningPercentage * 100).toFixed(2)}`;
    }

    assignStreakAdv() {
        let aStreak = this.compare.a.streak;
        let bStreak = this.compare.b.streak;

        if (aStreak.streakType === 'wins') {
            this.compare.aAdvAudit['streak'] = (streakBonus + Math.floor(aStreak.streakNumber/streakDiffuser));
        } else {
            this.compare.aAdvAudit['streak'] = 0;
        }

        if (bStreak.streakType === 'wins') {
            this.compare.bAdvAudit['streak'] = (streakBonus + Math.floor(bStreak.streakNumber/streakDiffuser));
        } else {
            this.compare.bAdvAudit['streak'] = 0;
        }
    }

    assignHomeTeamAdv() {
        //teamA is the home team
        this.compare.aAdvAudit['hometeam'] = homeTeamBonus;
        this.compare.bAdvAudit['hometeam'] = 0;
    }

    assignHeadToHeadAdv() {
        let headToHeadGames;

        R.compose(
            teamAWins => {
                this.compare.aAdvAudit['headtohead'] = teamAWins.length > (headToHeadGames.length - teamAWins.length)
                    ? headToHeadBonus
                    : 0;

                this.compare.bAdvAudit['headtohead'] = teamAWins.length < (headToHeadGames.length - teamAWins.length)
                    ? headToHeadBonus
                    : 0;
            },
            R.filter(game => {
                return game.away.team.abbreviation === this.compare.a.team.abbreviation
                    && game.away.score > game.home.score;
            }),
            schedule => {
                headToHeadGames = R.filter(game => {
                    return (game.away.team.abbreviation === this.compare.a.team.abbreviation
                        && game.home.team.abbreviation === this.compare.b.team.abbreviation)
                        || (game.away.team.abbreviation === this.compare.b.team.abbreviation
                        && game.home.team.abbreviation === this.compare.a.team.abbreviation);
                }, schedule);

                return headToHeadGames;
            }
        )(this.stats.schedule);
    }

    assignPenaltyKillAdv() {
        let diff = this.compare.aFullStats.pkPctg - this.compare.bFullStats.pkPctg;

        this.compare.aAdvAudit['pk'] = diff > 0
            ? pkBonus
            : 0;
        this.compare.bAdvAudit['pk'] = diff < 0
            ? pkBonus
            : 0;
    }

    assignPowerPlayAdv() {
        let diff = this.compare.aFullStats.ppPctg - this.compare.bFullStats.ppPctg;

        this.compare.aAdvAudit['pp'] = diff > 0
            ? ppBonus
            : 0;
        this.compare.bAdvAudit['pp'] = diff < 0
            ? ppBonus
            : 0;
    }

    assignShootOutAdv(){
        let diff = this.compare.aFullStats.shootoutGamesWon - this.compare.bFullStats.shootoutGamesWon;

        this.compare.aAdvAudit['shootout'] = diff > 0
            ? shootOutBonus
            : 0;
        this.compare.bAdvAudit['shootout'] = diff < 0
            ? shootOutBonus
            : 0;
    }

    assignFaceoffWinPctAdv() {
        let diff = this.compare.aFullStats.faceoffWinPctg - this.compare.bFullStats.faceoffWinPctg;

        this.compare.aAdvAudit['faceoff'] = diff > 0
            ? faceoffBonus
            : 0;
        this.compare.bAdvAudit['faceoff'] = diff < 0
            ? faceoffBonus
            : 0;
    }

    findTeamInStandings(abbv) {
        abbv = this.abbvMap.hasOwnProperty(abbv)
            ? abbvMap[abbv]
            : abbv;

        return R.find(R.pathEq(['team', 'abbreviation'], abbv))(this.stats.standings);
    }

    differentialHelper(diff, key, bucket) {
        let absDiff = Math.abs(diff);

        let points = R.find(b => {
            return absDiff >= b.min && absDiff <= b.max;
        })(bucket).points;

        this.compare.aAdvAudit[key] = diff > 0 ? points : 0;
        this.compare.bAdvAudit[key] = diff < 0 ? points : 0;
    }

    calculateWinningPercentage(teamData) {
        let goalsForPerGame = teamData.goalsScored / teamData.gamesPlayed;
        let goalsAgainstPerGame = teamData.goalsAgainst / teamData.gamesPlayed;

        return Math.pow(goalsForPerGame, 2) /
            (Math.pow(goalsForPerGame, 2) + Math.pow(goalsAgainstPerGame, 2));
    }

    calculateWinningPercentageViaRegression(teamData) {
        let goalsForPerGame = teamData.goalsScored / teamData.gamesPlayed;
        let goalsAgainstPerGame = teamData.goalsAgainst / teamData.gamesPlayed;

        return 0.500 + ((0.1457 * goalsForPerGame) - (0.1457 * goalsAgainstPerGame));
    }

    findTeamStats(abbv) {
        abbv = this.abbvMap.hasOwnProperty(abbv)
            ? abbvMap[abbv]
            : abbv;

        return this.stats.teams[abbv];
    }
}

module.exports = Helper;
