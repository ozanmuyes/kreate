setDefaultPackageManager("yarn");

initProject((name) => ({
  name,
  version: '0.1.0',
  scripts: (add) => {
    add('test', 'jest');
    add('test:watch', 'jest --watch');
    add('coverage', 'jest --silent --coverage');
    add('lint', "eslint '*/**/*.{js,ts,md}'");
    add('lint:fix', "eslint '*/**/*.{js,ts}' --quiet --fix");
    add('doc:prettify', 'prettier *.md --write');
    add('build', 'tsc --noEmit && rimraf dist && etsc');
    add('prepare', 'husky install');
    add('start', 'yarn build && node -r source-map-support/register dist/index.js');
  },
  author: 'Ozan Müyesseroğlu <ozanmuyes@gmail.com>',
  license: 'MIT',
}));

dependencies(({ add, addDev }) => {
  add('@trivago/prettier-plugin-sort-imports', '^3.1.1');
  add('@tsconfig/node14', '^1.0.1');
  add('@types/jest', '^27.0.2');
  add('@types/jest-when', '^2.7.3');
  add('@types/node', '^16.10.3');
  add('@typescript-eslint/eslint-plugin', '^4.33.0');
  add('@typescript-eslint/parser', '^4.33.0');
  add('esbuild', '^0.13.4');
  add('esbuild-jest', '^0.5.0');
  add('eslint', '^7.32.0');
  add('eslint-config-prettier', '^8.3.0');
  add('eslint-plugin-functional', '^3.7.2');
  add('eslint-plugin-jest', '^25.0.1');
  add('eslint-plugin-prettier', '^4.0.0');
  add('jest', '^27.2.5');
  add('jest-when', '^3.4.2');
  add('prettier', '^2.4.1');
  add('ts-results', '^3.3.0');
  add('typescript', '^4.4.3');

  addDev('ts-results', '^3.3.0');
  addDev('typescript', '^4.4.3');
});

copyContentsToProjectRoot();

gitInit();
