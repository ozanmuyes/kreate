// Use yarn
setDefaultPackageManager("yarn");

// Create a Next.js app
packageManagerExec("next-app -t"); // yarn create next-app -t
askProjectRoot();

// Change necessary fields on package.json
initProject((name) => ({
  name,
  version: '0.1.0',
}));

// Install dependencies
dependencies(({ add }) => {
  add('eslint-config-airbnb');
  add('eslint-config-prettier');
  add('eslint-plugin-react');
  add('prettier');
});

copyContentsToProjectRoot();

// Fin
