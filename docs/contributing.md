# Документация для разработчиков

Гайд для тех, кто хочет собрать расширение из исходников, развернуть локальную среду разработки или внести изменения в код.

## Стек

- **Manifest V3** Chrome content script
- **React 19** + **TypeScript 5.5**
- **TanStack Query v5** (server state)
- **Radix UI** (Dialog, Popover, Checkbox)
- **Vite 5** + **@crxjs/vite-plugin** (сборка)
- **pnpm** (рекомендуется) или npm

## Требования

- Node.js ≥ 18
- pnpm ≥ 8 (`npm i -g pnpm`)
- Браузер на базе Chromium (Chrome / Edge / Brave / …)

## Установка

```bash
git clone https://github.com/Narimannmn/egkn-filters.git
cd map
pnpm install
```

## Сборка

```bash
pnpm build
```

Финальные артефакты складываются в `dist/`. Эту папку и нужно загружать через **Загрузить распакованное** на `chrome://extensions` (см. [setup.md](./setup.md)).

`pnpm build` запускает `tsc --noEmit && vite build` — сначала проверяет типы, потом собирает.

## Локальная разработка

```bash
pnpm dev
```

Vite поднимет dev-сервер с HMR. После первого запуска `dist/` (или `dev-dist/`) можно загрузить как распакованное расширение — изменения подхватываются автоматически. При изменении `manifest.json` или background-логики потребуется перезагрузить расширение в `chrome://extensions`.

Для отладки удобно использовать DevTools страницы `map.gov4c.kz/egkn/*`:

- **Console** — все `console.log` content-script.
- **Elements** → найдите `<div id="egkn-filter-root">` с прикреплённым Shadow Root. Стили расширения изолированы внутри shadow.
- **Network** — фильтр по `gov4c.kz` покажет запросы, которые делает расширение.

## Структура проекта

```
src/
├── content/
│   ├── index.tsx           # точка входа content-script: монтирует Shadow DOM + React
│   └── App.tsx             # корневой компонент диалога
├── components/
│   ├── Fab.tsx             # плавающая кнопка
│   ├── FilterDialog.tsx    # Radix Dialog обёртка
│   ├── ErrorBoundary.tsx
│   ├── RegionDistrictSelect.tsx   # каскадный селектор область→район
│   ├── LayerTree.tsx       # выбор группы и слоя
│   ├── ValueMultiSelect.tsx       # обобщённый Popover-мультиселект
│   ├── PropertyFiltersPanel.tsx   # фильтры по right_type / land_status
│   ├── ResultsList.tsx     # карточки + пагинация
│   ├── LoadStatus.tsx      # «загружено N из M»
│   └── CopyButton.tsx
├── hooks/
│   ├── useLayersMeta.ts            # one-shot suspense-запрос справочника слоёв
│   ├── useRegions.ts               # справочник областей/районов
│   ├── useActiveDistrict.ts        # POST cabinet/login → текущий район
│   ├── useDistrictSelection.ts     # state + PUT /map/district
│   ├── useLayerSelection.ts        # выбор слоя + подслоёв (статусов из meta)
│   ├── usePropertyFilters.ts       # выбор фильтров по property-полям
│   ├── useLayerPages.ts            # стриминговая загрузка всех страниц волнами
│   ├── useSublayerFilter.ts        # фильтр по статусам (sublayers)
│   └── useStatusCounts.ts          # счётчики по статусу
├── lib/
│   ├── api.ts              # REST-клиент /rest/map/layer (постраничная загрузка)
│   ├── layersMeta.ts       # /rest/map/layers — группы + подслои
│   ├── districtsMeta.ts    # /rest/map/districts, cabinet/login, PUT /map/district
│   ├── layerAdapter.ts     # схема полей карточки по имени слоя (reqland, free, …)
│   ├── sublayerFilter.ts   # чистая фильтрация по подслоям
│   ├── propertyFilter.ts   # фильтр по property-полям + collectUniqueValues
│   ├── statusCounts.ts     # подсчёт элементов по статусу
│   ├── queries.ts          # suspenseQuery() хелпер
│   ├── queryClient.ts      # настроенный QueryClient
│   ├── errors.ts           # getErrorMessage(unknown)
│   └── portalContainer.tsx # Shadow-aware Radix portal target
├── types/
│   └── api.ts              # типы ответов ЕГКН
└── styles/
    └── *.css               # разделено по компонентам, собирается через @import
```

## Архитектурные решения

**Shadow DOM.** Весь UI монтируется внутрь Shadow Root, чтобы стили хост-сайта не влияли на расширение и наоборот. CSS склеивается Vite через `@import` и инжектится одной строкой.

**Suspense + ErrorBoundary.** Состояния загрузки/ошибки обрабатываются декларативно. Внутри `App.tsx` корневой Suspense + ErrorBoundary оборачивают всё содержимое диалога, а `useSuspenseQuery` в хуках мета-запросов автоматически останавливает рендер до получения данных.

**Кэш TanStack Query.** Настроен с `staleTime: Infinity` и `gcTime: Infinity` ([lib/queryClient.ts](../src/lib/queryClient.ts)) — справочники и страницы слоя кэшируются на время жизни вкладки. Повторное открытие района не дёргает сеть.

**Стриминговая загрузка слоя.** [useLayerPages.ts](../src/hooks/useLayerPages.ts) сначала делает lead-запрос (`pageNum=1`), узнаёт `count`, затем запускает остальные страницы волнами по 20 параллельных запросов через `useQueries` + флаг `enabled`. Это балансирует скорость и нагрузку на сервер. Для районов с >2000 участков `pageSize` автоматически переключается с 10 на 50.

**Адаптеры слоёв.** Разные слои ЕГКН (`reqland`, `free`, …) имеют разные имена полей. [layerAdapter.ts](../src/lib/layerAdapter.ts) даёт единый интерфейс (`getStatus`, `getRight`, `getAddress`, `getRows`, `getBadges`), а конкретный адаптер выбирается по имени слоя. Чтобы добавить поддержку нового слоя — допишите адаптер и зарегистрируйте его в `ADAPTERS`.

**Двухуровневая фильтрация.** [sublayerFilter](../src/lib/sublayerFilter.ts) фильтрует по справочнику статусов из meta-эндпоинта (sublayers), а [propertyFilter](../src/lib/propertyFilter.ts) фильтрует по уникальным значениям property-полей (`right_type_name_ru`, `land_status_name_ru`). Они композируются через AND в [App.tsx](../src/content/App.tsx).

## Используемые эндпоинты ЕГКН

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/egkn/rest/map/layers?lang=ru` | Справочник групп/слоёв/подслоёв |
| `GET` | `/egkn/rest/map/districts?lang=ru` | Справочник областей и районов |
| `POST` | `/egkn/rest/cabinet/login` | Текущая сессия пользователя (активный район) |
| `PUT` | `/egkn/rest/map/district?code=<code>` | Сменить активный район |
| `GET` | `/egkn/rest/map/layer?name=<layer>&pageNum=<n>&pageSize=<s>&lang=ru&readySite=false` | Постраничный список участков |

Все запросы идут с `credentials: same-origin` — расширение работает в сессии пользователя на портале ЕГКН и ничего не отправляет наружу.

## Как добавить поддержку нового слоя

1. Откройте DevTools на `map.gov4c.kz/egkn/*`, посмотрите ответ `/rest/map/layer?name=<новый-слой>` и определите имена полей (адрес, статус, площадь и т.д.).
2. При необходимости расширьте [types/api.ts](../src/types/api.ts).
3. В [lib/layerAdapter.ts](../src/lib/layerAdapter.ts) добавьте новый объект-адаптер по образцу `freeAdapter` и зарегистрируйте его в `ADAPTERS` под именем слоя.
4. Проверьте `pnpm build` и руками в браузере.

## Как добавить новый фильтр по property-полю

1. В [lib/layerAdapter.ts](../src/lib/layerAdapter.ts) добавьте геттер для нового поля (например, `getCategory`).
2. Расширьте [lib/propertyFilter.ts](../src/lib/propertyFilter.ts): добавьте поле в `PropertyFilters` и условие в `filterByProperties`.
3. Расширьте [hooks/usePropertyFilters.ts](../src/hooks/usePropertyFilters.ts): добавьте новый `Set<string>` и его toggle/clear.
4. В [components/PropertyFiltersPanel.tsx](../src/components/PropertyFiltersPanel.tsx) добавьте третий `ValueMultiSelect` с соответствующими `collectUniqueValues` и обработчиками.

## Коммиты и PR

Перед коммитом убедитесь, что:

- `pnpm build` проходит без ошибок и предупреждений типов.
- Расширение проверено вручную на реальном сайте (см. [setup.md](./setup.md)).
- Изменения сфокусированы на одной задаче. Большие рефакторинги — отдельным PR.

Стиль кода соответствует существующему: без лишних комментариев, без избыточных обёрток, без backwards-compat шимов.

## Лицензия

См. файл `LICENSE` в корне репозитория.
