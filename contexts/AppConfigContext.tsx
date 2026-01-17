import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

export interface WhatsAppTemplate {
  packageReceived: string;
  packageReminder: string;
  visitorArrival: string;
  [key: string]: string;
}

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
}

export interface AIConfig {
  name: string;
  voiceGender: 'male' | 'female';
  voiceStyle: 'serious' | 'animated';
  externalInstructions: string;
}

export interface AppConfig {
  condominiumName: string;
  whatsappTemplates: WhatsAppTemplate;
  keyboardShortcuts: KeyboardShortcut[];
  aiConfig: AIConfig;
  theme: 'default' | 'alternative';
}

const defaultConfig: AppConfig = {
  condominiumName: 'GESTÃO DE CONDOMÍNIO',
  whatsappTemplates: {
    packageReceived: 'Olá, {residentName}! Recebemos um volume para você ({packageType}) na portaria do {condominiumName}. Favor retirar assim que possível.',
    packageReminder: 'Olá, {residentName}! Temos um volume ({packageType}) aguardando por você na portaria do {condominiumName} há {permanence}. Favor retirar assim que possível.',
    visitorArrival: 'Olá, {residentName}! Seu visitante {visitorName} chegou na portaria do {condominiumName}.'
  },
  keyboardShortcuts: [
    { key: 'Ctrl+C', action: 'packages', description: 'Abrir Encomendas' },
    { key: 'Ctrl+V', action: 'visitors', description: 'Abrir Visitantes' },
    { key: 'Ctrl+T', action: 'notes', description: 'Abrir Notas' },
    { key: 'Ctrl+D', action: 'dashboard', description: 'Voltar ao Dashboard' },
    { key: 'Ctrl+S', action: 'settings', description: 'Abrir Configurações' }
  ],
  aiConfig: {
    name: 'Sentinela',
    voiceGender: 'male',
    voiceStyle: 'serious',
    externalInstructions: 'Você é um assistente operacional profissional. Seja objetivo, prestativo e eficiente.'
  },
  theme: 'default'
};

interface AppConfigContextType {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;
  updateCondominiumName: (name: string) => void;
  updateWhatsAppTemplate: (key: string, template: string) => void;
  updateKeyboardShortcut: (index: number, shortcut: KeyboardShortcut) => void;
  updateAIConfig: (updates: Partial<AIConfig>) => void;
  resetConfig: () => void;
  loading: boolean;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  // Load config from database on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('app_config')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading config from database:', error);
          // Fall back to localStorage
          loadFromLocalStorage();
        } else if (data) {
          // Merge database config with defaults
          const dbConfig: AppConfig = {
            condominiumName: data.condominium_name || defaultConfig.condominiumName,
            whatsappTemplates: {
              packageReceived: data.whatsapp_template_package_received || defaultConfig.whatsappTemplates.packageReceived,
              packageReminder: data.whatsapp_template_package_reminder || defaultConfig.whatsappTemplates.packageReminder,
              visitorArrival: data.whatsapp_template_visitor_arrival || defaultConfig.whatsappTemplates.visitorArrival
            },
            keyboardShortcuts: defaultConfig.keyboardShortcuts, // Keep defaults for shortcuts
            aiConfig: {
              name: data.ai_name || defaultConfig.aiConfig.name,
              voiceGender: (data.ai_voice_gender as 'male' | 'female') || defaultConfig.aiConfig.voiceGender,
              voiceStyle: (data.ai_voice_style as 'serious' | 'animated') || defaultConfig.aiConfig.voiceStyle,
              externalInstructions: data.ai_external_instructions || defaultConfig.aiConfig.externalInstructions
            },
            theme: (data.theme as 'default' | 'alternative') || defaultConfig.theme
          };
          
          setConfig(dbConfig);
          // Save to localStorage as cache
          localStorage.setItem('app_config', JSON.stringify(dbConfig));
        } else {
          // No config in database, load from localStorage or use defaults
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading config:', error);
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem('app_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig({ ...defaultConfig, ...parsed });
        } catch {
          setConfig(defaultConfig);
        }
      } else {
        setConfig(defaultConfig);
      }
    };

    loadConfig();
  }, []);

  // Apply theme when config changes
  useEffect(() => {
    if (config.theme) {
      document.documentElement.setAttribute('data-theme', config.theme);
    }
    // Save to localStorage as cache
    localStorage.setItem('app_config', JSON.stringify(config));
  }, [config]);

  const saveToDatabase = async (updates: Partial<AppConfig>) => {
    try {
      // Get current config from database
      const { data: existing } = await supabase
        .from('app_config')
        .select('id')
        .limit(1)
        .single();

      const dbUpdate: any = {};
      
      if (updates.condominiumName !== undefined) {
        dbUpdate.condominium_name = updates.condominiumName;
      }
      if (updates.whatsappTemplates) {
        if (updates.whatsappTemplates.packageReceived !== undefined) {
          dbUpdate.whatsapp_template_package_received = updates.whatsappTemplates.packageReceived;
        }
        if (updates.whatsappTemplates.packageReminder !== undefined) {
          dbUpdate.whatsapp_template_package_reminder = updates.whatsappTemplates.packageReminder;
        }
        if (updates.whatsappTemplates.visitorArrival !== undefined) {
          dbUpdate.whatsapp_template_visitor_arrival = updates.whatsappTemplates.visitorArrival;
        }
      }
      if (updates.aiConfig) {
        if (updates.aiConfig.name !== undefined) {
          dbUpdate.ai_name = updates.aiConfig.name;
        }
        if (updates.aiConfig.voiceGender !== undefined) {
          dbUpdate.ai_voice_gender = updates.aiConfig.voiceGender;
        }
        if (updates.aiConfig.voiceStyle !== undefined) {
          dbUpdate.ai_voice_style = updates.aiConfig.voiceStyle;
        }
        if (updates.aiConfig.externalInstructions !== undefined) {
          dbUpdate.ai_external_instructions = updates.aiConfig.externalInstructions;
        }
      }
      if (updates.theme !== undefined) {
        dbUpdate.theme = updates.theme;
      }

      if (existing) {
        // Update existing config
        const { error } = await supabase
          .from('app_config')
          .update(dbUpdate)
          .eq('id', existing.id);
        
        if (error) {
          console.error('Error updating config in database:', error);
        }
      } else {
        // Insert new config
        const { error } = await supabase
          .from('app_config')
          .insert([{
            condominium_name: updates.condominiumName || defaultConfig.condominiumName,
            whatsapp_template_package_received: updates.whatsappTemplates?.packageReceived || defaultConfig.whatsappTemplates.packageReceived,
            whatsapp_template_package_reminder: updates.whatsappTemplates?.packageReminder || defaultConfig.whatsappTemplates.packageReminder,
            whatsapp_template_visitor_arrival: updates.whatsappTemplates?.visitorArrival || defaultConfig.whatsappTemplates.visitorArrival,
            ai_name: updates.aiConfig?.name || defaultConfig.aiConfig.name,
            ai_voice_gender: updates.aiConfig?.voiceGender || defaultConfig.aiConfig.voiceGender,
            ai_voice_style: updates.aiConfig?.voiceStyle || defaultConfig.aiConfig.voiceStyle,
            ai_external_instructions: updates.aiConfig?.externalInstructions || defaultConfig.aiConfig.externalInstructions,
            theme: updates.theme || defaultConfig.theme
          }]);
        
        if (error) {
          console.error('Error inserting config to database:', error);
        }
      }
    } catch (error) {
      console.error('Error saving config to database:', error);
    }
  };

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      // Save to database asynchronously
      saveToDatabase(updates);
      return newConfig;
    });
  };

  const updateCondominiumName = (name: string) => {
    updateConfig({ condominiumName: name });
  };

  const updateWhatsAppTemplate = (key: string, template: string) => {
    setConfig(prev => {
      const newTemplates = { ...prev.whatsappTemplates, [key]: template };
      const newConfig = { ...prev, whatsappTemplates: newTemplates };
      saveToDatabase({ whatsappTemplates: newTemplates });
      return newConfig;
    });
  };

  const updateKeyboardShortcut = (index: number, shortcut: KeyboardShortcut) => {
    setConfig(prev => {
      const newShortcuts = [...prev.keyboardShortcuts];
      newShortcuts[index] = shortcut;
      return { ...prev, keyboardShortcuts: newShortcuts };
    });
  };

  const updateAIConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => {
      const newAIConfig = { ...prev.aiConfig, ...updates };
      const newConfig = { ...prev, aiConfig: newAIConfig };
      saveToDatabase({ aiConfig: newAIConfig });
      return newConfig;
    });
  };

  const resetConfig = async () => {
    setConfig(defaultConfig);
    localStorage.removeItem('app_config');
    // Reset database config to defaults
    await saveToDatabase(defaultConfig);
  };

  return (
    <AppConfigContext.Provider
      value={{
        config,
        updateConfig,
        updateCondominiumName,
        updateWhatsAppTemplate,
        updateKeyboardShortcut,
        updateAIConfig,
        resetConfig,
        loading
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};