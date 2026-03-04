"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AppLanguage = "EN" | "NP";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const STORAGE_KEY = "language";
const EVENT_NAME = "app-language-change";
const SCRIPT_SELECTOR = 'script[src*="translate_a/element.js"]';

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
  if (combo && combo.value !== targetLang) {
    combo.value = targetLang;
    combo.dispatchEvent(new Event("change"));
  }
}

function ensureGoogleTranslateLoaded() {
  if (typeof window === "undefined") return;

  const existingScript = document.querySelector(SCRIPT_SELECTOR);
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      document.documentElement.setAttribute("data-translator-blocked", "true");
    };
    document.body.appendChild(script);
    return;
  }

  if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit?.();
  }
}

export default function GlobalTranslator() {
  const pathname = usePathname();

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

    const saved = (localStorage.getItem(STORAGE_KEY) as AppLanguage | null) || "EN";
    if (saved === "NP") {
      ensureGoogleTranslateLoaded();
    } else {
      applyLanguage(saved);
    }

    const onLanguageChange = () => {
      const saved = (localStorage.getItem(STORAGE_KEY) as AppLanguage | null) || "EN";

      if (saved === "NP") {
        ensureGoogleTranslateLoaded();
      }

      applyLanguage(saved);
    };

    window.addEventListener(EVENT_NAME, onLanguageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, onLanguageChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.documentElement.getAttribute("data-translator-blocked") === "true") return;
    const saved = (localStorage.getItem(STORAGE_KEY) as AppLanguage | null) || "EN";

    const id = window.setTimeout(() => {
      if (saved === "NP") {
        ensureGoogleTranslateLoaded();
      }
      applyLanguage(saved);
    }, 80);

    return () => {
      window.clearTimeout(id);
    };
  }, [pathname]);

  return <div id="google_translate_element" className="hidden" aria-hidden="true" />;
}
