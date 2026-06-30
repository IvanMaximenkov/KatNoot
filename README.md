# Катнуть

`Катнуть` — MVP Telegram Mini App для московских велосообществ. Организаторы создают групповые заезды, участники находят ближайшие старты, смотрят карту, записываются, открывают клубы и делятся заездом в Telegram.

Это не Strava и не трекер тренировок. Главный сценарий: “где сегодня можно покататься и кто едет?”.

## Что внутри

- Next.js App Router, TypeScript, Tailwind CSS.
- Supabase PostgreSQL для пользователей, клубов, заездов, регистраций и POI на карте.
- API routes для создания заездов, регистрации и Telegram auth.
- Leaflet + OpenStreetMap tiles, без платных API.
- Telegram Mini App WebApp API helper.
- Серверная проверка Telegram `initData` через `TELEGRAM_BOT_TOKEN`.
- Демо-режим без Supabase env: приложение открывается в браузере с живыми seed-данными.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Без `.env.local` приложение работает в демо-режиме: данные живут в памяти процесса Next.js. После перезапуска dev-сервера демо-созданные заезды сбрасываются.

## Environment variables

Создайте `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TELEGRAM_BOT_TOKEN=123456:bot-token-from-botfather
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Для локального демо все поля можно оставить пустыми. Для Supabase и Telegram auth нужны реальные значения.

Важно: `SUPABASE_SERVICE_ROLE_KEY` и `TELEGRAM_BOT_TOKEN` должны быть только на сервере. Не добавляйте их как `NEXT_PUBLIC_*`.

## Supabase: создать проект

1. Создайте новый проект в Supabase.
2. Откройте `Project Settings → API`.
3. Скопируйте `Project URL` в `NEXT_PUBLIC_SUPABASE_URL`.
4. Скопируйте `anon public` key в `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Скопируйте `service_role` key в `SUPABASE_SERVICE_ROLE_KEY`.

## Supabase: миграция

В SQL Editor выполните файл:

```text
supabase/migrations/0001_initial_schema.sql
```

Миграция создает таблицы:

- `users`
- `clubs`
- `rides`
- `ride_registrations`
- `map_points`

Также включены RLS и базовые read-политики. Записи создаются через серверные API routes с service role key. Для продакшена лучше добавить более строгую модель прав организаторов и аудит действий.

## Supabase: seed demo data

После миграции выполните:

```text
supabase/seed.sql
```

Seed создает:

- 5 демо-клубов.
- 12 заездов на сегодня, завтра и ближайшие дни.
- 10 точек велоинфраструктуры / POI.
- демо-пользователя и несколько регистраций.

## Telegram bot через BotFather

1. Откройте [@BotFather](https://t.me/BotFather).
2. Выполните `/newbot`.
3. Укажите имя, например `Катнуть`.
4. Укажите username, например `katnut_moscow_bot`.
5. Скопируйте bot token в `TELEGRAM_BOT_TOKEN`.
6. Выполните `/setmenubutton`.
7. Выберите своего бота.
8. Укажите URL Mini App:
   - локально через HTTPS tunnel, например `https://your-ngrok-url.ngrok.app`;
   - на проде URL Vercel, например `https://katnut.vercel.app`.
9. Укажите название кнопки, например `Открыть Катнуть`.

Для локальной проверки Telegram требует HTTPS. Удобный вариант:

```bash
npm run dev
ngrok http 3000
```

Затем поставьте HTTPS URL из ngrok в BotFather и в `NEXT_PUBLIC_APP_URL`.

## Telegram Mini App integration

В `app/layout.tsx` подключен официальный скрипт:

```text
https://telegram.org/js/telegram-web-app.js
```

Клиентский helper лежит в `lib/telegram/webapp.ts`:

- `getTelegramWebApp()`
- `getTelegramUser()`
- `isTelegram()`
- `hapticFeedback()`
- `expandApp()`
- `readyApp()`

На старте `components/AppBootstrap.tsx` вызывает `ready()`, `expand()`, применяет Telegram theme colors и отправляет `initData` в `/api/auth/telegram`.

Сервер не доверяет `initDataUnsafe`. API route `/api/auth/telegram` проверяет подпись `initData` через `TELEGRAM_BOT_TOKEN`, затем создает или обновляет пользователя в Supabase.

## Deploy на Vercel

1. Залейте проект в GitHub.
2. Создайте Vercel project из репозитория.
3. Укажите env variables:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

4. Deploy.
5. В BotFather укажите Vercel URL как Mini App URL.

## Основные маршруты

- `/` — discovery и фильтры.
- `/map` — карта стартов и POI.
- `/create` — создание заезда.
- `/rides/[id]` — детали и регистрация.
- `/clubs` — список клубов.
- `/clubs/[slug]` — страница клуба.
- `/profile` — профиль и велопредпочтения.

## API

- `POST /api/auth/telegram` — проверяет Telegram `initData`, создает/обновляет пользователя.
- `GET /api/rides` — список заездов.
- `POST /api/rides` — создать заезд.
- `POST /api/registrations` — записаться, выбрать “возможно” или отменить участие.
- `PATCH /api/users/[id]` — обновить базовые предпочтения.

## Текущие ограничения

- Нет ролей организаторов: любой пользователь с доступом к форме может создать заезд.
- Нет модерации и жалоб.
- Нет полноценной авторизации Supabase Auth; Telegram identity проходит через серверный API.
- Профиль в браузерном демо-режиме использует демо-пользователя.
- Карта использует OpenStreetMap tiles напрямую; для большой нагрузки нужен свой tile policy-aware подход.
- Нет push-уведомлений и напоминаний о старте.
- Нет редактирования и отмены уже созданного заезда.

## Следующие продуктовые шаги

1. Роли клубов: owner, organizer, moderator.
2. Редактирование / отмена заезда и уведомление записавшихся.
3. Модерация публичных клубов и инвайты организаторов.
4. Поиск по району, метро и “старт рядом со мной”.
5. Сохраненные фильтры и персональные рекомендации по уровню/темпу.
6. Telegram share deep links и UTM для клубов.
7. Production-grade RLS с user mapping и signed server actions.
