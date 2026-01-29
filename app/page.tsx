"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  CalendarCheck, 
  MessageCircle, 
  Star, 
  Users, 
  Menu, 
  BellRing, 
  HelpCircle, 
  Sparkles,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  UtensilsCrossed,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

// --- ТИПЫ ДАННЫХ ---

interface FeatureCardProps {
  // Исправлено: ReactElement гарантирует, что это React-компонент, а не просто текст
  icon: React.ReactElement; 
  title: string;
  desc: string;
  color: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
}

interface FaqItemProps {
  question: string;
  answer: string;
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 selection:bg-indigo-500 selection:text-white overflow-hidden font-sans">
      
      {/* ФОНОВЫЕ ЭФФЕКТЫ (GLOW) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* --- НАВИГАЦИЯ --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F19]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:rotate-12 transition-transform">
              L
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Linkalink
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Возможности</a>
            <a href="#pricing" className="hover:text-white transition-colors">Тарифы</a>
            <a href="#faq" className="hover:text-white transition-colors">Вопросы</a>
          </div>

          <div className="flex gap-4">
            <Link href="/elegant-barbershop" className="hidden sm:flex items-center gap-2 text-sm font-medium text-white hover:text-indigo-400 transition">
              <span>Демо</span>
              <ArrowRight size={14} />
            </Link>
            <Link 
              href="#pricing" 
              className="px-5 py-2.5 text-sm font-bold bg-white text-slate-950 rounded-full hover:bg-indigo-50 transition shadow-lg shadow-white/10"
            >
              Создать
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO СЕКЦИЯ --- */}
      <header className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        
        {/* Левая часть: Текст */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center md:text-left z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium mb-8 text-indigo-300 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>Платформа №1 для сферы услуг</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-[1.1]">
            Твой бизнес <br/>
            в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">одной ссылке</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Замени громоздкий сайт на стильную визитку. Онлайн-запись, меню, отзывы и Telegram-бот уже внутри. Запуск за 15 минут.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/elegant-barbershop" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <button className="relative w-full sm:w-auto px-8 py-4 bg-[#0B0F19] hover:bg-slate-900 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
                <Smartphone size={20} className="text-indigo-400" />
                Смотреть демо
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg transition border border-white/10 backdrop-blur-sm">
              Выбрать тариф
            </button>
          </div>
        </motion.div>

        {/* Правая часть: Визуализация телефона */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full max-w-sm relative md:top-10"
        >
           {/* Mockup телефона */}
           <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#111] relative">
                    {/* Эмуляция экрана */}
                    <div className="absolute top-0 w-full h-full bg-slate-900 flex flex-col items-center pt-10 px-4 gap-4">
                        <div className="w-20 h-20 rounded-full bg-indigo-500 mb-2 mt-4 animate-pulse"></div>
                        <div className="w-3/4 h-4 bg-slate-700 rounded-full"></div>
                        <div className="w-1/2 h-3 bg-slate-800 rounded-full mb-4"></div>
                        
                        <div className="w-full h-12 bg-slate-800 rounded-xl mb-1 flex items-center px-4 gap-2">
                           <CalendarCheck size={16} className="text-slate-500" />
                           <div className="w-20 h-2 bg-slate-600 rounded-full"></div>
                        </div>
                         <div className="w-full h-12 bg-slate-800 rounded-xl mb-1 flex items-center px-4 gap-2">
                           <Clock size={16} className="text-slate-500" />
                           <div className="w-24 h-2 bg-slate-600 rounded-full"></div>
                        </div>
                        
                        <div className="w-full mt-auto mb-6 p-3 bg-indigo-600 rounded-xl text-center text-xs font-bold text-white">
                          Записаться онлайн
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </header>

      {/* --- ВОЗМОЖНОСТИ --- */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Всё для управления <br/> услугами и записью</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Мы объединили инструменты бронирования, маркетинга и аналитики в одном красивом интерфейсе.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<CalendarCheck />}
              title="Онлайн запись и Бронь"
              desc="Клиенты записываются на услуги или бронируют столы 24/7. Автоматическое подтверждение и синхронизация."
              color="text-emerald-400"
            />
            <FeatureCard 
              icon={<BellRing />}
              title="Telegram Бот"
              desc="Мгновенные оповещения о новых записях прямо в ваш мессенджер. Управление расписанием через чат."
              color="text-blue-400"
            />
            <FeatureCard 
              icon={<Star />}
              title="Агрегатор отзывов"
              desc="Собираем отзывы с карт и агрегаторов в одном месте. Повышайте доверие новых клиентов."
              color="text-yellow-400"
            />
            <FeatureCard 
              icon={<Users />}
              title="Мастера и Смены"
              desc="Просмотр того, кто сейчас на смене. Удобный график работы для каждого сотрудника."
              color="text-purple-400"
            />
            <FeatureCard 
              icon={<UtensilsCrossed />}
              title="Меню и Услуги"
              desc="Красивое цифровое меню с фото и ценами. Разделение по категориям для удобства клиентов."
              color="text-orange-400"
            />
            <FeatureCard 
              icon={<MessageCircle />}
              title="Карусель акций"
              desc="Яркие баннеры со спецпредложениями, которые невозможно пропустить. Увеличивайте средний чек."
              color="text-pink-400"
            />
            <FeatureCard 
              icon={<HelpCircle />}
              title="FAQ и Поддержка"
              desc="Блок вопросов и ответов снимает 80% нагрузки с администратора. Все ответы под рукой."
              color="text-teal-400"
            />
            <FeatureCard 
              icon={<Clock />}
              title="Уведомления клиентам"
              desc="Бот напомнит клиенту о визите заранее, снижая количество неявок и опозданий."
              color="text-cyan-400"
            />
             <FeatureCard 
              icon={<CheckCircle2 />}
              title="Единая ссылка"
              desc="Разместите одну ссылку в Instagram, TikTok и 2GIS. Клиент сразу видит всё важное."
              color="text-white"
            />
          </div>
        </div>
      </section>

      {/* --- ТАРИФЫ --- */}
      <section id="pricing" className="py-24 px-6 bg-[#0E121E]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-6">Простые тарифы</h2>
          <p className="text-slate-400 text-center mb-16 text-lg">Начните бесплатно, платите по мере роста</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <PricingCard 
              title="Старт" 
              price="0 ₽"
              description="Для частных мастеров и старта"
              features={["Базовая веб-визитка", "Ссылки на соцсети и мессенджеры", "До 5 услуг/товаров в меню", "Стандартный дизайн"]}
              buttonText="Попробовать"
            />
            <PricingCard 
              title="Бизнес" 
              price="990 ₽"
              description="Идеально для салонов и кафе"
              isPopular={true}
              features={[
                "Всё из тарифа Старт",
                "Онлайн-запись и бронь столов",
                "Telegram уведомления админу",
                "Напоминания клиентам",
                "Агрегация отзывов",
                "Карусель акций и промо"
              ]}
              buttonText="Подключить Бизнес"
            />
            <PricingCard 
              title="Максимум" 
              price="2490 ₽"
              description="Для сетей и брендов"
              features={[
                "Всё из тарифа Бизнес",
                "Подключение своего домена",
                "Управление сменами сотрудников",
                "Индивидуальная кастомизация",
                "Приоритетная поддержка 24/7",
                "Без лейбла сервиса"
              ]}
              buttonText="Связаться с нами"
            />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION (Интерактивная) --- */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Частые вопросы</h2>
        <div className="space-y-4">
          <FaqItem 
            question="Нужно ли мне знать программирование?" 
            answer="Нет, абсолютно не нужно. Вы заполняете простую анкету, загружаете фото, и ваш сайт генерируется автоматически." 
          />
          <FaqItem 
            question="Как работают уведомления в Telegram?" 
            answer="Вы подключаете нашего бота за 1 клик. Когда клиент оставляет заявку на сайте, бот мгновенно присылает вам сообщение с деталями записи." 
          />
          <FaqItem 
            question="Можно ли использовать свой домен?" 
            answer="Да, на тарифе «Максимум» мы можем подключить ваш собственный красивый домен (например, barbershop.ru) вместо нашей ссылки." 
          />
          <FaqItem 
            question="Можно ли изменить дизайн?" 
            answer="Да, вы можете менять цветовую тему, загружать свои логотипы и фотографии фона, чтобы сайт соответствовал вашему бренду." 
          />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 bg-[#05070B] text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 mb-4">Linkalink</div>
          <p className="text-slate-500 mb-8 max-w-sm">
            Современный конструктор сайтов для сферы услуг. <br/>Сделано с любовью к бизнесу.
          </p>
          <div className="flex gap-6 mb-8 text-slate-400">
            <a href="#" className="hover:text-white transition">Telegram Бот</a>
            <a href="#" className="hover:text-white transition">Поддержка</a>
            <a href="#" className="hover:text-white transition">Оферта</a>
          </div>
          <p className="text-slate-600 text-sm">&copy; 2024 Linkalink. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

// --- ВНУТРЕННИЕ КОМПОНЕНТЫ ---

function FeatureCard({ icon, title, desc, color }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all duration-300 group"
    >
      <div className={`mb-6 p-4 rounded-2xl bg-slate-900/50 w-fit ${color} group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/5`}>
        {/* Исправлено: Добавлено явное указание типа <any>, чтобы TS разрешил параметр size */}
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function PricingCard({ title, price, description, features, isPopular = false, buttonText = "Выбрать" }: PricingCardProps) {
  return (
    <motion.div 
      whileHover={{ y: isPopular ? -10 : -5 }}
      className={`relative p-8 rounded-3xl border flex flex-col h-full ${
        isPopular 
          ? 'bg-gradient-to-b from-slate-900 to-slate-900/50 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 z-10' 
          : 'bg-white/5 border-white/5'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-indigo-500/40">
          ХИТ ПРОДАЖ
        </div>
      )}
      <div className="mb-6">
        <h3 className={`text-lg font-bold mb-2 ${isPopular ? 'text-indigo-400' : 'text-slate-200'}`}>{title}</h3>
        <p className="text-slate-500 text-xs mb-4 h-8">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-slate-500">/мес</span>
        </div>
      </div>
      
      <div className="w-full h-px bg-white/5 mb-6"></div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
            <CheckCircle2 size={18} className={`shrink-0 ${isPopular ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span className="leading-tight">{item}</span>
          </li>
        ))}
      </ul>
      
      <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
        isPopular 
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}>
        {buttonText}
      </button>
    </motion.div>
  )
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-bold text-slate-200">{question}</span>
        <ChevronDown 
          className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}