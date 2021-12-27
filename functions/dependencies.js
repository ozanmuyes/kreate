module.exports = (/** @type {import('./index').FunctionFnArgs} */ args) => ({
  fn: (cb) => {
    if (typeof cb !== 'function') {
      if (!args.flags.silent) {
        console.error(`${NAME} MUST be called with a callback function.`);
      }
      process.exit(20);
    }

    const changesOnDependencies = [];
    const changesOnDevDependencies = [];
    cb({
      add(name, version = '', overwrite = false) {
        changesOnDependencies.push(['add', name, version, overwrite]);
      },
      remove(name) {
        changesOnDependencies.push(['remove', name]);
      },
      addDev(name, version = '', overwrite = false) {
        changesOnDevDependencies.push(['add', name, version, overwrite]);
      },
      removeDev(name) {
        changesOnDevDependencies.push(['remove', name]);
      }
    });

    const removes = [];
    const adds = [];
    changesOnDependencies.forEach(([command, name, ...payload]) => {
      if (command === 'add') {
        adds.push([calculateNameMaybeWithVersion(name, payload[0] || ''), payload[1] || false]);
      } else {
        // remove
        removes.push(name);
      }
    });

    const removesDev = [];
    const addsDev = [];
    changesOnDevDependencies.forEach(([command, name, ...payload]) => {
      if (command === 'add') {
        addsDev.push([calculateNameMaybeWithVersion(name, payload[0] || ''), payload[1] || false]);
      } else {
        // remove
        removesDev.push(name);
      }
    });

    if (args.flags.dryRun) {
      if (!args.flags.silent) {
        // Summary
        //
        const lines = [];

        if (removesDev.length > 0) {
          lines.push(' * Remove the following DEVELOPMENT dependencies;');
          removesDev.forEach((depName) => {
            lines.push(`   - ${depName}`);
          });
        }
        if (removes.length > 0) {
          lines.push(' * Remove the following dependencies;');
          removes.forEach((depName) => {
            lines.push(`   - ${depName}`);
          });
        }

        if (adds.length > 0) {
          lines.push(' * Add the following dependencies;');
          adds.forEach(([depName]) => {
            lines.push(`   + ${depName}`);
          });
        }
        if (addsDev.length > 0) {
          lines.push(' * Add the following DEVELOPMENT dependencies;');
          addsDev.forEach(([depName]) => {
            lines.push(`   + ${depName}`);
          });
        }

        if (lines.length > 0) {
          console.log(`Going to do those changes over package.json;\n${lines.join('\n')}`);
        }
      }
    } else {
      if (removesDev.length > 0) {
        args.manager.removeDependencies(removesDev.join(' '), true);
      }
      if (removes.length > 0) {
        args.manager.removeDependencies(removes.join(' '));
      }

      if (adds.length > 0) {
        args.manager.installDependencies(adds.map(([nv]) => nv).join(' '));
      }
      if (addsDev.length > 0) {
        args.manager.installDependencies(addsDev.map(([nv]) => nv).join(' '), true);
      }
    }
  },
});

/**
 * @param {string} name
 * @param {string} version
 * @returns {string}
 */
function calculateNameMaybeWithVersion(name, version = '') {
  return version ? `${name}@${version}` : name;
}
