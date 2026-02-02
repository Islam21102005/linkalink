"use client";

import Link from "next/link";
import { useState } from "react";
import localFont from "next/font/local";
import { 
  ArrowRight, Plus, Minus, Menu, X, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import React from "react";

// --- ШРИФТЫ ---
const akony = localFont({
  src: "./fonts/AKONY.otf",
  display: "swap",
});

// --- АНИМАЦИИ ---
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const floatAnimation: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 2, -2, 0],
    transition: { 
      duration: 6, 
      repeat: Infinity, 
      ease: "easeInOut"
    }
  }
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DAF1DE] text-[#051F20] selection:bg-[#235347] selection:text-white font-sans overflow-x-hidden">
      
      {/* --- НАВИГАЦИЯ --- */}
      <div className="fixed top-4 md:top-6 left-0 w-full z-50 flex justify-center px-4">
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="w-full max-w-4xl md:max-w-6xl bg-[#051F20]/60 backdrop-blur-xl border border-[#163832]/30 rounded-full px-4 py-3 flex items-center justify-between shadow-2xl shadow-[#051F20]/10"
        >
          {/* Логотип */}
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-[#DAF1DE]/20" />
          </div>
          
          {/* Десктоп меню */}
          <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#DAF1DE]/80">
            <button onClick={() => scrollTo('pain')} className="hover:text-white transition-colors">Проблемы</button>
            <button onClick={() => scrollTo('solution')} className="hover:text-white transition-colors">Решение</button>
            <button onClick={() => scrollTo('cases')} className="hover:text-white transition-colors">Кейсы</button>
          </div>

          <button 
            onClick={() => scrollTo('contact')}
            className="hidden md:block px-6 py-2 bg-[#DAF1DE] text-[#051F20] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Связаться
          </button>

          {/* Мобильная кнопка */}
          <button className="md:hidden text-[#DAF1DE] p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.nav>

        {/* Мобильное меню */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-20 w-[90%] bg-[#051F20] border border-[#163832] rounded-3xl p-4 flex flex-col gap-2 shadow-2xl"
            >
              <MobileMenuItem onClick={() => scrollTo('pain')} text="Проблемы" />
              <MobileMenuItem onClick={() => scrollTo('solution')} text="Решение" />
              <MobileMenuItem onClick={() => scrollTo('cases')} text="Кейсы" />
              <button 
                 onClick={() => scrollTo('contact')}
                 className="mt-2 w-full py-4 bg-[#DAF1DE] text-[#051F20] font-bold rounded-2xl uppercase tracking-widest text-xs"
              >
                Связаться
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- HERO BLOCK --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden px-4">
        
        {/* Фон */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#DAF1DE]/80 via-[#DAF1DE]/60 to-[#DAF1DE] z-10" />
        </div>

        {/* 3D Визуал (ОСТАВИЛИ ТОЛЬКО ЗДЕСЬ) */}
        <motion.div 
          variants={floatAnimation}
          animate="animate"
          className="relative z-10 w-[280px] h-[280px] md:w-[500px] md:h-[500px] mb-8 md:mb-0"
        >
           <img src="/hero-3d.png" alt="3D Hero" className="w-full h-full object-contain drop-shadow-2xl" />
        </motion.div>

        <div className="relative z-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${akony.className} text-[#235347] text-sm md:text-xl tracking-[0.5em] mb-4 block uppercase font-bold`}
          >
            LINKALINK
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`${akony.className} text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-[#051F20] leading-[0.9] uppercase`}
          >
            ОДНА ССЫЛКА,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#051F20] to-[#235347]/50">КОТОРАЯ МОЖЕТ ВСЁ</span>
          </motion.h1>
        </div>

        {/* Индикатор скролла */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 flex flex-col items-center gap-2 z-20"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#051F20]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#051F20] to-transparent" />
        </motion.div>
      </section>

      {/* --- БОЛИ (Pain) --- */}
      <section id="pain" className="py-24 md:py-40 relative px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          
          <motion.div 
            variants={fadeInUp} 
            initial="initial" 
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center"
          >
             <h2 className="text-[#235347] text-xs font-bold uppercase tracking-[0.3em] mb-4 md:mb-6">Problems / 01</h2>
             <h3 className="text-3xl md:text-6xl font-bold text-[#051F20] mb-16 leading-tight tracking-tighter uppercase">Знакомый хаос?</h3>
             
             {/* Сетка из 3 колонок, так как картинку убрали */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <PainItem num="01" title="Потерянные записи" desc="Когда WhatsApp превращается в свалку сообщений, а клиенты забывают прийти." />
                <PainItem num="02" title="Ночные звонки" desc="Клиенты пишут и звонят, когда вы отдыхаете. Вы теряете заявки пока спите." />
                <PainItem num="03" title="Сложный старт" desc="Страх перед дорогими сайтами, техзаданиями и сложными CRM системами." />
             </div>
          </motion.div>

        </div>
      </section>

      {/* --- РЕШЕНИЕ (Solution) --- */}
      <section id="solution" className="py-24 md:py-40 bg-[#051F20] rounded-[3rem] md:rounded-[5rem] mx-2 md:mx-4 relative overflow-hidden text-[#DAF1DE]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          <motion.div 
            variants={fadeInUp} 
            initial="initial" 
            whileInView="whileInView" 
            viewport={{ once: true, amount: 0.2 }}
          >
             <h2 className="text-[#8EB69B] text-xs font-bold uppercase tracking-[0.3em] mb-4 md:mb-6">Solution / 02</h2>
             <h3 className="text-3xl md:text-6xl font-bold text-[#DAF1DE] mb-6 md:mb-8 leading-tight tracking-tighter uppercase">Бизнес в потоке</h3>
             <p className="text-[#8EB69B] text-lg md:text-xl leading-relaxed mb-12 font-light max-w-2xl mx-auto">
                Мы создаем экосистему, где технология становится невидимым помощником. Ссылка, которая заменяет администратора и отдел продаж.
             </p>
             
             {/* Список центрирован */}
             <div className="flex flex-col items-center gap-4 mb-12">
                <SolutionPoint text="Онлайн-запись 24/7 без участия человека" />
                <SolutionPoint text="Автоматические напоминания клиентам" />
                <SolutionPoint text="База клиентов собирается сама" />
             </div>

             <button onClick={() => scrollTo('contact')} className="group bg-[#DAF1DE] hover:bg-white text-[#051F20] py-4 px-10 rounded-2xl inline-flex items-center justify-center gap-4 font-bold text-lg uppercase tracking-widest transition-all">
                Начать сейчас <ArrowRight size={20} />
             </button>
          </motion.div>
        </div>
      </section>

      {/* --- КЕЙСЫ (Cases) --- */}
      <section id="cases" className="py-24 md:py-40 border-t border-[#051F20]/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-6xl font-bold text-[#051F20] mb-12 md:mb-20 uppercase tracking-tighter text-center md:text-left">Наши кейсы</h2>
          
          <Link href="/elegant-barbershop">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="relative w-full h-[400px] md:h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-[#051F20] group cursor-pointer shadow-xl"
            >
              {/* Фото кейса */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-[#051F20]/40 group-hover:bg-[#051F20]/10 transition-all" />
              
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 pr-6">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#DAF1DE] mb-2 block bg-[#051F20] w-fit px-3 py-1 rounded-full">Premium Barbershop</span>
                <h4 className={`${akony.className} text-3xl md:text-5xl text-white`}>Elegant Cut</h4>
                <p className="text-white/80 text-sm mt-2 md:max-w-md hidden md:block">Полная упаковка бизнеса: от логотипа до системы автоматической записи.</p>
              </div>

              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-10 h-10 md:w-16 md:h-16 bg-[#051F20] rounded-full flex items-center justify-center text-[#DAF1DE] group-hover:scale-110 transition-transform">
                 <ArrowRight className="w-5 h-5 md:w-8 md:h-8" />
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* --- ЭТАПЫ (Timeline) --- */}
      <section id="timeline" className="py-24 md:py-40 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h3 
             variants={fadeInUp} 
             initial="initial" 
             whileInView="whileInView"
             viewport={{ once: true }} 
             className="text-3xl md:text-5xl font-bold text-center mb-16 md:mb-32 uppercase tracking-tighter text-[#051F20]"
          >
            Как это происходит
          </motion.h3>
          
          <div className="space-y-16 md:space-y-32">
            <Step num="01" title="Анализ" desc="Разбираем ваш продукт. Находим слабые места и точки роста." />
            <Step num="02" title="Сборка" desc="Создаем стильный интерфейс, который продает за вас." />
            <Step num="03" title="Запуск" desc="Интегрируем Telegram-бота и передаем вам управление." />
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-4 md:px-6">
         <h2 className="text-3xl font-bold text-[#051F20] mb-12 text-center uppercase tracking-tighter">Вопросы</h2>
         <div className="space-y-4">
            <FaqItem q="Нужно ли платить за создание?" a="Нет, базовая настройка бесплатна. Вы платите только абонентскую плату за тариф." />
            <FaqItem q="Смогу ли я сам менять цены?" a="Да, у вас будет удобная панель администратора в Telegram или на сайте." />
            <FaqItem q="Как быстро все запустится?" a="Обычно настройка занимает от 15 минут до 24 часов в зависимости от сложности." />
         </div>
      </section>

      {/* --- ФОРМА ЗАЯВКИ --- */}
      <section id="contact" className="py-24 md:py-40 px-4 md:px-6 relative">
         <motion.div 
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-[#051F20] rounded-[3rem] md:rounded-[4rem] p-8 md:p-24 border border-[#163832] text-center relative overflow-hidden"
         >
            <h2 className="text-3xl md:text-6xl font-bold text-[#DAF1DE] mb-6 tracking-tighter uppercase">Готовы к новому уровню?</h2>
            <p className="text-[#8EB69B] mb-12 uppercase tracking-widest text-[10px] md:text-xs">Оставьте заявку, и мы свяжемся с вами</p>
            
            <form className="max-w-md mx-auto space-y-6 text-sm">
               <input type="text" placeholder="ИМЯ" className="w-full bg-transparent border-b border-[#163832] py-4 text-center text-[#DAF1DE] placeholder:text-[#235347] focus:border-[#DAF1DE] outline-none transition-colors" />
               <input type="tel" placeholder="TELEGRAM / ТЕЛЕФОН" className="w-full bg-transparent border-b border-[#163832] py-4 text-center text-[#DAF1DE] placeholder:text-[#235347] focus:border-[#DAF1DE] outline-none transition-colors" />
               <button className="mt-10 w-full py-5 md:py-6 bg-[#DAF1DE] text-[#051F20] font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 transition-transform text-xs md:text-sm">Отправить</button>
            </form>
         </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 md:py-20 border-t border-[#051F20]/10 text-center bg-[#051F20] text-[#DAF1DE]">
        <div className={`${akony.className} text-3xl md:text-4xl mb-8`}>LINKALINK</div>
        <div className="flex justify-center gap-6 md:gap-10 text-[10px] uppercase tracking-[0.2em] text-[#8EB69B] font-bold">
           <a href="#" className="hover:text-white">Privacy</a>
           <a href="#" className="hover:text-white">Terms</a>
           <a href="#" className="hover:text-white">Instagram</a>
        </div>
      </footer>
    </div>
  );
}

// --- КОМПОНЕНТЫ ---

function MobileMenuItem({ onClick, text }: { onClick: () => void, text: string }) {
  return (
    <button 
      onClick={onClick} 
      className="w-full py-3 px-4 text-left text-[#8EB69B] hover:bg-[#163832] hover:text-[#DAF1DE] rounded-xl transition-colors font-medium uppercase tracking-wider text-xs"
    >
      {text}
    </button>
  )
}

function PainItem({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 md:gap-6 group p-6 rounded-3xl bg-[#051F20] text-[#DAF1DE] hover:scale-105 transition-transform duration-300 shadow-xl h-full">
      <span className="text-[#8EB69B] font-bold text-lg md:text-xl pt-1 shrink-0">{num}</span>
      <div>
        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-tight">{title}</h4>
        <p className="text-[#8EB69B] text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SolutionPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0B2B26] px-6 py-3 rounded-full border border-[#163832]">
       <div className="w-5 h-5 rounded-full bg-[#235347] flex items-center justify-center shrink-0">
          <CheckCircle2 size={12} className="text-[#DAF1DE]" />
       </div>
       <span className="text-[#DAF1DE] text-sm md:text-base font-medium">{text}</span>
    </div>
  )
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeInUp} 
      initial="initial" 
      whileInView="whileInView" 
      viewport={{ once: true }}
      className="flex flex-col items-center text-center max-w-sm mx-auto group"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#051F20] flex items-center justify-center mb-6 md:mb-8 group-hover:bg-[#051F20] group-hover:text-[#DAF1DE] transition-colors">
        <span className="text-[#051F20] font-bold text-xl md:text-2xl group-hover:text-[#DAF1DE]">{num}</span>
      </div>
      <h4 className="text-xl md:text-2xl font-bold text-[#051F20] mb-2 md:mb-4 uppercase tracking-tighter">{title}</h4>
      <p className="text-[#163832] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
     <div className="bg-[#051F20] rounded-2xl border border-[#163832] overflow-hidden shadow-lg">
        <button 
           onClick={() => setIsOpen(!isOpen)} 
           className="w-full p-6 flex items-center justify-between text-left hover:bg-[#0B2B26] transition-colors"
        >
           <span className="font-bold text-[#DAF1DE] text-sm md:text-base pr-4">{q}</span>
           {isOpen ? <Minus size={20} className="text-[#8EB69B] shrink-0"/> : <Plus size={20} className="text-[#235347] shrink-0"/>}
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