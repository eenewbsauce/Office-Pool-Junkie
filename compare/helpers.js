const R = require('ramda');
const streakBonus = 2;
const streakDiffuser = 2;
const standingsPointsAdvantageBuckets = [
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
  latest: ['assignPointsAdv', 'assignStreakAdv']
}

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

      // console.dir(teamA);
      // console.dir(teamB);

      let compare = {
        a: teamA,
        aAdv: 0,
        b: teamB,
        bAdv: 0
      };

      this.algorithmSteps.forEach(step => {
        this[step](compare);
      });

      return compare;
    }

    findTeamInStandings(abbv) {
        abbv = this.abbvMap.hasOwnProperty(abbv)
          ? abbvMap[abbv]
          : abbv;

        return R.find(R.pathEq(['team', 'abbreviation'], abbv))(this.standings);
    }

    assignPointsAdv(compare) {
        let diff = compare.a.points - compare.b.points;
        let absDiff = Math.abs(diff);

        let points = R.find(b => {
          return absDiff >= b.min && absDiff <= b.max;
        })(standingsPointsAdvantageBuckets).points;

        compare.aAdv += diff > 0 ? points : 0;
        compare.bAdv += diff < 0 ? points : 0;
     }

    assignStreakAdv(compare) {
      let aStreak = compare.a.streak;
      let bStreak = compare.b.streak;

      if (aStreak.streakType === 'wins') {
          compare.aAdv += (streakBonus + Math.floor(aStreak.streakNumber/streakDiffuser));
      }

      if (bStreak.streakType === 'wins') {
          compare.bAdv += (streakBonus + Math.floor(bStreak.streakNumber/streakDiffuser));
      }
    }
}

module.exports = Helper;
