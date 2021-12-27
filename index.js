const appStartTime = Date.now();

const fs = require('fs');
const path = require('path');

// Handle and process CLI arguments
//
/**
 * Notes about CLI arguments
 *
 * - If `script_uri` URI is a file path on local file system and is
 *   relative, it is relative to current working directory: `pwd`
 *   for shell, `process.cwd()` for Node.js.
 *
 * - If `project_root_local` was defined and URI is a file path on local
 *   file system and is relative, it is relative to current working
 *   directory: `pwd` for shell, `process.cwd()` for Node.js.
 *
 * - If "positional" `project_name` was defined then "-n" ("--name")
 *   has no effect on the value. It merely adds `n` to the result
 *   with the value of "positional" `project_name` argument.
 *   So positional argument has precedence.
 *   The good thing about it that we can have an alias with `"n"`
 *   and `"project_name"` names (short and long, respecitvely).
 *   The long form is the same as positional counterpart.
 *
 * - TODO options will include; "silent", "dry run" flags
 */
const cliArgv = require('yargs/yargs')(process.argv.slice(2))
  // See https://github.com/yargs/yargs/blob/main/docs/advanced.md#positional-arguments
  .command('$0 <script_uri> [project_root_local] [project_name] [options]')
  // NOTE See https://github.com/yargs/yargs/blob/main/docs/advanced.md#describing-positional-arguments

  .alias('d', 'dry-run')
  .describe('d', 'Run the script only to report what steps was taken without changing the file system in any way.')

  .alias('s', 'silent')
  .describe('s', 'Show no kreate output or show no output at all. Note the TTY is still interactive.')

  .alias('f', 'force')
  .describe('f', 'Let the kreate to do actions that are irreversible, e.g. overwrite to a file or change version of a dependency (old version will be overwritten on package.json).')

  .boolean(['d', 's', 'f'])

  .alias('n', 'project_name')
  .describe('n', 'Set project name')

  .help()
  .argv;


const argv = {
  // #region Default values

  // #region Positional Arguments

  script_uri: '',
  project_root_local: '',
  project_name: `project_${Math.floor(Date.now() / 1000)}`,

  // #endregion Positional Arguments

  // #region Flags

  d: false,
  dryRun: false,

  s: false,
  silent: false,

  f: false,
  force: false,

  // #endregion Flags

  // #endregion Default values

  ...cliArgv,
}

// Preliminary checks and path validations
//
// NOTE The if statement below is unnecessary thanks to yargs,
//      nonethtless one can't be too cautious.
if (!argv.script_uri) {
  console.error('Script URI must be defined.');
  process.exit(1); // Do NOT change `1` to something else, yargs also exits with `1`
}

// Constants calculation
//
const PROJECT_NAME = argv.project_name.trim();

/** @type {string} */
let _tmpPath;

// #region SCRIPT_FILE_PATH

_tmpPath = argv.script_uri;
// TODO process `script_uri`: download if URL and construct absolute file paths
if (
  _tmpPath.startsWith('https://')
  || _tmpPath.startsWith('git@')
) {
  if (!argv.silent) {
    console.error('Remote script support is not yet implemented.');
  }
  process.exit(2);
  // TODO After the implementation (download remote files and folders) set `_tmpPath`
} else if (/* FIXME _tmpPath is a valid path on this system */ true) {
  if (!path.isAbsolute(_tmpPath)) {
    _tmpPath = path.join(process.cwd(), _tmpPath);
  }
} else {
  if (!argv.silent) {
    console.error('Unrecognized script URI.');
  }
  process.exit(3);
}

if (!fs.existsSync(_tmpPath)) {
  if (!argv.silent) {
    console.error(`Script couldn't found at "${_tmpPath}".`);
  }
  process.exit(4);
}

/** @type {string} Absolute path to the script file on the local file system. E.g. `"~/Downloads/foo/script.js"` */
const SCRIPT_FILE_PATH = _tmpPath;

// #endregion SCRIPT_FILE_PATH

// #region CONTENTS_PATH

_tmpPath = path.join(path.dirname(SCRIPT_FILE_PATH), 'contents');
const CONTENTS_PATH = fs.existsSync(_tmpPath)
  ? _tmpPath
  : null; // means no contents directory exists for the running script

// #endregion CONTENTS_PATH

// #region PROJECT_ROOT

_tmpPath = argv.project_root_local;
if (_tmpPath === '') {
  _tmpPath = path.join(process.cwd(), PROJECT_NAME);
} else if (!path.isAbsolute(_tmpPath)) {
  _tmpPath = _tmpPath[0] === '~'
    ? path.join(process.env.HOME, _tmpPath.substring(2))
    : path.join(process.cwd(), _tmpPath);
}

// TODO MAYBE Check if project root is a valid path on this system that points a directory (not a file)
if (path.extname(_tmpPath) !== '') {
  if (!argv.silent) {
    console.error(`Local path for project root ("${_tmpPath}") is not a valid path to directory. Exiting.`);
  }
  process.exit(9);
}

if (!argv.dryRun && fs.existsSync(_tmpPath)) {
  if (argv.force) {
    if (!argv.silent) {
      console.error('Designated project root is existing but because of force flag overwriting the directory.');
    }

    // TODO what to do? unlink the dir and create an empty one?
  } else {
    if (!argv.silent) {
      console.error('Designated project root is existing. Exiting.');
    }
    process.exit(5);
  }
} else {
  if (!argv.silent) {
    console.log(`Creating project root directory at "${_tmpPath}".`);
  }

  if (!argv.dryRun) {
    fs.mkdirSync(_tmpPath);
  }
}
let PROJECT_ROOT = _tmpPath;

// #endregion PROJECT_ROOT

// Lowe-level functions for package manager
//
const _managers = require('./managers')(PROJECT_ROOT);
if (_managers.length === 0) {
  if (!argv.silent) {
    console.error('No package manager registered.');
    // Meaning there is no any file under "kreate/managers" besides "index.js"
  }
  process.exit(6);
}
let _defaultPackageManager = _managers[Object.keys(_managers)[0]];
function setDefaultPackageManager(name) {
  // NOTE This is a low-level API
  if (!Object.keys(_managers).includes(name)) {
    if (!argv.silent) {
      console.error(`Unregistered package manager was used to set as default: "${name}". Available package managers are; "${Object.keys(_managers).join(', ')}". Exiting.`);
    }
    // Exit because script might try to install dependency
    // via non-existent package manager
    process.exit(7);
  }

  if (!argv.silent) {
    console.log(`Setting the default package manager to "${name}".`);
  }

  _defaultPackageManager = _managers[name];
}

// Create function args object and get functions
//
/** @type {import('./functions/index').FunctionFnArgs} */
const functionFnArgs = {
  flags: {
    dryRun: argv.dryRun,
    silent: argv.silent,
    force: argv.force,
  },
  script: {
    localPath: SCRIPT_FILE_PATH,
    contentsLocalPath: CONTENTS_PATH,
  },
  project: {
    get name() { return PROJECT_NAME; },
    get root() { return PROJECT_ROOT; },
  },

  get manager() {
    return _defaultPackageManager;
  },
};

const functions = require('./functions')(functionFnArgs);

const readlineSync = require('readline-sync');

// Core functions
//
// NOTE TR bunlar burada, "functions" klasöründe değil, çünkü
//         scope'u burada yakalamamız lazım; `projectRoot`
//         gibi önemli şeyleri kontrollü değiştirmemiz
//         lazım.
function askProjectRoot() {
  // NOTE Raison d'etre: after some `npx` or `yarn create` commands
  //      there is generally a need to change the root.

  if (argv.dryRun) {
    if (!argv.silent) {
      console.log('Ask for project root.');
    }
    return;
  }

  let isAnswerCorrect = false;

  while (!isAnswerCorrect) {
    const answer = readlineSync.question(`New project root: ${PROJECT_ROOT}/`);

    // NOTE NO `path.join` here - to jail under current project root (if we were to use `path.join` "../" can be used to cd into parent directory of the project root, which is NOT what we want)
    const targetPath = `${PROJECT_ROOT}/${answer}`;
    if (
      fs.existsSync(targetPath)
      && fs.lstatSync(targetPath).isDirectory()
      //
    ) {
      // TODO MAYBE Change PROJECT_NAME as well?

      if (changeProjectRoot(targetPath)) {
        isAnswerCorrect = true;
      }

      break;
    }
  }
}

/**
 * @param {string} newRootPath
 * @returns {boolean}
 */
function changeProjectRoot(newRootPath) {
  // NOTE Raison d'etre: see `askProjectRoot`

  // Check if `newRootPath` is under the old (designated) one
  if (path.dirname(newRootPath) !== PROJECT_ROOT) {
    if (!argv.silent) {
      console.warn('Designated new project root is not under the old one. Ignoring.');
    }
    return false;
  }

  const oldRootPath = PROJECT_ROOT;
  PROJECT_ROOT = newRootPath;

  if (!argv.silent) {
    console.log(`Project root changed from "${oldRootPath}" to "${newRootPath}".`);
  }
}

// Construct runner and run the script
//
const { VM } = require('vm2');

const vm = new VM({
  eval: false,
  wasm: false,
  fixAsync: true, // Because of this script cannot use async function
  sandbox: {
    ...functions,

    // Core functions
    //
    setDefaultPackageManager,
    askProjectRoot,
    changeProjectRoot,
  },
});

const script = fs.readFileSync(SCRIPT_FILE_PATH, { encoding: 'utf-8' });

try {
  const runStartTime = Date.now();
  vm.run(script);
  const endTime = Date.now();

  if (!argv.silent) {
    console.log(`Script ran successfully in ${endTime - runStartTime} ms and project created at "${PROJECT_ROOT}" in ${endTime - appStartTime} ms.`);
  }
} catch (err) {
  if (!argv.silent) {
    console.error(`Script error: ${err.message}`);
  }
  process.exit(8);
}
