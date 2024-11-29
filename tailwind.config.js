/** @type {import('tailwindcss').Config} */
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
];
export const theme = {
  extend: {
    colors: {
      border: "#e5e7eb", // Light gray for borders
      background: "#ffffff", // Ensure background is white
      foreground: "#000000", // Ensure text is black
      customBlue: '#3997D3',

    },
  },
};
export const plugins = [];
