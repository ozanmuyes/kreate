// Like `npm init` and `yarn init`

const fs = require('fs');
const path = require('path');

const NAME = 'initProject';

function calculateScripts(/** @type {import('./index').FunctionFnArgs} */ args, changes, old = {}) {
  const calculatedScripts = { ...old };

  changes.forEach(([command, ...payload]) => {
    switch (command) {
      case 'add': {
        const [name, scriptStr, overwrite] = payload;

        if (!overwrite && Object.prototype.hasOwnProperty.call(calculatedScripts, name)) {
          if (!args.flags.dryRun && !args.flags.silent) {
            console.log(`Omitting script change on "${name}" due to no-overwrite.`);
          }
          break;
        }

        calculatedScripts[name] = scriptStr;

        break;
      }

      case 'remove': {
        const name = payload[0];

        if (Object.prototype.hasOwnProperty.call(calculatedScripts, name)) {
          calculatedScripts[name] = undefined;
          // keys with `undefined` values will be omitted on JSON stringify
        }

        break;
      }

      default:
        // TODO Consider `silent`
        console.warn(`Unrecognized script change command: "${command}". Ignoring...`);
    }
  });

  return calculatedScripts;
}

module.exports = (/** @type {import('./index').FunctionFnArgs} */ args) => ({
  name: NAME,
  fn: (cb) => {
    if (typeof cb !== 'function') {
      if (!args.flags.silent) {
        console.error(`${NAME} MUST be called with a callback function.`);
      }
      process.exit(20);
    }

    const packageJSONPath = path.join(args.project.root, 'package.json');

    if (!args.flags.dryRun && fs.existsSync(packageJSONPath)) {
      if (args.flags.force) {
        if (!args.flags.silent) {
          console.log('Forced to update existing package.json');
        }
      } else {
        if (!args.flags.silent) {
          console.error('There is already a package.json exist at project root. Exiting.');
        }
        process.exit(10);
      }
    }

    const {
      dependencies, // omit
      devDependencies, // omit
      scripts, // special treat
      ...additionsForPackageJSON
    } = { ...cb(args.project.name) };

    const oldPackageJSON = fs.existsSync(packageJSONPath)
      ? JSON.parse(fs.readFileSync(packageJSONPath))
      : {};

    const changesOnScripts = [];
    if (typeof scripts === 'function') {
      function add(name, scriptStr, overwrite = args.flags.force) {
        changesOnScripts.push(['add', name, scriptStr, overwrite]);
      }
      function remove(name) {
        changesOnScripts.push(['remove', name]);
      }
      scripts(add, remove);

      const calculatedScriptsObj = calculateScripts(
        args,
        changesOnScripts,
        oldPackageJSON.scripts || {},
      );

      additionsForPackageJSON.scripts = calculatedScriptsObj;
    }

    if (args.flags.dryRun) {
      if (!args.flags.silent) {
        // Summary
        //
        const lines = [];
        let tmp = Object.keys(additionsForPackageJSON); // JSON.stringify(additionsForPackageJSON);

        if (tmp.length > 0) {
          lines.push(' * add / change following fields;');
          // TODO loop tmp (or additionsForPackageJSON)
          tmp
            .filter((key) => (
              key !== 'scripts' && key !== 'dependencies' && key !== 'devDependencies'
            ))
            .forEach((key) => {
              lines.push(`   + ${key} (${additionsForPackageJSON[key]})`);
            });
        }

        tmp = changesOnScripts.filter(([command]) => command === 'add').map(([_, name]) => name);
        if (tmp.length > 0) {
          lines.push(` * add following scripts: '${tmp.join(', ')}'`);
        }

        tmp = changesOnScripts.filter(([command]) => command === 'remove').map(([_, name]) => name);
        if (tmp.length > 0) {
          lines.push(` * remove following scripts: '${tmp.join(', ')}'`);
        }

        if (lines.length > 0) {
          console.log(`Going to do those changes over package.json;\n${lines.join('\n')}`);
        }
      }
    } else {
      fs.writeFileSync(
        packageJSONPath,
        JSON.stringify({ ...oldPackageJSON, ...additionsForPackageJSON }, null, 2),
        { encoding: 'utf-8' },
      );
    }
  },
});
