# Timezone correctness across booking system

## Problem

Аудит показал, что tz-модель («храним UTC, интерпретируем HH:MM в tz шаблона расписания») протекает на четырёх уровнях. Симптомы у пользователя: сохраняешь расписание «08:00–18:00 Kyiv», по факту оно сохраняется как 08:00–18:00 UTC; клиент бронирует слот — он не блокируется; после DST или при смене tz браузера карточки броней смещаются; пограничные дни недели ломаются при несовпадении tz сервера и шаблона.

Часть уже починена (коммиты `55cf737`, `c787ef2`, `c787ef2`): `getNowMin` теперь учитывает запрошенную дату, `createBooking`/`rescheduleBookingById` парсят `startAt` в tz шаблона. Оставшиеся проблемы — этот спек.

## Goal

Одна канонич­ная модель:

- **Schedule template** владеет tz. Хранит IANA-строку (например, `Europe/Kyiv`). Все `HH:MM` в `weeklyHours` и override-слотах интерпретируются в ней.
- **UTC — единственное хранимое время для событий** (`startAt`, `endAt`).
- **Tz клиента** никогда не диктует бизнес-логику. Клиент может быть в Берлине и смотреть расписание Kyiv-специалиста — слот «08:00» остаётся 08:00 Kyiv.
- **Поле `booking.timezone`** — только для отображения в письмах/telegram приглашённому, не для вычислений.
- **Server tz не влияет ни на что**. Код не должен читать `.getDate()`/`.getDay()`/`.setHours()` без явно указанной tz.

## Scope

Спек покрывает backend (`BackendTemplate`) и frontend (`Slotix-fronted`). Разбит на 4 блока:

1. Schedule save path (tz попадает в БД корректно).
2. Slot computation (движок работает в tz шаблона, независимо от tz сервера).
3. Booking fetch/display (окна дат и карточки в tz шаблона).
4. Notifications / вторичные места.

Не покрывает: cron-воркер для reminder (отсутствует — отдельная задача), миграцию уже «битых» записей в БД.

## Design

### Block 1 — Schedule save path

**B1.1** `src/services/scheduleServices.js:63` `rotateTemplate`: fallback `timezone || "UTC"` → `timezone || DEFAULT_TIMEZONE`. Если `timezone` — пустая строка — считать невалидной и возвращать `{ error: "timezone_required" }`.

**B1.2** Валидация IANA tz на уровне контроллера перед вызовом `rotateTemplate`: `Intl.supportedValuesOf('timeZone').includes(tz)`. Невалидная строка — 400. Расширяется и на `createDefaultSchedule` (не принимает tz снаружи, валидация на константе DEFAULT_TIMEZONE на уровне unit-test).

**B1.3** Frontend `components/staff-schedule/ScheduleViewTab.tsx` при сохранении:

- Отправляет `timezone` в payload. Источник: текущее `template.timezone` если уже есть; иначе — `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- UI-элемент: compact-переключатель в шапке таба («Часовой пояс: Europe/Kyiv — змінити»). Изменение tz открывает комбобокс со списком IANA tz (react-select + static list из `Intl.supportedValuesOf('timeZone')`).
- При первом открытии редактора без saved-template показывает текущую браузерную tz с явной подсказкой «Время указано в: Europe/Kyiv (ваш браузер). Смените, если вы в другой тайм-зоне.»

### Block 2 — Slot computation

**B2.1** `src/services/slotServices.js:55-66` `getDateRange`: парсить `YYYY-MM-DD` как строку, не через `new Date(...).getFullYear()`. Использовать `Intl.DateTimeFormat('en-CA', {timeZone}).formatToParts` или ручной парсинг (`year, month, day` из split). Далее собирать boundary через Date.UTC и корректно смещать на tz-offset шаблона.

**B2.2** `src/services/slotServices.js:84-85` `dayOfWeek`: убрать `new Date(date).getDay()`. Вычислять weekday детерминированно для пары (`YYYY-MM-DD`, `timezone`):

```
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone })
  .format(new Date(`${date}T12:00:00Z`)).toLowerCase()
```

(берём 12:00 UTC чтобы уйти от полуночных edge-case для любых tz от -12 до +14).

**B2.3** `src/services/slotServices.js:17-22` `toBookingSlot` + `findByStaffAndDate`: для броней через полночь (startAt в день X, endAt в день X+1) добавить второй виртуальный блок в сетке следующего дня. Два варианта:

- a) Расширить `findByStaffAndDate` чтобы возвращала брони чей `[startAt, endAt]` пересекается с `[dateStart, dateEnd]`, а не только `startAt` внутри окна.
- b) В `toBookingSlot` обрезать часть брони которая попадает в запрошенный день.

Выбираем (a) как проще: `endAt > dateStart AND startAt < dateEnd`.

Дополнительно в `toBookingSlot` для брони, начавшейся в предыдущие сутки: `startMin = 0`, `duration = (endAt - dateStart) / 60000`. Для брони, закончившейся в следующие: стандартный `startMin`, `duration = (dateEnd - startAt) / 60000`.

### Block 3 — Booking fetch/display

**B3.1** `src/controllers/bookingController.js:78-84` `handleGetBookingsByStaff`: вместо `new Date(dateFrom) + setHours(23,59,59)` — принять query-параметр `timezone` (обязательный) и парсить boundaries как wall-clock в этой tz (используя `parseWallClockToUtc`). На бэке — валидация IANA. Фронт всегда шлёт tz шаблона который он рендерит.

**B3.2** Frontend `lib/calendar/hooks/useBookingActions.ts` и `useOrgSchedules.ts` — при запросе броней шлют `timezone` = `schedule.timezone` из активного template (не `Intl.DateTimeFormat().resolvedOptions().timeZone`).

**B3.3** Frontend `lib/booking-utils.ts:11-26` `timeToMinFromISO(iso, timezone)` — на вход получать **tz шаблона** (а не `booking.timezone` клиента). Переход: `toCalendarBlock` и все caller'ы передают `schedule.timezone` вместо `booking.timezone`.

**B3.4** Frontend `lib/calendar/utils.ts:119,146,170,237` `new Date(dateStr).getDay()` заменить на helper `getDayOfWeekInTz(dateStr, timezone)` по формуле B2.2.

**B3.5** Frontend `lib/calendar/CalendarCore.tsx:509` `new Date(dayDate + 'T00:00:00').getDay()` — та же замена.

**B3.6** Frontend `components/booking/StaffSlotCard.tsx:32` `today.setHours(0,0,0,0)` — брать «сегодня» в tz расписания: `Intl.DateTimeFormat('en-CA', {timeZone: schedule.timezone}).format(new Date())`.

**B3.7** `app/[locale]/book/[staffSlug]/BookingPage.tsx:72` и `components/booking/OrgCalendarPage.tsx:56` — убрать `DEFAULT_SCHEDULE.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone`. Если template не загружен — показывать спиннер/пустое состояние, не рендерить сетку с браузерной tz. Это защищает от сохранения мусорной tz через rotate.

### Block 4 — Notifications / misc

**B4.1** `src/services/telegramMessageFormatter.js:15` fallback `timezone || "Europe/Kyiv"` → получать tz из template ведущего хоста (`booking.hosts[0].userId` → active template → tz). Если booking.timezone есть и валиден — использовать для отображения invitee. Для host-сообщений — всегда template tz.

**B4.2** `src/services/notificationServices.js:148` — вместо `org.settings.defaultTimezone` брать tz активного template lead-хоста.

**B4.3** `src/services/bookingServices.js:75` — валидировать invitee `timezone` через `Intl.supportedValuesOf('timeZone')`. Невалидный → игнорировать (сохранить null или template tz).

**B4.4** `src/shared/utils/timezone.js:2-6` `getTimezoneOffsetMin` — заменить реализацию на `Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(date)` и вытащить offset из части `timeZoneName` («GMT+3»). Единый helper, без хрупкого parse.

**B4.5** `src/models/ScheduleOverride.js` — добавить js-doc комментарий «Override slots интерпретируются в tz текущего шаблона. Если tz шаблона меняется — интерпретация меняется». Поле `timezone` на override не вводим.

## Non-goals

- Миграция «битых» записей (template с tz=UTC, броней с неверным startAt) — отдельно.
- Cron/reminder worker — отсутствует, отдельно.
- Изменение семантики reminder_24h (оставляем "24h elapsed UTC", не "same wall-clock").
- Мультиязычные названия weekdays на бэке — всегда `en-US short`.
- Поддержка tz на уровне отдельного override — всегда наследует от template.

## Dependencies between blocks

```
B1.3 (frontend sends tz)  ←  B1.1+B1.2 (backend accepts/validates)
B2.2 (backend weekday)    ←  независим
B2.1 (backend getDateRange) ← независим
B2.3 (cross-midnight)     ←  независим
B3.1 (bookings API tz)    ←  B3.2 (frontend sends tz)
B3.3-B3.6 (frontend rendering) ← независимы
B3.7 (frontend default removal) ← B1.3 должен быть готов (иначе пустой template без tz ломает UX)
B4.*  ← можно после B1-B3
```

## Testing

- **Backend unit**: `slotServices` — тесты для `getDateRange`, `dayOfWeek` с несовпадающей server/template tz (mock `process.env.TZ`).
- **Backend integration**: создание брони в tz клиента ≠ tz шаблона → слот заблокирован после. Уже существующий `billing.test.js` паттерн — новый файл `booking.test.js` с фокусом на tz.
- **Frontend**: compile + manual — загружаешь страницу `/my-schedule`, меняешь tz, сохраняешь, проверяешь что booking 08:00 в Kyiv-tz шаблоне блокирует слот у клиента в любой tz.

## Files touched (summary)

**Backend:**
- `src/services/scheduleServices.js`
- `src/controllers/scheduleController.js` (для валидации tz)
- `src/services/slotServices.js`
- `src/repository/bookingRepository.js` (`findByStaffAndDate` с overlap query)
- `src/controllers/bookingController.js`
- `src/services/telegramMessageFormatter.js`
- `src/services/notificationServices.js`
- `src/services/bookingServices.js` (валидация invitee tz)
- `src/shared/utils/timezone.js`
- `src/models/ScheduleOverride.js` (jsdoc)

**Frontend:**
- `components/staff-schedule/ScheduleViewTab.tsx` (+ новый компонент `TimezoneSelector`)
- `lib/calendar/utils.ts`
- `lib/calendar/CalendarCore.tsx`
- `lib/calendar/hooks/useBookingActions.ts`
- `lib/calendar/hooks/useOrgSchedules.ts`
- `lib/booking-utils.ts`
- `components/booking/StaffSlotCard.tsx`
- `app/[locale]/book/[staffSlug]/BookingPage.tsx`
- `components/booking/OrgCalendarPage.tsx`
