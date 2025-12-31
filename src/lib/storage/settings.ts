import { db, AppSettings } from './db';

const SETTINGS_ID = 'app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  preferredModel: null,
  sidebarExpanded: true,
  lastActiveAgentId: null,
  lastActiveChatId: null,
};

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get(SETTINGS_ID);
  if (!settings) {
    await db.settings.add(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return settings;
}

export async function updateSettings(updates: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  const settings = await getSettings();
  await db.settings.put({
    ...settings,
    ...updates,
  });
}

export async function resetSettings(): Promise<void> {
  await db.settings.put(DEFAULT_SETTINGS);
}
