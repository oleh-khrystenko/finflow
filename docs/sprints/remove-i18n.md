# Sprint: Видалення i18n (залишається тільки українська)

## Мета

Повністю видалити мультимовність (next-intl, `[locale]` routing, en.json, LANG enum, preferredLang). Залишити тільки українську мову. Тексти з `uk.json` інлайняться безпосередньо в компоненти або виносяться у простий об'єкт констант (без i18n-бібліотеки).

---

## Блок 1: Frontend — видалення next-intl та locale routing

### 1.1 Видалити `[locale]` сегмент з App Router

- Перемістити всі файли з `app/[locale]/` на рівень вище в `app/`
- Видалити dynamic param `locale` з layout, pages, middleware
- Оновити всі внутрішні посилання: `/${locale}/profile` -> `/profile`, `/${locale}/auth/signin` -> `/auth/signin` тощо

### 1.2 Видалити next-intl інфраструктуру

- Видалити `src/i18n/routing.ts` та `src/i18n/request.ts` (вся папка `src/i18n/`)
- Видалити `createNextIntlPlugin()` з `next.config.ts` — залишити просто `export default nextConfig`
- Видалити `<NextIntlClientProvider>` з layout.tsx
- Видалити `createIntlMiddleware` з `middleware.ts` — залишити тільки auth-логіку (protected/auth redirects)

### 1.3 Замінити `useTranslations()` / `useLocale()` у компонентах

Файли, що використовують `useTranslations`:
- `app/.../page.tsx` (welcome, profile, billing, signin, verify, callback, success, cancel)
- `widgets/header/Header.tsx`
- `features/profile/ProfileForm.tsx`
- `features/profile/SecuritySection.tsx`
- `features/profile/DangerZone.tsx`
- `features/profile/DeleteAccountModal.tsx`
- `features/change-lang/ChangeLang.tsx` (видаляється повністю)

**Підхід:** Взяти тексти з `messages/uk.json`, інлайнити як строкові літерали або винести у `const` об'єкти поруч з компонентами (якщо текстів більше 5). Видалити всі виклики `useTranslations()`, `useLocale()`, імпорти з `next-intl`.

### 1.4 Замінити `getApiMessageKey()` (mapApiCode)

- Зараз: повертає i18n ключ типу `notifications.auth.magic_link_sent`, який потім передається в `t()`
- Після: створити простий маппінг `RESPONSE_CODE -> українське повідомлення` (об'єкт-словник), функція повертає готовий рядок замість ключа
- Оновити всі місця виклику в signin/verify page

### 1.5 Видалити feature change-lang

- Видалити папку `features/change-lang/` повністю (ChangeLang.tsx, types.ts, index.ts)
- Видалити `<ChangeLang />` з `widgets/header/Header.tsx`
- Видалити `updatePreferredLang` з `shared/api/auth.ts` та `shared/api/index.ts`

### 1.6 Видалити файли повідомлень

- Видалити `messages/en.json`
- Видалити `messages/uk.json` (після того як всі тексти перенесені)
- Видалити папку `messages/`

### 1.7 Оновити SEO (metadata.ts)

- `shared/seo/metadata.ts`: прибрати locale logic, прибрати `alternates.languages` (hrefLang), спростити до одномовного canonical URL
- Оновити `PageParams` та `MetaProps` в `shared/types/settings.ts` — прибрати `params: Promise<{ locale: string }>`

### 1.8 Оновити middleware.ts

- Прибрати `localePattern`, `stripLocale()`, `intlMiddleware`
- Спростити: перевірка protected/auth paths напряму по `pathname` без стрипання locale

### 1.9 Видалити залежності

- `pnpm --filter web remove next-intl country-flag-icons`
- Перевірити що `country-flag-icons` не використовується деінде

---

## Блок 2: Backend — видалення мультимовної підтримки

### 2.1 Email templates (email.service.ts)

- Зараз: `TEMPLATES` містить варіанти для `LANG.UK` та `LANG.EN`
- Після: залишити тільки українські шаблони, прибрати `Record<string, EmailTemplate>` рівень
- Прибрати `lang` параметр з `sendMagicLinkEmail()` та `sendDeletionConfirmationEmail()`

### 2.2 Видалити endpoint updateLang

- Видалити `PATCH /api/users/me/lang` з `users.controller.ts`
- Видалити `updateLang()` з `users.service.ts`
- Видалити `UpdateLangSchema` з `packages/types/src/contracts/users.ts`
- Видалити `update-lang.dto.ts` з `apps/api/src/modules/users/dto/`

### 2.3 Видалити поле preferredLang з User schema

- `users/schemas/user.schema.ts`: видалити поле `preferredLang`
- `auth.service.ts`: прибрати `user.preferredLang` — передавати тільки 'uk' (або прибрати параметр зовсім)
- `auth.controller.ts`: прибрати `preferredLang` з response mapping
- `users.controller.ts`: прибрати `preferredLang` з response та `updateProfile`
- `users.service.ts`: прибрати `preferredLang` з `updateProfileAndLang()`

### 2.4 Оновити тести

- `auth.e2e-spec.ts`: прибрати assertions на `preferredLang`
- `users.controller.spec.ts`, `users.service.spec.ts`, `auth.controller.spec.ts`, `auth.service.spec.ts`: прибрати `preferredLang` з mock даних та assertions

---

## Блок 3: Shared types (packages/types)

### 3.1 Видалити LANG enum та Lang type

- Видалити `packages/types/src/constants/lang.ts`
- Видалити реекспорт з `packages/types/src/index.ts` (constants модуль)
- Оновити всі імпорти `LANG` / `Lang` в API та Web

### 3.2 Оновити UserSchema

- `packages/types/src/entities/user.ts`: видалити `preferredLang` з `UserSchema` та `UserProfileSchema`

### 3.3 Оновити contracts

- `contracts/users.ts`: видалити `UpdateLangSchema`, прибрати `preferredLang` з `UpdateProfileSchema`
- `contracts/auth.ts`: якщо є `preferredLang` — прибрати

### 3.4 Перебілдити packages/types

- `pnpm --filter @finflow/types build` — переконатися що все компілюється

---

## Блок 4: Frontend тести

### 4.1 Оновити тести

- `middleware.spec.ts`: прибрати locale-related тести, оновити під новий middleware без intl
- `AuthGuard.spec.tsx`: прибрати locale з шляхів
- `AuthInitializer.spec.tsx`: перевірити чи є locale залежності
- `mapApiCode.spec.ts`: оновити під нову реалізацію (словник замість ключів)
- `authStore.spec.ts`: прибрати `preferredLang` з mock user

---

## Блок 5: Конфігурація та документація

### 5.1 Оновити CLAUDE.md

- Прибрати згадки про i18n, next-intl, locale routing, LANG enum, preferredLang, messages/, change-lang
- Оновити project structure (прибрати `[locale]`, `messages/`, `i18n/`, `change-lang/`)
- Оновити tech stack (прибрати next-intl, country-flag-icons)

### 5.2 Оновити docs/conventions/

- Видалити або оновити `docs/conventions/i18n.md` (якщо існує)
- Оновити `docs/conventions/tone.md` якщо посилається на i18n ключі

### 5.3 Оновити env файли

- Перевірити чи є env vars пов'язані з locale (немає — але перевірити)

### 5.4 Прибрати payment-link page

- `apps/web/src/app/[locale]/payment-link/page.tsx` — перемістити разом з іншими сторінками

---

## Порядок виконання

1. **Блок 3** (types) — спочатку, бо від нього залежать API та Web
2. **Блок 2** (backend) — після types, бо імпортує з types
3. **Блок 1** (frontend) — найбільший блок, після backend
4. **Блок 4** (тести) — після основних змін
5. **Блок 5** (документація) — останнім

## Ризики

- **Велика кількість файлів**: ~25 файлів на фронтенді потребують змін. Краще робити поступово (middleware -> layout -> pages -> features)
- **Routing зміни**: Переміщення з `[locale]/` ламає всі URL. Потрібно перевірити всі `href`, `redirect()`, `router.push()`, `window.location`
- **SEO**: втрата hrefLang альтернатив. Canonical URL стане простішим
- **Email templates**: видалення англійських шаблонів — якщо є англомовні юзери, вони будуть отримувати листи українською
- **Migration**: існуючі юзери з `preferredLang: 'en'` в БД — поле стане orphaned. Можна залишити в БД або написати migration script
