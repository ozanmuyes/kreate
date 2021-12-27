const fs = require('fs');
const path = require('path');

// NOTE Currently nested directories under "managers" is NOT supported.
//      What this means is only immediate children JavaScript files of
//      "managers" is counted, directories are going to be omitted.

/**
 * @param {string} PROJECT_ROOT
 * @returns {Array<Manager>}
 */
function init(PROJECT_ROOT) {
  return fs.readdirSync(__dirname, { withFileTypes: true })
    .filter((dirent) => dirent.name[0] !== '_' && dirent.isFile() && dirent.name !== 'index.js' && path.extname(dirent.name) === '.js')
    .reduce((obj, dirent) => {
      const manager = require(path.join(__dirname, dirent.name));

      obj[manager.name || path.parse(dirent.name).name] = manager.fn(PROJECT_ROOT);

      return obj;
    }, {});
}

module.exports = init;

/**
 * @typedef {Object} Manager
 * @property {(string, boolean) => void} installDependencies
 * @property {(string, boolean) => void} removeDependencies
 * @property {(string) => void} exec
 */
