const R = require('ramda');
const streakBonus = 1;
const streakDiffuser = 3;
const winningPercentageBonus = 2;
const homeTeamBonus = 1;
const headToHeadBonus = 1;
const standardAdvantageBuckets = [
    {
        min: 0,
        max: 0,
        points: 0
    },
    {
        min: 1,
        max: 5,
        points: 1
    },
    {
        min: 6,
        max: 10,
        points: 2
    },
    {
        min: 11,
        max: 15,
        points: 3
    },
    {
        min: 16,
        max: 1000,
        points: 4
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
        'assignOTWinsAdv',
        'assignHomeTeamAdv',
        'assignHeadToHeadAdv',
        'assignStreakAdv'
    ],
    backtester: [
        'assignWinningPercentageAdv',
        'assignGoalsForGoalsAgainstAdv',
        'assignHeadToHeadAdv',
        'assignHomeTeamAdv'
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

        this.compare = {
            a: teamA,
            aAdvAudit: {},
            aAdv: 0,
            b: teamB,
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
        return Math.pow(teamData.goalsScored, 2) /
            (Math.pow(teamData.goalsScored, 2) + Math.pow(teamData.goalsAgainst, 2));
    }
}

module.exports = Helper;
