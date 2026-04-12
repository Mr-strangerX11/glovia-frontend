# Fix Translator Bug: Remove Google Translate Page on Click

## Plan Steps:
- [x] 1. Create LanguageContext.tsx for EN/NP toggle
- [x] 2. Remove GlobalTranslator.tsx
- [x] 3. Update app/layout.tsx (remove GlobalTranslator)
- [x] 4. Update app/client-layout.tsx (add LanguageProvider)
- [x] 5. Update Header.tsx (use LanguageContext)
- [x] 6. Update Footer.tsx (add language support)
- [ ] 7. Test: `npm run dev`, verify no Google page on lang toggle

Current: Step 3 complete, step 4 next
