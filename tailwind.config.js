/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontSize: {
				'text-3xl': '2rem'
			},
			screens: {
				'bp-420px': '420px',
				'bp-900px': '900px'
				
			},
			colors: {
				primary: '#143164',
				"primary-hover": '#435A83',
				secondary: '#206FC9',
				yellow: '#FFBB12',
				orange: {
					10: '#FFF0E9',
					40: '#FFC3A5',
					60: '#FFA679',
					100: '#FF6A1F'
				},
				ivory: '#FFF4DE',
				darkGray: '#424242',
				lightGray: '#ccc',
				gray: {
					90: '#656F78',
					70: '#8C9AA5',
					50: '#BFC7CD',
					30: '#D9DFE4',
					10: '#ECF0F4',
					5: '#f3f3f3'
				},
				blue: {
					10: '#E9F1FA',
					40: '#A6C5E9',
					60: '#79A9DF'
				},
				primaryBlue: {
					40: '#A1ADC1',
					80: '#435B83'
				},
				offwhite: '#fcfcfc',
				white: '#FFFFFF',
				sibebarGray: '#f9f9f9',
				fontFamily: {
					'noto-sans': ['"Noto Sans"', 'sans-serif']
				}
			}
		},
		plugins: []
	}
};
