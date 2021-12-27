# Managers

They are nothing but an interface for a specific package manager, e.g. `npm`, `yarn` or even `cargo`.

```js
// kreate/managers/cargo.js

const APP_NAME = 'cargo';

module.exports = {
  // name: APP_NAME, // Default to manager file name (in this case `"cargo"`)
  fn: (PROJECT_ROOT) => {
    // NOTE Write your implementation here
    //      For better compliance implement as much as methods
    //      required methods can be found `Manager` typedef
    //      defined at "kreate/managers/index.js".
  },
};
```
