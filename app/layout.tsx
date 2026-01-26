import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Подключаем твой шрифт Foglihten
const customFont = localFont({
  src: "../public/fonts/FoglihtenNo06_076.otf", // Путь к файлу внутри папки app/fonts
  variable: "--font-custom",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Linkalink",
  description: "Сервис онлайн-записи",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      {/* 
         className={customFont.className} -> Применяет твой шрифт ко всему сайту
         tracking-widest -> Сильно увеличивает расстояние между буквами
      */}
      <body className={`${customFont.className} tracking-widest antialiased`}>
        {children}
      </body>
    </html>
  );
}