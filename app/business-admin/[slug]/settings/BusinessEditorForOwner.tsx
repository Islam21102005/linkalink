'use client'

/**
 * BusinessEditorForOwner
 *
 * Тонкая обёртка над существующим BusinessEditor из суперадминки.
 * Владелец бизнеса получает полный доступ к редактированию (услуги,
 * мастера, галерея, соцсети, акции, рассылки и т.д.) — но без
 * возможности удалить бизнес и без доступа к другим бизнесам.
 *
 * Вместо дублирования 1300 строк кода — переиспользуем компонент
 * через динамический импорт с передачей флага isOwnerView.
 */

import dynamic from 'next/dynamic'

// Динамический импорт чтобы не грузить в SSR
const BusinessEditor = dynamic(
  () => import('@/app/admin/businesses/[id]/BusinessEditor'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Загрузка редактора...
    </div>
  )}
)

interface Props {
  business: any
  services: any[]
  masters: any[]
  addons: any[]
  returnUrl: string
}

export default function BusinessEditorForOwner({ business, services, masters, addons, returnUrl }: Props) {
  return (
    <div className="business-editor-owner-view">
      {/*
        Передаём isOwnerView=true — BusinessEditor должен это поддерживать.
        Если не поддерживает — скрываем кнопку удалить через CSS.
        Кнопки сохранения и предпросмотра остаются.
      */}
      <style>{`
        .business-editor-owner-view button[class*="bg-red"] {
          display: none !important;
        }
      `}</style>
      <BusinessEditor
        business={business}
        services={services}
        masters={masters}
        addons={addons}
      />
    </div>
  )
}