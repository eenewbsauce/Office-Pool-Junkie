const argv = require('minimist')(process.argv.slice(2));

module.exports = function() {
    return {
        selectionAlgorithm: argv.algo || 'latest',
        submitSelections: !!argv.submitSelections,
        shouldSaveMatchups: !!argv.shouldSaveMatchups,
        shouldSaveSelections: !!argv.shouldSaveSelections,
        shouldSaveStats: !!argv.shouldSaveStats,
        useSavedMatchups: !!argv.useSavedMatchups,
        useSavedStats: !!argv.useSavedStats,
        chunkSize: argv.chunkSize
    };
}
