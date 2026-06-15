# Интеграция мини-аппа с бэкендом

Мини-апп умеет работать в двух режимах:
- **Демо** (`config.js` → `apiBase: ""`) — данные в localStorage. Так работает сейчас.
- **Боевой** (`apiBase: "https://<бэкенд>"`) — методы `window.WL_API` ходят на API
  (`server/src/api.js`). Авторизация — через Telegram `initData` (заголовок `X-Init-Data`).

`api-client.js` уже подключён в `index.html` и готов к использованию.

## Как включить
1. Подними бэкенд (`server/`, см. `BACKEND.md`).
2. В `config.js` укажи `apiBase` = URL бэкенда.
3. Готово: `WL_API.enabled()` станет `true`.

## Соответствие операций фронта и API
| Действие в аппе | Метод клиента | Эндпоинт |
|---|---|---|
| Кто я / роль / привязка | `WL_API.me()` | POST /api/me |
| Открыть розыгрыш по коду (deep-link) | `WL_API.giveaway(code)` | GET /api/giveaway/:code |
| Участвовать (авторизация + проверка) | `WL_API.participate({code,login,password})` | POST /api/participate |
| Мои участия и выигрыши | `WL_API.mine()` | POST /api/mine |
| Список розыгрышей (админ) | `WL_API.adminList()` | GET /api/admin/giveaways |
| Создать розыгрыш | `WL_API.adminCreate(draft)` | POST /api/admin/giveaways |
| Пауза/возобновить/завершить | `WL_API.adminStatus(id,status)` | PATCH …/status |
| Аналитика | `WL_API.analytics(id)` | GET /api/admin/analytics/:id |
| Подвести итоги | `WL_API.draw(id)` | POST /api/admin/draw/:id |
| Выгрузка в Sheets | `WL_API.exportSheet(id)` | POST /api/admin/export/:id |
| Команда (супер) | `WL_API.team({action,...})` | POST /api/admin/team |

## Финальная привязка (делаем против живого бэка)
В `app.v5.js` источники данных сейчас синхронные (localStorage): `GA()`, `MY()`,
`getGA()`, `setGA()`, `link()`, роль, участие. План перевода (по одному, со сверкой
реальных ответов API):
1. **boot-гидрация**: при `WL_API.enabled()` на старте тянем `me()` + `mine()` (и
   `adminList()` для админа), кладём в кэш (localStorage) → дальше рендер как сейчас.
2. **deep-link**: открытие розыгрыша по коду — через `giveaway(code)`.
3. **participate**: вместо локальной заглушки — `participate(...)`, статусы условий с бэка.
4. **admin**: `adminCreate / adminStatus / draw / exportSheet / team` вместо локальных.
5. После каждого мутирующего вызова — обновляем кэш и перерисовываем.

Привязку делаем поэтапно с живым бэкендом, чтобы сверить формы ответов
(id vs code, поля участника и т.д.) — это надёжнее, чем угадывать заранее.
