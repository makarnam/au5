import React, { useState, useEffect } from 'react';
import { languageService, Language } from '../services/languageService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Globe, Check } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language | undefined>();
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);

  useEffect(() => {
    // Initialize languages
    setSupportedLanguages(languageService.getSupportedLanguages());
    setCurrentLanguage(languageService.getCurrentLanguageObject());

    // Listen for language changes
    const unsubscribe = languageService.onLanguageChange((languageCode) => {
      setCurrentLanguage(languageService.getCurrentLanguageObject());
    });

    return unsubscribe;
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await languageService.setLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (!currentLanguage || supportedLanguages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 h-auto"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentLanguage.flag} {currentLanguage.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{language.flag}</span>
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">
                ({language.name})
              </span>
            </div>
            {currentLanguage?.code === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;