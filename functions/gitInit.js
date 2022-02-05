const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = (/** @type {import('./index').FunctionFnArgs} */ args) => ({
  fn: (gitignoreList = []) => {
    if (!Array.isArray(gitignoreList)) {
      if (!args.flags.silent) {
        console.warn('Unrecognized gitignore contents. Ignoring.');
      }
      return;
    }

    const dotgit = path.join(args.project.root, '.git');
    if (fs.existsSync(dotgit)) {
      if (!args.flags.force) {
        if (!args.flags.silent) {
          console.warn('Git was already initialized. Ignoring.');
        }
        return;
      }

      if (!args.flags.dryRun) {
        fs.unlinkSync(dotgit);
      }
    }

    const dotgitignore = path.join(args.project.root, '.gitignore');
    let dotgitignoreContents;
    if (fs.existsSync(dotgitignore) && !args.flags.dryRun) {
      if (args.flags.force) {
        // overwrite to existing file (it's like delete the existing one and creating a new one with the given list only)
        dotgitignoreContents = `${gitignoreList.join('\n')}\n`;
      } else {
        // append to the end of the existing file
        dotgitignoreContents = `${fs.readFileSync(dotgitignore)}\n${gitignoreList.join('\n')}\n`
      }
    } else {
      dotgitignoreContents = gitignoreList.join('\n');
    }

    if (args.flags.dryRun) {
      if (!args.flags.silent) {
        // Summary
        //
        const lines = ['\n> gitInit'];

        if (Array.isArray(gitignoreList) && gitignoreList.length > 0) {
          lines.push(" * Add the following to .gitignore;");
          lines.push(...dotgitignoreContents.split('\n').map((l) => `   + ${l}`));
        }

        lines.push(' * Run "git init"');

        console.log(lines.join('\n'));
      }
    } else {
      fs.writeFileSync(dotgitignore, dotgitignoreContents, { encoding: 'utf-8' });

      child_process.execSync('git init -b main', {
        cwd: args.project.root,
        stdio: 'inherit',
      });
    }
  },
});
