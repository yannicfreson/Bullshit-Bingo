module.exports = {
  content: ["index.html", "code.js"],
  theme: {
    extend: {
      fontFamily: {
        chewy: ["Chewy", "cursive"],
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      return addVariant("children", "& > *");
    },
  ],
};
