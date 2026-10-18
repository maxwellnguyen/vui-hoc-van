/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ocean-deep': '#0B3D5C', ocean: '#1572A1', lagoon: '#20A4B8', aqua: '#7FD6E0',
        foam: '#E8F7FA', sand: '#F6E7C1', coral: '#FF7F6B', seaweed: '#3BB273', star: '#FFD23F',
      },
      fontFamily: { display: ['"Baloo 2"', 'cursive'], body: ['Nunito', 'sans-serif'] },
    },
  },
  plugins: [],
}
