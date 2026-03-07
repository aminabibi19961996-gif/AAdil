import config from '@anythingai/app/tailwind.config'

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
		'./node_modules/@anythingai/app/**/*.{js,ts,jsx,tsx}'
	],
	...config
}
