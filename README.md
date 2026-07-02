# Катнуть

`Катнуть` — MVP Telegram Mini App для московских велосообществ. Организаторы создают групповые заезды, участники находят ближайшие старты, смотрят карту, записываются, открывают клубы и делятся заездом в Telegram.

Это не Strava и не трекер тренировок. Главный сценарий: “где сегодня можно покататься и кто едет?”.

## Что внутри

- Next.js App Router, TypeScript, Tailwind CSS.
- Supabase PostgreSQL для пользователей, ролей, клубов, заявок, заездов, маршрутов, регистраций, уведомлений, жалоб и POI на карте.
- API routes для создания/редактирования/отмены заездов, заявок на клубы, админки, маршрутов, регистрации и Telegram auth.
- Leaflet + настраиваемый tile provider. В демо используется легальная светлая OSM-подложка с атрибуцией, production можно перевести на Mapbox/MapTiler/свой сервер через env.
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
NEXT_PUBLIC_MAP_PROVIDER=demo_osm
NEXT_PUBLIC_MAP_TILE_URL=
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_MAP_ATTRIBUTION=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_MAPTILER_KEY=
NEXT_PUBLIC_MAP_MIN_ZOOM=9
NEXT_PUBLIC_MAP_MAX_ZOOM=19
NEXT_PUBLIC_MAP_MAX_NATIVE_ZOOM=18
ROUTING_PROVIDER=
ROUTING_API_KEY=
ROUTING_BASE_URL=
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

В SQL Editor выполните миграции по порядку:

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_personal_rides_and_club_roles.sql
supabase/migrations/0003_roles_clubs_routes_admin.sql
```

Миграции создают и расширяют таблицы:

- `users`
- `clubs`
- `club_memberships`
- `club_applications`
- `rides`
- `ride_registrations`
- `routes`
- `route_waypoints`
- `map_points`
- `moderation_reports`
- `notifications`
- `audit_logs`

Также включены RLS и базовые read-политики. Записи создаются через серверные API routes с service role key. Проверки ролей выполняются на backend/API уровне.

## Supabase: seed demo data

После миграции выполните:

```text
supabase/seed.sql
```

Seed создает:

- 5 демо-клубов.
- 12 заездов на сегодня, завтра и ближайшие дни.
- 3 заезда с сохраненными маршрутами.
- 2 pending заявки на создание клуба.
- 10 точек велоинфраструктуры / POI.
- demo `super_admin`, verified organizers, club owners/admins/organizers и несколько регистраций.

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
- `/rides/[id]/edit` — редактирование и отмена заезда.
- `/clubs` — список клубов.
- `/clubs/apply` — заявка на создание клуба.
- `/clubs/[slug]` — страница клуба.
- `/clubs/[slug]/manage` — управление клубом.
- `/profile` — профиль и велопредпочтения.
- `/admin` — панель super_admin.

## API

- `POST /api/auth/telegram` — проверяет Telegram `initData`, создает/обновляет пользователя.
- `GET /api/me`, `PATCH /api/me/preferences` — профиль и предпочтения.
- `GET /api/rides` — список заездов.
- `POST /api/rides` — создать заезд.
- `GET/PATCH /api/rides/[id]`, `POST /api/rides/[id]/cancel`, `POST/DELETE /api/rides/[id]/register`.
- `POST /api/registrations` — записаться, выбрать “возможно” или отменить участие.
- `POST /api/club-applications`, `GET /api/club-applications/my`.
- `GET /api/admin/stats`, `/api/admin/users`, `/api/admin/clubs`, `/api/admin/rides`, `/api/admin/reports`, `/api/admin/club-applications`.
- `POST /api/routes/gpx`, `POST /api/routes/manual`, `GET/PATCH/DELETE /api/routes/[id]`.
- `GET /api/notifications`, `POST /api/notifications/[id]/read`.
- `PATCH /api/users/[id]` — обновить базовые предпочтения.

## Велокарта и данные

Страница `/map` построена на Leaflet и разделяет слои:

- городская подложка из настраиваемого tile provider;
- реальные OSM/Overpass GeoJSON-слои: велодорожки и А-полосы;
- старты заездов с кластеризацией на дальнем zoom;
- маршрут выбранного заезда отдельным янтарным слоем;
- route editor для GPX/manual/external route flow.

Реальные слои загружаются клиентом один раз через `fetch` из публичных файлов:

- `public/data/map/moscow/bike_lanes.geojson`
- `public/data/map/moscow/a_lanes.geojson`

Если файл отсутствует, пустой или не загрузился, слой становится недоступным в переключателе. Приложение не подставляет demo/fake линии вместо реальных данных.

Чтобы заменить данные на новую выгрузку Overpass, положите новые файлы с теми же именами в `public/data/map/moscow/`. Нормализация тегов находится в `lib/map/normalizeInfrastructure.ts`, стили слоев в `lib/map/mapStyles.ts`, правила zoom-детализации в `lib/map/zoomRules.ts`.

Карта читает env:

```bash
NEXT_PUBLIC_MAP_PROVIDER=demo_osm # demo_osm | maptiler | mapbox | custom
NEXT_PUBLIC_MAP_TILE_URL=
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_MAP_ATTRIBUTION=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_MAPTILER_KEY=
NEXT_PUBLIC_MAP_MIN_ZOOM=9
NEXT_PUBLIC_MAP_MAX_ZOOM=19
NEXT_PUBLIC_MAP_MAX_NATIVE_ZOOM=18
```

Для ручной проверки карты:

1. Откройте `/map`: должны быть видны светлая подложка, реальные велодорожки и кластеры/маркеры заездов.
2. Приближайте карту: до `z 10` видны только major велодорожки, на `z 11-12` добавляются medium и major А-полосы, на `z >= 15` видна максимальная детализация.
3. Нажмите “Слои”: включите/выключите велодорожки и А-полосы; обновите страницу, состояние должно сохраниться.
4. Нажмите маркер заезда: открывается bottom sheet, а маршрут заезда выделяется отдельно, если он есть.
5. На `/create` или `/rides/[id]/edit` проверьте GPX, ручной черновой маршрут и внешнюю ссылку. Невалидная геометрия не должна сохраняться.

## Текущие ограничения

- Админка и club manage сделаны как функциональный MVP, без сложных таблиц поиска/пагинации.
- Нет полноценной авторизации Supabase Auth; Telegram identity проходит через серверный API.
- Профиль в браузерном демо-режиме использует демо-пользователя.
- Push-уведомлений Telegram bot пока нет, есть внутренняя система notifications.
- Ручной маршрут строит прямую линию по точкам; routing/snapping готовится через `ROUTING_*` env, но провайдер не подключен.

## Демо-роли

Без Supabase env приложение стартует с in-memory seed:

- `00000000-0000-4000-8000-000000000001` — demo `super_admin`.
- `00000000-0000-4000-8000-000000000002` — verified organizer и club owner/organizer.
- `00000000-0000-4000-8000-000000000003` — verified organizer и club admin.
- `00000000-0000-4000-8000-000000000004` — rider и club owner одного демо-клуба.
- `00000000-0000-4000-8000-000000000005` — обычный rider без клубных ролей.

Для проверки другого пользователя в браузере можно поставить:

```js
localStorage.setItem("katnut_user_id", "00000000-0000-4000-8000-000000000005")
location.reload()
```

## Следующие продуктовые шаги

1. Роли клубов: owner, organizer, moderator.
2. Редактирование / отмена заезда и уведомление записавшихся.
3. Модерация публичных клубов и инвайты организаторов.
4. Поиск по району, метро и “старт рядом со мной”.
5. Сохраненные фильтры и персональные рекомендации по уровню/темпу.
6. Telegram share deep links и UTM для клубов.
7. Production-grade RLS с user mapping и signed server actions.
