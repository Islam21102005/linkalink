import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css"; // 👈 Обязательно возвращаем стили, иначе дизайн сломается

// 1. Подключаем твой шрифт
// Убедись, что файл называется именно так и лежит в папке public/fonts
const myFont = localFont({
  src: "../public/fonts/FoglihtenNo06_076.otf", // Проверь название файла!
  display: "swap",
  variable: "--font-custom",
});

// 2. Метаданные (Заголовок вкладки браузера)
export const metadata: Metadata = {
  title: "Linkalink",
  description: "Сервис онлайн-записи",
};

// 3. Сам Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={myFont.className}>
        {children}
      </body>
    </html>
  );
}