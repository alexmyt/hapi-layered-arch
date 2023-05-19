# Слоеная архитектура с сервером Hapi
Попытка реализации принципов SOLID и слоеной (Layered) архитектуры на примере серверной части приложения.
[Мотивация создания приложения](motivation.md).

## Основные используемые компоненты:
- Hapi
- TypeORM
- Inversify

## Диаграмма

![Hapi layered architecture](https://github.com/alexmyt/hapi-layered-arch/assets/37371343/be72aad9-95ab-477e-b6c1-f800e9c0b042)

## Структура проекта
`src/main.ts` - точка входа в приложение. Отвечает за инициализацию IoC-контейнера запуск приложения.

`src/ioc/` - конфигурация IoC-контейнера.

`src/config/` - сервис конфигурации приложения. Отвечает за чтение .env-файла и получение конфигурационных переменных.

`src/errors/api-error.ts` - обработчик ошибок API. Предназначен для унификации ответов API с сообщениями об ошибках.

`src/database/` - сервис БД.

`src/app.ts` - приложение сервиса. Выполняет следующие действия:
  - подключаются модули логирования и ORM;
  - регистрируются плагины Hapi уровня приложения;
  - подключаются модули приложения, в том числе:
    - регистрируются плагины Hapi уровня модуля. После регистрации плагинов вызывается функция модуля `onRegisterPlugins(app: Hapi.Server)` (при наличии);
    - подключаются маршруты модуля (для контроллеров);
  - запуск web-сервера.

`tests/` - End-to-End тесты. Тесты выполняются с собственной конфигурацией Jest, в которую включен глобальный модуль инициализации `<rootDir>/setup/setup.ts`

### Модули приложения
Модуль - часть логики приложения для работы с определенной сущностью бизнес-домена или с элементом инфраструктуры. Могут быть сервисами или контроллерами (контроллер - это сервис, принимающий запросы к API). Состоят из:
- `*.controller.ts` - контроллер, отвечающий за обработку запросов клиентов к API. Передает нагрузку запроса в сервис и возвращает ответ клиенту;
  - `*.routes.ts` - маршруты запросов для контроллера, включающие настройки валидации, аутентификации, авторизации и другого. Маршруты могут быть определены в непосредственно в контроллере.
  - `*.schema.ts` - валидатор запросов к API (в проекте используется Joi);
  - `dto/*.*.dto.ts` - объекты передачи данных в запросах;
- `*.service.ts` - основная логика сервиса;
- `*.repository.ts` - логика сервиса, отвечающая за работу с базой данных;
- `*.entity.ts` - класс, содержащий представление сущности бизнес-домена.

## Конфигурация
Конфигурационные переменные задаются через переменные окружения или через файлы окружения:
- `.env` - используется по умолчанию и для окружения _production_
- `.env.{NODE_ENV}` - для окружения отличного от _production_
Окружение по умолчанию - _development_

## Команды npm
- `npm start` - запуск приложения в продуктовом режиме
- `npm run dev` - запуск в режиме разработчика
- `npm t` - запуск unit тестов
- `npm run test:e2e`- запуск end-to-end тестов
- `npm run typeorm`- запуск команд TypeOrm
