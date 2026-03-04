"use client";

import { useEffect } from "react";

type AppLanguage = "EN" | "NP";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const STORAGE_KEY = "language";
const EVENT_NAME = "app-language-change";

const languageToGoogle = (value: AppLanguage) => (value === "NP" ? "ne" : "en");

function setGoogleTranslateCookie(targetLang: "en" | "ne") {
  const value = `/en/${targetLang}`;
  document.cookie = `googtrans=${value};path=/`;
}

function applyLanguage(value: AppLanguage) {
  const targetLang = languageToGoogle(value);
  setGoogleTranslateCookie(targetLang);
  document.documentElement.lang = targetLang;

  const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (combo) {
    combo.value = targetLang;
    combo.dispatchEvent(new Event("change"));
  }
}

export default function GlobalTranslator() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeGoogle = () => {
      if (!window.google?.translate?.TranslateElement) return;
      if (document.getElementById("google_translate_element")?.childElementCount) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ne",
          autoDisplay: false,
        },
        "google_translate_element",
      );

      const saved = (localStorage.getItem(STORAGE_KEY) as AppLanguage | null) || "EN";
      applyLanguage(saved);
    };

    window.googleTranslateElementInit = initializeGoogle;

    const existingScript = document.querySelector('script[src*="translate_a/element.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }

    const onLanguageChange = () => {
      const saved = (localStorage.getItem(STORAGE_KEY) as AppLanguage | null) || "EN";
      applyLanguage(saved);
    };

    window.addEventListener(EVENT_NAME, onLanguageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, onLanguageChange);
    };
  }, []);

  return <div id="google_translate_element" className="hidden" aria-hidden="true" />;
}
