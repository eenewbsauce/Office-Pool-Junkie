const R = require('ramda');
const streakBonus = 2;
const streakDiffuser = 2;
const standingsPointsWinsAdvantageBuckets = [
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
}

const algorithmMap = {
    latest: ['assignWinsAdv', 'assignStreakAdv'],
    week1: ['assignPointsAdv', 'assignStreakAdv']
};

let abbvReverseMap = {};
R.forEach(key => {
    abbvReverseMap[abbvMap[key]] = key;
}, R.keys(abbvMap));

class Helper {
    constructor(algorithm, standings) {
      this.abbvMap = abbvMap;
      this.algorithmSteps = algorithmMap[algorithm];
      this.standings = standings;
    }

    static abbvReverseMap() {
      return abbvReverseMap;
    }

    digest(abbvA, abbvB) {
      let teamA = this.findTeamInStandings(abbvA);
      let teamB = this.findTeamInStandings(abbvB);

      let compare = {
        a: teamA,
        aAdv: 0,
        b: teamB,
        bAdv: 0
      };

      this.compare = compare;

      this.algorithmSteps.forEach(step => {
        this[step]()
      });

      return this.compare;
    }

    findTeamInStandings(abbv) {
        abbv = this.abbvMap.hasOwnProperty(abbv)
          ? abbvMap[abbv]
          : abbv;

        return R.find(R.pathEq(['team', 'abbreviation'], abbv))(this.standings);
    }

    assignPointsAdv() {
        let diff = this.compare.a.points - this.compare.b.points;
        this.differentialHelper(diff, standingsPointsWinsAdvantageBuckets);
    }

    assignWinsAdv() {
        let diff = this.compare.a.leagueRecord.wins - this.compare.b.leagueRecord.wins;
        this.differentialHelper(diff, standingsPointsWinsAdvantageBuckets);
    }

    assignOTWinsAdv() {
        let diff = this.compare.a.leagueRecord.ot - this.compare.b.leagueRecord.ot;
        this.differentialHelper(diff);
    }

    differentialHelper(diff, bucket) {
        let absDiff = Math.abs(diff);

        let points = R.find(b => {
            return absDiff >= b.min && absDiff <= b.max;
        })(bucket).points;

        this.compare.aAdv += diff > 0 ? points : 0;
        this.compare.bAdv += diff < 0 ? points : 0;
    }

    assignHeadToHeadAdv() {

    }

    goalsForVsGoalsAgainst() {

    }

    assignStreakAdv() {
      let aStreak = this.compare.a.streak;
      let bStreak = this.compare.b.streak;

      if (aStreak.streakType === 'wins') {
          this.compare.aAdv += (streakBonus + Math.floor(aStreak.streakNumber/streakDiffuser));
      }

      if (bStreak.streakType === 'wins') {
          this.compare.bAdv += (streakBonus + Math.floor(bStreak.streakNumber/streakDiffuser));
      }
    }
}

module.exports = Helper;
