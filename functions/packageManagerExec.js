// Like `npx` and `yarn create`

module.exports = (/** @type {import('./index').FunctionFnArgs} */ args) => ({
  fn: (cmd) => {
    if (!args.flags.silent) {
      console.log(`Running package manager command: "${cmd}".`);
    }

    if (!args.flags.dryRun) {
      args.manager.exec(cmd);
    }
  },
});
