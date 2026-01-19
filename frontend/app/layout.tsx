import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TravelBot Pro - Seu Assistente de Viagens Inteligente',
  description:
    'Planeje viagens incríveis com ajuda de IA via WhatsApp. Roteiros personalizados, gestão de gastos e muito mais.',
  keywords: ['viagem', 'whatsapp', 'ia', 'roteiro', 'planejamento'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

