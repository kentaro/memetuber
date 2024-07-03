import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'y2k-blue': '#00FFFF',
        'y2k-pink': '#FF69B4',
        'y2k-yellow': '#FFFF00',
        'y2k-purple': '#8A2BE2',
        'y2k-orange': '#FFA500', // Added orange color
      },
      fontFamily: {
        'y2k': ['Comic Sans MS', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'y2k-gradient': 'linear-gradient(45deg, #00FFFF, #FF69B4, #FFFF00)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
export default config;
