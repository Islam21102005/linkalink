import { supabase } from "@/lib/supabase"; // Подключаем нашу базу
import { notFound } from "next/navigation";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. Получаем slug из адреса
  const { slug } = await params;

  // 2. Делаем запрос в НАСТОЯЩУЮ базу данных Supabase
  // "Найди в таблице 'businesses' строку, где slug равен нашему slug"
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  // 3. Если ошибка или бизнес не найден — 404
  if (error || !business) {
    console.log("Ошибка или не найдено:", error); // Увидим в терминале, если что-то не так
    notFound();
  }

  // Приводим услуги к правильному типу (так как из базы приходит JSON)
  const services = business.services as any[];

  // 4. Рисуем страницу с данными из базы
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Шапка */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="opacity-90 mt-2 text-sm">{business.description}</p>
        </div>

        {/* Список услуг */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Услуги</h2>
          <div className="space-y-3">
            {/* Проверяем, есть ли услуги, перед тем как рисовать */}
            {services && services.map((service, index) => (
              <div key={index} className="flex justify-between border-b pb-2 last:border-0">
                <span className="text-gray-700">{service.name}</span>
                <span className="font-bold text-gray-900">{service.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки связи */}
        <div className="p-6 bg-gray-50 border-t space-y-3">
            {business.whatsapp && (
              <a 
                href={`https://wa.me/${business.whatsapp}`} 
                target="_blank"
                className="block w-full bg-green-500 text-white text-center py-3 rounded-xl font-bold hover:bg-green-600 transition"
              >
                WhatsApp
              </a>
            )}
            
            {business.phone && (
              <a 
                href={`tel:${business.phone}`} 
                className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Позвонить
              </a>
            )}
        </div>

      </div>
    </div>
  );
}
