module.exports = {
  presets: [
    // ...existing presets...
  ],
  plugins: [
    // ...existing plugins...
    ['@babel/plugin-transform-private-methods'], // Replaces @babel/plugin-proposal-private-methods
    ['@babel/plugin-transform-numeric-separator'], // Replaces @babel/plugin-proposal-numeric-separator
    ['@babel/plugin-transform-nullish-coalescing-operator'], // Replaces @babel/plugin-proposal-nullish-coalescing-operator
    ['@babel/plugin-transform-class-properties'], // Replaces @babel/plugin-proposal-class-properties
    ['@babel/plugin-transform-private-property-in-object'], // Replaces @babel/plugin-proposal-private-property-in-object
    ['@babel/plugin-transform-optional-chaining'], // Replaces @babel/plugin-proposal-optional-chaining
  ],
};
