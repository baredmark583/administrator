import React, { useState, useEffect, useMemo } from 'react';
import Spinner from '../components/Spinner';
import { backendApiService } from '../services/backendApiService';
import type { Setting, SettingAuditEntry } from '../services/adminApiService';

const SETTING_DESCRIPTIONS: Record<string, string> = {
    PLATFORM_COMMISSION_PERCENT: 'Комиссия площадки (в процентах).',
    PRO_VERIFICATION_FEE_USDT: 'Стоимость получения/продления статуса PRO в USDT.',
    SITE_MAINTENANCE_MODE: 'Режим обслуживания (true/false) — блокирует публичный фронт.',
    MAX_PENDING_LISTINGS_PER_SELLER: 'Сколько черновиков/листингов в статусе Pending может быть у одного продавца.',
    ALLOWED_DOMAIN_WHITELIST: 'Список доменов (через запятую), с которых разрешены редиректы и встраивание.',
};

const SUGGESTED_KEYS: Array<{ key: string; example: string }> = [
    { key: 'PLATFORM_COMMISSION_PERCENT', example: '2.5' },
    { key: 'MAX_PENDING_LISTINGS_PER_SELLER', example: '25' },
    { key: 'ALLOWED_DOMAIN_WHITELIST', example: 'app.cryptocraft.market,cryptocraft.market' },
    { key: 'PRO_VERIFICATION_FEE_USDT', example: '99' },
    { key: 'SITE_MAINTENANCE_MODE', example: 'false' },
];

const isMultilineKey = (key: string) => /WHITELIST|JSON|HTML/i.test(key);
const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString() : '—');

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [auditTrail, setAuditTrail] = useState<SettingAuditEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAuditLoading, setIsAuditLoading] = useState(true);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setIsAuditLoading(true);
            try {
                const [fetchedSettings, fetchedAudit] = await Promise.all([
                    backendApiService.getSettings(),
                    backendApiService.getSettingsAudit(50),
                ]);
                setSettings(fetchedSettings);
                setAuditTrail(fetchedAudit);
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setIsLoading(false);
                setIsAuditLoading(false);
            }
        };

        fetchData();
    }, []);

    const pendingSuggestedKeys = useMemo(
        () => SUGGESTED_KEYS.filter(s => !settings.some(setting => setting.key === s.key)),
        [settings],
    );

    const handleSettingChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => (s.key === key ? { ...s, value } : s)));
    };

    const handleAddSetting = () => {
        if (!newKey.trim()) {
            alert('Введите ключ настройки.');
            return;
        }
        const normalizedKey = newKey.trim().toUpperCase();
        if (settings.some(setting => setting.key === normalizedKey)) {
            alert('Такой ключ уже существует.');
            return;
        }
        setSettings(prev => [...prev, { key: normalizedKey, value: newValue }]);
        setNewKey('');
        setNewValue('');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await backendApiService.updateSettings(settings);
            setSettings(updated);
            const audit = await backendApiService.getSettingsAudit(50);
            setAuditTrail(audit);
            alert('Настройки успешно сохранены.');
        } catch (error) {
            console.error(error);
            alert('Ошибка сохранения настроек.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefreshAudit = async () => {
        setIsAuditLoading(true);
        try {
            const audit = await backendApiService.getSettingsAudit(50);
            setAuditTrail(audit);
        } catch (error) {
            console.error(error);
            alert('Не удалось обновить историю.');
        } finally {
            setIsAuditLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Глобальные настройки</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Ключевые параметры</h2>
                                <p className="text-sm text-base-content/70">
                                    Отражаются в реальном времени — изменения фиксируются в аудит-логе.
                                </p>
                            </div>
                            <span className="text-xs uppercase tracking-widest text-base-content/60">
                                {settings.length} активных ключей
                            </span>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-base-content/60 uppercase">Рекомендуемые ключи</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {SUGGESTED_KEYS.map(item => {
                                    const alreadyUsed = !pendingSuggestedKeys.some(pending => pending.key === item.key);
                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            disabled={alreadyUsed}
                                            onClick={() => {
                                                setNewKey(item.key);
                                                setNewValue(item.example);
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                alreadyUsed
                                                    ? 'bg-base-300 text-base-content/50 cursor-not-allowed'
                                                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                                            }`}
                                        >
                                            {item.key}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-6">
                            {settings.map(setting => {
                                const multiline = isMultilineKey(setting.key);
                                return (
                                    <div key={setting.key} className="p-4 bg-base-200/40 rounded-lg border border-base-300/50">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <label
                                                    htmlFor={setting.key}
                                                    className="block text-sm font-semibold text-white uppercase tracking-wide"
                                                >
                                                    {setting.key.replace(/_/g, ' ')}
                                                </label>
                                                <p className="text-xs text-base-content/60">
                                                    {SETTING_DESCRIPTIONS[setting.key] || 'Системный параметр'}
                                                </p>
                                            </div>
                                            <span className="text-[11px] text-base-content/50">
                                                Обновлено: {formatDateTime(setting.updatedAt)}
                                            </span>
                                        </div>
                                        {multiline ? (
                                            <textarea
                                                id={setting.key}
                                                value={setting.value}
                                                onChange={e => handleSettingChange(setting.key, e.target.value)}
                                                rows={3}
                                                className="w-full bg-base-100 border border-base-300 rounded-md p-2 font-mono text-sm"
                                            />
                                        ) : (
                                            <input
                                                id={setting.key}
                                                type="text"
                                                value={setting.value}
                                                onChange={e => handleSettingChange(setting.key, e.target.value)}
                                                className="mt-1 block w-full bg-base-100 border border-base-300 rounded-md p-2 font-mono"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 border-t border-base-300 pt-6">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Добавить новый ключ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    value={newKey}
                                    onChange={e => setNewKey(e.target.value)}
                                    placeholder="ALLOWED_DOMAIN_WHITELIST"
                                    className="bg-base-200 border border-base-300 rounded-md p-2 font-mono text-sm uppercase"
                                />
                                <textarea
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    placeholder="Значение..."
                                    rows={2}
                                    className="bg-base-200 border border-base-300 rounded-md p-2 font-mono text-sm md:col-span-2"
                                />
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={handleAddSetting}
                                    className="px-4 py-2 rounded-lg bg-base-300 hover:bg-base-200 text-white text-sm font-semibold"
                                >
                                    Добавить ключ
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-base-300 pt-6">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full flex justify-center py-3 px-4 bg-primary hover:bg-primary-focus text-white font-bold rounded-lg transition-colors disabled:bg-gray-500"
                            >
                                {isSaving ? <Spinner size="sm" /> : 'Сохранить настройки'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-1">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">История изменений</h2>
                                <p className="text-xs text-base-content/60">Последние 50 событий SettingAudit</p>
                            </div>
                            <button
                                onClick={handleRefreshAudit}
                                disabled={isAuditLoading}
                                className="px-3 py-1 rounded-lg bg-base-300 text-xs font-semibold text-white hover:bg-base-200 disabled:opacity-50"
                            >
                                {isAuditLoading ? '...' : 'Обновить'}
                            </button>
                        </div>
                        {isAuditLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Spinner size="sm" />
                            </div>
                        ) : auditTrail.length === 0 ? (
                            <div className="text-center text-base-content/60 text-sm">Изменений пока не зафиксировано.</div>
                        ) : (
                            <ul className="divide-y divide-base-300/60 max-h-[520px] overflow-y-auto pr-1">
                                {auditTrail.map(entry => (
                                    <li key={entry.id} className="py-3">
                                        <p className="text-[11px] uppercase tracking-wide text-base-content/50">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </p>
                                        <p className="font-mono text-sm text-primary mt-0.5">{entry.key}</p>
                                        <p className="text-xs text-base-content/70 mt-1">
                                            {entry.oldValue ?? '—'} → <span className="font-semibold text-white">{entry.newValue}</span>
                                        </p>
                                        <p className="text-[11px] text-base-content/50 mt-0.5">
                                            {entry.updatedBy ? `Админ: ${entry.updatedBy}` : 'Система'}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
