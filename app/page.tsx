"use client";

import Link from "next/link";
import { useState } from "react";
import localFont from "next/font/local";
import { 
  ArrowRight, 
  Plus, 
  Minus, 
  Smartphone, 
  Globe, 
  Zap,
  ShieldCheck,
  Layout,
  Menu,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

// --- ШРИФТЫ ---
const akony = localFont({
  src: "./fonts/AKONY.otf",
  display: "swap",
});

// --- ТИПЫ ДАННЫХ ---
interface FeatureBoxProps {
  icon: React.ReactElement<any>; 
  title: string;
  desc: string;
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Скролл к секциям
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE] selection:bg-[#235347] selection:text-white font-sans overflow-x-hidden">
      
      {/* --- НАВИГАЦИЯ (Парящая плашка) --- */}
      <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl bg-[#051F20]/80 backdrop-blur-xl border border-[#163832] rounded-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-2xl shadow-black/50 relative">
          
          {/* Логотип */}
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-[#235347]" />
            
          </div>
          
          {/* Десктоп меню */}
          <div className="hidden md:flex items-center gap-8 text-xs lg:text-sm font-medium text-[#8EB69B]">
            <button onClick={() => scrollTo('pain')} className="hover:text-[#DAF1DE] transition-colors">Проблемы</button>
            <button onClick={() => scrollTo('solution')} className="hover:text-[#DAF1DE] transition-colors">Решение</button>
            <button onClick={() => scrollTo('cases')} className="hover:text-[#DAF1DE] transition-colors">Кейсы</button>
            <button onClick={() => scrollTo('timeline')} className="hover:text-[#DAF1DE] transition-colors">Этапы</button>
          </div>

          {/* Кнопка Связаться (Десктоп) */}
          <div className="hidden md:block">
            <button 
              onClick={() => scrollTo('contact')}
              className="px-6 py-2 bg-[#235347] hover:bg-[#163832] text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-[#0B2B26] border border-[#235347]"
            >
              Связаться
            </button>
          </div>

          {/* Мобильная кнопка меню */}
          <button className="md:hidden text-[#DAF1DE] p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Мобильное выпадающее меню */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-full left-0 mt-4 w-full bg-[#0B2B26] border border-[#163832] rounded-3xl overflow-hidden shadow-2xl p-2 flex flex-col gap-1"
              >
                <MobileMenuItem onClick={() => scrollTo('pain')} text="Проблемы" />
                <MobileMenuItem onClick={() => scrollTo('solution')} text="Решение" />
                <MobileMenuItem onClick={() => scrollTo('cases')} text="Кейсы" />
                <MobileMenuItem onClick={() => scrollTo('timeline')} text="Этапы работы" />
                <MobileMenuItem onClick={() => scrollTo('faq')} text="FAQ" />
                <button 
                   onClick={() => scrollTo('contact')}
                   className="mt-2 w-full py-3 bg-[#DAF1DE] text-[#051F20] font-bold rounded-2xl"
                >
                  Связаться с нами
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>

      {/* --- HERO BLOCK --- */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        
        {/* Фон */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#051F20]/80 via-[#051F20]/60 to-[#051F20] z-10" />
            <img src="/hero-bg.jpg" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Левая часть: Текст */}
          <div className="lg:col-span-8 text-center lg:text-left">
            <span className={`text-lg font-bold tracking-tight hidden sm:block ${akony.className}`}>LINKALINK</span>
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`${akony.className} text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#DAF1DE] mb-6 leading-[1.1]`}
            > Одна ссылка,<br />
              <span className="text-[#8EB69B]">которая может всё</span>
            </motion.h1>
          </div>

          {/* Правая часть: Блок с примерами (Десктоп: Справа, Мобил: Снизу) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <motion.div 
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.6 }}
               className="relative group cursor-pointer"
               onClick={() => scrollTo('cases')}
            >
              {/* Карточка-тизер */}
              <div className="w-64 sm:w-72 bg-[#0B2B26]/90 backdrop-blur-xl border border-[#163832] p-6 rounded-[2rem] hover:scale-105 transition-transform duration-300">
                 <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#235347] flex items-center justify-center">
                       <Layout size={20} className="text-[#DAF1DE]" />
                    </div>
                    <ArrowRight className="text-[#8EB69B]" />
                 </div>
                 <p className="text-[#8EB69B] text-sm leading-relaxed mb-4">
                    наши решенные задачи
                 </p>
                 <div className="w-full h-32 rounded-2xl bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-80" />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* --- БОЛЬ КЛИЕНТОВ (NEW) --- */}
      <section id="pain" className="py-24 bg-[#051F20] rounded-t-[3rem] -mt-10 relative z-30 border-t border-[#163832]">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-[#8EB69B] text-sm font-bold uppercase tracking-widest mb-2">Актуально для вас?</h2>
               <h3 className="text-3xl md:text-5xl font-bold text-[#DAF1DE]">Знакомые проблемы</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <PainCard 
                  title="Хаос в записях" 
                  desc="Блокнот, WhatsApp, Direct — записи теряются, клиенты забывают прийти, вы теряете деньги."
               />
               <PainCard 
                  title="Сложно записаться" 
                  desc="Клиент хочет записаться ночью, но вы спите. Пока вы ответите утром, он уже уйдет к конкуренту."
               />
               <PainCard 
                  title="Нет времени на сайт" 
                  desc="Разработка сайта — это долго, дорого и сложно. Вам нужно работать, а не писать ТЗ программистам."
               />
            </div>
         </div>
      </section>

      {/* --- РЕШЕНИЕ (УТП) --- */}
      <section id="solution" className="py-24 bg-[#0B2B26] rounded-[3rem] mx-2 md:mx-6 border border-[#163832]">
         <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
               <div className="flex-1">
                  <h2 className="text-[#8EB69B] text-sm font-bold uppercase tracking-widest mb-2">Наше решение</h2>
                  <h3 className="text-3xl md:text-5xl font-bold text-[#DAF1DE] mb-6 leading-tight">
                     Всё управление <br/> в одном окне
                  </h3>
                  <p className="text-[#8EB69B] text-lg leading-relaxed mb-8">
                     Linkalink заменяет администратора, сайт и CRM. Это не просто красивая визитка — это мощный инструмент, который работает 24/7.
                  </p>
                  
                  <ul className="space-y-4">
                     <SolutionItem text="Клиенты записываются сами за 30 секунд" />
                     <SolutionItem text="Напоминания приходят автоматически" />
                     <SolutionItem text="База клиентов формируется сама" />
                     <SolutionItem text="Красивое меню услуг с ценами и фото" />
                  </ul>
               </div>

               <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm">
                     <div className="absolute top-0 -left-4 w-72 h-72 bg-[#235347]/30 rounded-full blur-3xl" />
                     <div className="relative bg-[#051F20] border border-[#163832] rounded-[2.5rem] p-6 shadow-2xl">
                        {/* Имитация интерфейса */}
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-full bg-[#DAF1DE]" />
                           <div>
                              <div className="h-3 w-32 bg-[#235347] rounded-full mb-2" />
                              <div className="h-2 w-20 bg-[#163832] rounded-full" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <div className="h-16 w-full bg-[#0B2B26] rounded-xl border border-[#163832] flex items-center px-4">
                              <div className="h-2 w-full bg-[#163832] rounded-full opacity-50" />
                           </div>
                           <div className="h-16 w-full bg-[#0B2B26] rounded-xl border border-[#163832] flex items-center px-4">
                              <div className="h-2 w-full bg-[#163832] rounded-full opacity-50" />
                           </div>
                           <div className="h-16 w-full bg-[#DAF1DE] rounded-xl flex items-center justify-center font-bold text-[#051F20]">
                              Записаться онлайн
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- КЕЙСЫ --- */}
      <section id="cases" className="py-24 px-6 max-w-6xl mx-auto">
         <div className="text-center mb-12">
            <h2 className="text-[#8EB69B] text-sm font-bold uppercase tracking-widest mb-2">Портфолио</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#DAF1DE]">Примеры внедрения</h3>
         </div>

         <div className="grid grid-cols-1 gap-8">
            <Link href="/elegant-barbershop">
               <div className="group relative w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden border border-[#163832] cursor-pointer">
                  <div className="absolute inset-0 bg-[#163832] group-hover:scale-105 transition-transform duration-700">
                     <div className="w-full h-full opacity-60 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b7f30a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051F20] via-[#051F20]/50 to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                     <div>
                        <div className="inline-block px-4 py-1 bg-[#DAF1DE] rounded-full text-[#051F20] text-xs font-bold mb-4">
                           Barbershop
                        </div>
                        <h4 className="text-3xl md:text-4xl font-bold text-[#DAF1DE] mb-2">Elegant Cut</h4>
                        <p className="text-[#8EB69B] max-w-md">Полная автоматизация: от выбора мастера до подтверждения записи в Telegram.</p>
                     </div>
                     <div className="px-6 py-3 bg-[#235347] rounded-full text-white font-bold text-sm flex items-center gap-2 group-hover:bg-[#DAF1DE] group-hover:text-[#051F20] transition-colors">
                        Смотреть сайт <ArrowRight size={16} />
                     </div>
                  </div>
               </div>
            </Link>
         </div>
      </section>

      {/* --- ЭТАПЫ РАБОТЫ (Timeline) --- */}
      <section id="timeline" className="py-24 bg-[#0B2B26] border-y border-[#163832]">
         <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-[#DAF1DE] mb-16 text-center">Как мы работаем</h2>
            
            <div className="relative">
               {/* Вертикальная линия */}
               <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#163832] -translate-x-1/2" />

               <TimelineItem 
                  step="01"
                  title="Заявка"
                  desc="Вы оставляете заявку на сайте. Мы связываемся, чтобы обсудить детали вашего бизнеса."
                  align="left"
               />
               <TimelineItem 
                  step="02"
                  title="Настройка"
                  desc="Мы загружаем ваши услуги, мастеров, фото и настраиваем график работы."
                  align="right"
               />
               <TimelineItem 
                  step="03"
                  title="Запуск"
                  desc="Вы получаете готовую ссылку. Размещаете её в Instagram и картах. Клиенты начинают записываться."
                  align="left"
               />
               <TimelineItem 
                  step="04"
                  title="Поддержка"
                  desc="Мы остаемся на связи, помогаем с изменениями и следим за стабильной работой."
                  align="right"
               />
            </div>
         </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
         <h2 className="text-3xl font-bold text-[#DAF1DE] mb-12 text-center">Вопросы и ответы</h2>
         <div className="space-y-4">
            <FaqItem q="Нужно ли платить за создание?" a="Нет, базовая настройка бесплатна. Вы платите только абонентскую плату за тариф." />
            <FaqItem q="Смогу ли я сам менять цены?" a="Да, у вас будет удобная панель администратора, где можно менять цены, графики и услуги в 2 клика." />
            <FaqItem q="Есть ли бесплатный период?" a="Да, тариф 'Старт' полностью бесплатный навсегда. Вы можете протестировать сервис без рисков." />
         </div>
      </section>

      {/* --- ФОРМА ЗАЯВКИ --- */}
      <section id="contact" className="py-24 bg-[#051F20] px-6">
         <div className="max-w-2xl mx-auto bg-[#0B2B26] rounded-[3rem] p-8 md:p-12 border border-[#163832] text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#DAF1DE] mb-4">Начните сейчас</h2>
            <p className="text-[#8EB69B] mb-8">Оставьте контакты, и мы пришлем вам пример вашей будущей страницы через 15 минут.</p>
            
            <form className="space-y-4">
               <input 
                  type="text" 
                  placeholder="Ваше имя" 
                  className="w-full h-14 px-6 rounded-2xl bg-[#051F20] border border-[#163832] text-[#DAF1DE] placeholder:text-[#235347] focus:outline-none focus:border-[#DAF1DE] transition-colors"
               />
               <input 
                  type="tel" 
                  placeholder="Номер телефона / Telegram" 
                  className="w-full h-14 px-6 rounded-2xl bg-[#051F20] border border-[#163832] text-[#DAF1DE] placeholder:text-[#235347] focus:outline-none focus:border-[#DAF1DE] transition-colors"
               />
               <button className="w-full h-14 bg-[#DAF1DE] rounded-2xl text-[#051F20] font-bold text-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
                  Отправить заявку <Send size={20} />
               </button>
            </form>
            <p className="text-[#235347] text-xs mt-6">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-[#051F20] border-t border-[#163832] text-center">
        <div className={`text-2xl font-bold text-[#DAF1DE] mb-4 ${akony.className}`}>LINKALINK</div>
        <p className="text-[#8EB69B] text-sm">© 2024 Все права защищены</p>
      </footer>
    </div>
  );
}

// --- КОМПОНЕНТЫ ---

function MobileMenuItem({ onClick, text }: { onClick: () => void, text: string }) {
  return (
    <button 
      onClick={onClick} 
      className="w-full py-3 px-4 text-left text-[#8EB69B] hover:bg-[#163832] hover:text-[#DAF1DE] rounded-xl transition-colors font-medium"
    >
      {text}
    </button>
  )
}

function PainCard({ title, desc }: { title: string, desc: string }) {
   return (
      <div className="bg-[#0B2B26] p-8 rounded-[2rem] border border-[#163832] hover:border-[#F43F5E]/50 transition-colors group">
         <div className="w-12 h-12 bg-[#051F20] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#F43F5E]/20 transition-colors">
            <AlertCircle className="text-[#8EB69B] group-hover:text-[#F43F5E]" />
         </div>
         <h4 className="text-xl font-bold text-[#DAF1DE] mb-3">{title}</h4>
         <p className="text-[#8EB69B] text-sm leading-relaxed">{desc}</p>
      </div>
   )
}

function SolutionItem({ text }: { text: string }) {
   return (
      <li className="flex items-center gap-3">
         <div className="w-6 h-6 rounded-full bg-[#235347] flex items-center justify-center shrink-0">
            <CheckCircle2 size={14} className="text-[#DAF1DE]" />
         </div>
         <span className="text-[#DAF1DE] font-medium">{text}</span>
      </li>
   )
}

function TimelineItem({ step, title, desc, align }: { step: string, title: string, desc: string, align: 'left' | 'right' }) {
   return (
      <div className={`relative flex items-center justify-between mb-12 md:mb-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
         {/* Контент */}
         <div className="w-full md:w-[45%] pl-12 md:pl-0">
            <div className={`flex flex-col gap-2 ${align === 'right' ? 'md:items-start md:text-left' : 'md:items-end md:text-right'}`}>
               <div className="text-4xl font-bold text-[#235347] opacity-50">{step}</div>
               <h4 className="text-2xl font-bold text-[#DAF1DE]">{title}</h4>
               <p className="text-[#8EB69B] text-sm md:text-base">{desc}</p>
            </div>
         </div>
         
         {/* Точка на линии */}
         <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-[#DAF1DE] rounded-full border-4 border-[#0B2B26] -translate-x-1/2 z-10" />
         
         {/* Пустое место для баланса сетки */}
         <div className="hidden md:block w-[45%]" />
      </div>
   )
}

function FaqItem({ q, a }: { q: string, a: string }) {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className="bg-[#0B2B26] rounded-2xl border border-[#163832] overflow-hidden">
         <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full p-6 flex items-center justify-between text-left hover:bg-[#163832] transition-colors"
         >
            <span className="font-bold text-[#DAF1DE]">{q}</span>
            {isOpen ? <Minus size={20} className="text-[#8EB69B]"/> : <Plus size={20} className="text-[#235347]"/>}
         </button>
         <AnimatePresence>
            {isOpen && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
               >
                  <div className="p-6 pt-0 text-[#8EB69B] text-sm leading-relaxed border-t border-[#163832]/50 mt-2">
                     {a}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   )
}