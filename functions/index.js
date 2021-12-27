const fs = require('fs');
const path = require('path');

// NOTE Currently nested directories under "functions" is NOT supported.
//      What this means is only immediate children JavaScript files of
//      "functions" is counted, directories are going to be omitted.

module.exports = (/** @type {FunctionFnArgs} */ args) => {
  return fs.readdirSync(__dirname, { withFileTypes: true })
    .filter((dirent) => dirent.name[0] !== '_' && dirent.isFile() && dirent.name !== 'index.js' && path.extname(dirent.name) === '.js')
    .reduce((obj, dirent) => {
      const {
        name = undefined,
        fn,
      } = require(path.join(__dirname, dirent.name))(args);

      obj[name || path.parse(dirent.name).name] = fn;

      return obj;
    }, {});
};

/**
 * @typedef {Object} FunctionFnArgs
 * @property {Object} script
 * @property {string} script.localPath
 * @property {string | null} script.contentsLocalPath
 * @property {Object} project
 * @property {string} project.name
 * @property {string} project.root
 * @property {Object} flags
 * @property {boolean} flags.dryRun
 * @property {boolean} flags.silent
 * @property {boolean} flags.force
 * @property {import('../managers/index').Manager} manager
 */
