import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'ROBOT-SOCCER | Autonomous match lab',description:'A deterministic 3×3 robot soccer laboratory with a live 3D arena, autonomous teams and ESP32 reference hardware.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
