// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   // NOTE: Update this to include the paths to all files that contain Nativewind classes.
//   content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
//   presets: [require("nativewind/preset")],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // ← ADD THIS LINE
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        primaryDark: '#2E7D32',
        background: '#0A0A0A',
        surface: '#1A1A1A',
        surfaceLight: '#2A2A2A',
        border: '#333333',
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          accent: '#4CAF50'
        }
      },
    },
  },
  plugins: [],
}