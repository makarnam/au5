import i18n from '../i18n';
import { supabase } from '../lib/supabase';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
];

class LanguageService {
  private currentLanguage: string = 'en';

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Initialize language detection and setup
   */
  public async initializeLanguage(): Promise<void> {
    try {
      // Get user language preference from database if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('language_preference')
          .eq('id', user.id)
          .single();

        if (userProfile?.language_preference) {
          this.currentLanguage = userProfile.language_preference;
        }
      }

      // If no user preference, use browser language or fallback to English
      if (!this.currentLanguage) {
        this.currentLanguage = this.detectBrowserLanguage();
      }

      // Set the language in i18n
      await this.setLanguage(this.currentLanguage);
    } catch (error) {
      console.error('Error initializing language:', error);
      // Fallback to English
      await this.setLanguage('en');
    }
  }

  /**
   * Detect browser language
   */
  private detectBrowserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];

    // Check if browser language is supported
    const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
    return supportedLang ? supportedLang.code : 'en';
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Set language and persist to database
   */
  async setLanguage(languageCode: string): Promise<void> {
    try {
      // Validate language code
      if (!SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)) {
        throw new Error(`Unsupported language: ${languageCode}`);
      }

      // Change i18n language
      await i18n.changeLanguage(languageCode);
      this.currentLanguage = languageCode;

      // Store in localStorage as backup
      localStorage.setItem('user-language', languageCode);

      // Update user preference in database if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ language_preference: languageCode })
          .eq('id', user.id);
      }

      // Dispatch custom event for components to react
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: languageCode }
      }));

    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get current language object
   */
  getCurrentLanguageObject(): Language | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === this.currentLanguage);
  }

  /**
   * Check if language is RTL
   */
  isRTL(languageCode?: string): boolean {
    const lang = languageCode || this.currentLanguage;
    // Add RTL languages as needed (Arabic: 'ar', Hebrew: 'he', etc.)
    return false; // Currently no RTL languages supported
  }

  /**
   * Get direction for current language
   */
  getDirection(languageCode?: string): 'ltr' | 'rtl' {
    return this.isRTL(languageCode) ? 'rtl' : 'ltr';
  }

  /**
   * Reset to default language (English)
   */
  async resetToDefault(): Promise<void> {
    await this.setLanguage('en');
  }

  /**
   * Listen for language changes
   */
  onLanguageChange(callback: (language: string) => void): () => void {
    const handler = (event: CustomEvent) => {
      callback(event.detail.language);
    };

    window.addEventListener('languageChanged', handler as EventListener);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('languageChanged', handler as EventListener);
    };
  }
}

// Create and export singleton instance
export const languageService = new LanguageService();
export default languageService;