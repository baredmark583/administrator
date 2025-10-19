export interface SystemIcon {
  key: string;
  label: string;
  description: string;
  suggestionUrl: string;
}

export const SYSTEM_ICONS: SystemIcon[] = [
    // Original Icons
    { key: 'back-arrow', label: 'Стрелка "Назад"', description: 'Кнопка "Назад" в шапке сайта', suggestionUrl: 'https://api.iconify.design/mdi/arrow-left.svg' },
    { key: 'search', label: 'Поиск', description: 'Иконка поиска в шапке и на мобильных', suggestionUrl: 'https://api.iconify.design/mdi/magnify.svg' },
    { key: 'community', label: 'Сообщество', description: 'Иконка центра сообщества в шапке', suggestionUrl: 'https://api.iconify.design/mdi/account-group.svg' },
    { key: 'bell', label: 'Уведомления', description: 'Иконка уведомлений (колокольчик)', suggestionUrl: 'https://api.iconify.design/mdi/bell.svg' },
    { key: 'chat', label: 'Чаты', description: 'Иконка чатов в шапке', suggestionUrl: 'https://api.iconify.design/mdi/message-outline.svg' },
    { key: 'cart', label: 'Корзина', description: 'Иконка корзины в шапке сайта', suggestionUrl: 'https://api.iconify.design/mdi/cart.svg' },

    // New Icons from Frontend
    // Product/Listing
    { key: 'wishlist-heart', label: 'Сердце (Избранное)', description: 'Иконка для добавления товара в избранное.', suggestionUrl: 'https://api.iconify.design/mdi/heart-outline.svg' },
    { key: 'collection-add', label: 'Добавить в коллекцию', description: 'Иконка для сохранения товара в коллекцию.', suggestionUrl: 'https://api.iconify.design/mdi/plus-box-outline.svg' },
    { key: 'upload-image', label: 'Загрузить изображение', description: 'Иконка в области для загрузки изображений.', suggestionUrl: 'https://api.iconify.design/mdi/image-plus.svg' },
    { key: 'delete-item', label: 'Удалить элемент', description: 'Кнопка удаления (корзина) для элементов.', suggestionUrl: 'https://api.iconify.design/mdi/delete.svg' },
    { key: 'accordion-arrow', label: 'Стрелка аккордеона', description: 'Стрелка для раскрывающихся списков.', suggestionUrl: 'https://api.iconify.design/mdi/chevron-down.svg' },
    { key: 'ai-studio-link', label: 'Ссылка на AI Студию', description: 'Иконка карандаша для редактирования.', suggestionUrl: 'https://api.iconify.design/mdi/pencil.svg' },
    { key: 'add-image', label: 'Добавить фото', description: 'Плюс для добавления новых изображений.', suggestionUrl: 'https://api.iconify.design/mdi/plus.svg' },
    { key: 'filter-toggle', label: 'Фильтры', description: 'Иконка для открытия панели фильтров на мобильных.', suggestionUrl: 'https://api.iconify.design/mdi/filter-variant.svg' },
    { key: 'verified-badge', label: 'Значок "Проверено"', description: 'Значок для Pro-продавцов.', suggestionUrl: 'https://api.iconify.design/mdi/check-decagram.svg' },
    { key: 'authenticated-badge', label: 'Значок "Аутентифицировано"', description: 'Щит для товаров, прошедших проверку.', suggestionUrl: 'https://api.iconify.design/mdi/shield-check.svg' },
    { key: 'nft-badge', label: 'Значок NFT', description: 'Звезда для товаров с NFT-сертификатом.', suggestionUrl: 'https://api.iconify.design/mdi/star-circle.svg' },

    // Chat/Social
    { key: 'attachment-clip', label: 'Прикрепить файл', description: 'Скрепка для прикрепления файлов в чате.', suggestionUrl: 'https://api.iconify.design/mdi/paperclip.svg' },
    { key: 'send-arrow', label: 'Отправить сообщение', description: 'Стрелка/самолетик для отправки сообщений.', suggestionUrl: 'https://api.iconify.design/mdi/send.svg' },
    { key: 'comment-bubble', label: 'Комментарий', description: 'Иконка для отображения количества комментариев.', suggestionUrl: 'https://api.iconify.design/mdi/comment-text-outline.svg' },
    { key: 'share', label: 'Поделиться', description: 'Иконка "Поделиться" для постов в мастерской.', suggestionUrl: 'https://api.iconify.design/mdi/share-variant.svg' },
    
    // Navigation/UI
    { key: 'mobile-nav-home', label: 'Моб. навигация: Главная', description: 'Иконка "Дом" в нижней панели навигации.', suggestionUrl: 'https://api.iconify.design/mdi/home.svg' },
    { key: 'mobile-nav-profile', label: 'Моб. навигация: Профиль', description: 'Иконка "Пользователь" в нижней панели.', suggestionUrl: 'https://api.iconify.design/mdi/account.svg' },

    // Notifications
    { key: 'notification-message', label: 'Уведомление: Сообщение', description: 'Иконка для уведомлений о новых сообщениях.', suggestionUrl: 'https://api.iconify.design/mdi/email.svg' },
    { key: 'notification-review', label: 'Уведомление: Отзыв', description: 'Иконка для уведомлений о новых отзывах.', suggestionUrl: 'https://api.iconify.design/mdi/star.svg' },
    { key: 'notification-outbid', label: 'Уведомление: Ставка перебита', description: 'Иконка для уведомлений о перебитой ставке.', suggestionUrl: 'https://api.iconify.design/mdi/arrow-top-right.svg' },
    { key: 'notification-auction-won', label: 'Уведомление: Победа в аукционе', description: 'Иконка для победителя аукциона.', suggestionUrl: 'https://api.iconify.design/mdi/gavel.svg' },
    { key: 'notification-auction-ended', label: 'Уведомление: Аукцион завершен', description: 'Иконка для продавца о завершении аукциона.', suggestionUrl: 'https://api.iconify.design/mdi/timer-sand-complete.svg' },
    { key: 'notification-dispute', label: 'Уведомление: Спор', description: 'Иконка для уведомлений о новых спорах.', suggestionUrl: 'https://api.iconify.design/mdi/alert-circle.svg' },
    { key: 'notification-sale', label: 'Уведомление: Продажа', description: 'Иконка для уведомлений о продажах.', suggestionUrl: 'https://api.iconify.design/mdi/tag.svg' },
    { key: 'notification-new-listing', label: 'Уведомление: Новый товар', description: 'Иконка о новом товаре от отслеживаемого продавца.', suggestionUrl: 'https://api.iconify.design/mdi/store-plus.svg' },
    { key: 'notification-personal-offer', label: 'Уведомление: Персональное предложение', description: 'Иконка для персональных предложений.', suggestionUrl: 'https://api.iconify.design/mdi/gift.svg' },

    // Profile/Dashboard
    { key: 'star-rating', label: 'Звезда рейтинга', description: 'Звезда для отображения рейтинга.', suggestionUrl: 'https://api.iconify.design/mdi/star.svg' },
    { key: 'dao-governance', label: 'Управление DAO', description: 'Иконка для раздела управления.', suggestionUrl: 'https://api.iconify.design/mdi/bank.svg' },
    { key: 'start-livestream', label: 'Начать эфир', description: 'Иконка для кнопки начала трансляции.', suggestionUrl: 'https://api.iconify.design/mdi/video.svg' },
    { key: 'secure-deal', label: 'Безопасная сделка', description: 'Щит для индикации безопасной сделки.', suggestionUrl: 'https://api.iconify.design/mdi/shield-check-outline.svg' },
    { key: 'tracking-package', label: 'Отслеживание посылки', description: 'Иконка для отслеживания заказа.', suggestionUrl: 'https://api.iconify.design/mdi/package-variant-closed.svg' },
    { key: 'stat-revenue', label: 'Статистика: Доход', description: 'Иконка для карточки дохода.', suggestionUrl: 'https://api.iconify.design/mdi/currency-usd.svg' },
    { key: 'stat-sales', label: 'Статистика: Продажи', description: 'Иконка для карточки продаж.', suggestionUrl: 'https://api.iconify.design/mdi/cart-arrow-down.svg' },
    { key: 'stat-visits', label: 'Статистика: Визиты', description: 'Иконка для карточки визитов.', suggestionUrl: 'https://api.iconify.design/mdi/eye.svg' },
    { key: 'stat-conversion', label: 'Статистика: Конверсия', description: 'Иконка для карточки конверсии.', suggestionUrl: 'https://api.iconify.design/mdi/trending-up.svg' },
    { key: 'insight-optimization', label: 'AI Совет: Оптимизация', description: 'Иконка для советов по оптимизации.', suggestionUrl: 'https://api.iconify.design/mdi/cog.svg' },
    { key: 'insight-opportunity', label: 'AI Совет: Возможность', description: 'Иконка для советов о возможностях.', suggestionUrl: 'https://api.iconify.design/mdi/lightbulb-on.svg' },
    { key: 'insight-warning', label: 'AI Совет: Предупреждение', description: 'Иконка для предупреждений.', suggestionUrl: 'https://api.iconify.design/mdi/alert.svg' },

    // Checkout
    { key: 'checkout-warning', label: 'Предупреждение (Оформление заказа)', description: 'Иконка для предупреждения о прямой оплате.', suggestionUrl: 'https://api.iconify.design/mdi/alert-triangle.svg' },

    // Currencies
    { key: 'currency-usdt', label: 'Логотип USDT', description: 'Иконка валюты USDT, используемая в ценах.', suggestionUrl: 'https://api.iconify.design/cryptocurrency-color/usdt.svg' },
    { key: 'currency-ton', label: 'Логотип TON', description: 'Иконка валюты TON, используемая в ценах.', suggestionUrl: 'https://api.iconify.design/cryptocurrency-color/ton.svg' },
    { key: 'currency-usdc', label: 'Логотип USDC', description: 'Иконка валюты USDC, используемая в ценах.', suggestionUrl: 'https://api.iconify.design/cryptocurrency-color/usdc.svg' },
];
