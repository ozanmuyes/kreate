const child_process = require('child_process');

const APP_NAME = 'yarn';

module.exports = {
  name: APP_NAME,
  fn: (PROJECT_ROOT) => ({
    // NOTE Write your implementation here

    installDependencies(depsStr, isDev = false) {
      // FIXME TR dependency yüklü olsa bile tekrar yüklüyor - BUNU YAPMASIN

      const cmdParts = ['add', depsStr];
      if (isDev) {
        cmdParts.push('-D');
      }

      execYarnCmd(cmdParts, PROJECT_ROOT);
    },

    removeDependencies(depsStr, isDev = false) {
      const cmdParts = ['remove', depsStr];
      if (isDev) {
        cmdParts.push('-D');
      }

      execYarnCmd(cmdParts, PROJECT_ROOT);
    },

    // Analogous to `yarn create cmd`
    exec(cmd) {
      execYarnCmd(['create', cmd], PROJECT_ROOT);
    },

    // MAYBE findNotYetInstalledDependencies(["name1", "name2", ...], isDev)
    // MAYBE removeDependencies(["name1", "name2", ...], isDev)
  }),
}

/**
 * @param {Array<string>} cmdParts
 */
function execYarnCmd(cmdParts, cwd) {
  const cmd = `${APP_NAME} ${cmdParts.join(' ')}`;
  child_process.execSync(cmd, {
    cwd,
    stdio: 'inherit',
    // MAYBE env: {}
  });
}
