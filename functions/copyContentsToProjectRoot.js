const fse = require('fs-extra');

module.exports = (/** @type {import('./index').FunctionFnArgs} */ args) => ({
  fn: (overwrite) => {
    if (!args.script.contentsLocalPath) {
      if (!args.flags.silent) {
        console.warn('No contents to copy.');
      }

      return;
    }

    const fromPath = args.script.contentsLocalPath;
    const toPath = args.project.root;

    if (!args.flags.silent) {
      console.log(`Copying files from "${fromPath}" to "${toPath}".`);
    }

    if (!args.flags.dryRun) {
      fse.copySync(fromPath, toPath, { overwrite, recursive: true });
    }
  },
});
