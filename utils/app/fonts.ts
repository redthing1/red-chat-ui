import { Inter } from 'next/font/google';
// import { Alegreya_Sans } from 'next/font/google';
import { Martel_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const martelSans = Martel_Sans({ subsets: ['latin'], weight: '400' });

export const APP_UI_FONT = inter;
export const APP_CHAT_FONT = martelSans;