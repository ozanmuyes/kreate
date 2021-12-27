# Functions

While the name is unfortunate the intention is clear; provide some functions for script to call. Every JavaScript file (only JavaScript files, no TypeScript) in this directory is going to be automatically provided to the script via VM's sandbox. To exclude a JavaScript file simple prepend filename with an underscore (e.g. "unusedFn.js" -> "_unusedFn.js").

Every "function" file here MUST export a function which accept function arguments (i.e. `FunctionFnArgs`) and returns an object with the following keys;
* `fn` - mandatory, function, "the function"
* `name` - optional, the name of the function for the script to call, default is the file name

"The function" is a function which this file's raison d'être.

```js
// kreate/functions/stub.js

// `require`s (if necessary)

module.exports = (/** @type {import('./index').FunctionFnArgs} */ args) => ({
  // Default value for the field `name` is the filename ('stub' in this case);
  // name: 'stub',

  // The field named `fn` MUST be defined with the value of the function. It may accept parameters.
  // If it does the function signature for the script is going to be `stub(arg1[, arg2, ...])`
  fn: (arg1) => {
    throw new Error('Not implemented.');
  },
```
