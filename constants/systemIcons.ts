export interface SystemIcon {
  key: string;
  label: string;
  description: string;
  suggestionUrl: string;
}

export const SYSTEM_ICONS: SystemIcon[] = [
    { key: 'back-arrow', label: 'Стрелка "Назад"', description: 'Кнопка "Назад" в шапке сайта', suggestionUrl: 'https://api.iconify.design/mdi/arrow-left.svg' },
    { key: 'search', label: 'Поиск', description: 'Иконка поиска в шапке и на мобильных', suggestionUrl: 'https://api.iconify.design/mdi/magnify.svg' },
    { key: 'community', label: 'Сообщество', description: 'Иконка центра сообщества в шапке', suggestionUrl: 'https://api.iconify.design/mdi/account-group.svg' },
    { key: 'bell', label: 'Уведомления', description: 'Иконка уведомлений (колокольчик)', suggestionUrl: 'https://api.iconify.design/mdi/bell.svg' },
    { key: 'chat', label: 'Чаты', description: 'Иконка чатов в шапке', suggestionUrl: 'https://api.iconify.design/mdi/message-outline.svg' },
    { key: 'cart', label: 'Корзина', description: 'Иконка корзины в шапке сайта', suggestionUrl: 'https://api.iconify.design/mdi/cart.svg' },
];
