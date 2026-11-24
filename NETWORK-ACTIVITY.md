# Сетевые соединения расширения C# для VS Code

Итоговая таблица сетевой активности установленного и работающего расширения `ms-dotnettools.csharp` (исходники версии 2.160.4). Сетевые вызовы самой сборки в таблицу не входят.

Таблица составлена 23 ноября 2026 года. Способ проверки указан в конце документа.

Столбец «Кто соединяется» показывает, чьим кодом открывается соединение: самим расширением, его зависимостью, бинарным компонентом внутри VSIX, VS Code или инструментом на машине пользователя.

## Таблица

| Кто соединяется | Соединение | Когда | Куда | Код расширения |
|---|---|---|---|---|
| **Само расширение** | | | | |
| Расширение | Телеметрия | В исходниках тега — при активации и далее на события, если телеметрия VS Code не выключена. В этом репозитории отключена, соединений нет | `mobile.events.data.microsoft.com` | [src/main.ts:42-52](src/main.ts) |
| Расширение | Загрузка `VSWebAssemblyBridge`, 4,5 МиБ | В исходниках тега — первая активация, всегда. В этом репозитории мост встроен в пакет, загрузки нет | `download.visualstudio.microsoft.com` | [src/main.ts:78](src/main.ts), [tasks/packaging/offlinePackagingTasks.ts:421-427](tasks/packaging/offlinePackagingTasks.ts) |
| Расширение | Загрузка отладчика, 53–77 МиБ | Первая активация, если его нет в VSIX (платформо-независимая сборка) | `download.visualstudio.microsoft.com` | [src/main.ts:71](src/main.ts) |
| Расширение | Загрузка RoslynCopilot, 47 КиБ | В исходниках тега — первая активация; установлен Dev Kit и `chat.disableAIFeatures=false`. В этом репозитории пакет не требуется, загрузки нет | `roslyn.blob.core.windows.net` | [src/main.ts](src/main.ts) |
| Расширение | Загрузка OmniSharp и Razor language server | Только режим OmniSharp (`dotnet.server.useOmnisharp=true`) | `roslynomnisharp.blob.core.windows.net`, `download.visualstudio.microsoft.com` | [src/main.ts:75-77](src/main.ts), [src/omnisharp/omnisharpManager.ts:56-72](src/omnisharp/omnisharpManager.ts) |
| **Зависимость .NET Install Tool** | | | | |
| .NET Install Tool | Загрузка .NET 10.0.5, с Dev Kit — ещё ASP.NET Core | Запуск сервера Roslyn, если `dotnet.findPath` ничего не нашёл; также отладка Blazor WASM | `builds.dotnet.microsoft.com` | [src/lsptoolshost/dotnetRuntime/dotnetRuntimeExtensionResolver.ts:76-191](src/lsptoolshost/dotnetRuntime/dotnetRuntimeExtensionResolver.ts), [src/razor/src/blazorDebug/blazorDebugConfigurationProvider.ts:511-547](src/razor/src/blazorDebug/blazorDebugConfigurationProvider.ts) |
| .NET Install Tool | Установка системных библиотек Linux | `dotnet.ensureDotnetDependencies`, только Linux | Не проверено | [src/lsptoolshost/dotnetRuntime/dotnetRuntimeExtensionResolver.ts:185-188](src/lsptoolshost/dotnetRuntime/dotnetRuntimeExtensionResolver.ts) |
| .NET Install Tool | Собственная телеметрия | Внутри зависимости | `westus2-0.in.applicationinsights.azure.com` | — |
| VS Code | Установка .NET Install Tool из Marketplace | При установке расширения; или по кнопке «Update and reload», если версия ниже 2.2.3 | Marketplace | [package.json:108](package.json), [src/checkDotNetRuntimeExtensionVersion.ts:25](src/checkDotNetRuntimeExtensionVersion.ts) |
| **Бинарные компоненты внутри VSIX** | | | | |
| Сервер Roslyn | Собственная телеметрия | Уровень расширение передаёт аргументом `--telemetryLevel`: `all`, `error` или `off`; в этом репозитории — всегда `off` | Не видно | [src/lsptoolshost/server/roslynLanguageServer.ts:711](src/lsptoolshost/server/roslynLanguageServer.ts) |
| Сервер Roslyn | Restore пакетов | Команды `dotnet.restore.project`, `dotnet.restore.all`; автоматически при `dotnet.projects.enableAutomaticRestore=true` | NuGet-источники проекта | [src/lsptoolshost/projectRestore/restore.ts:71-98](src/lsptoolshost/projectRestore/restore.ts) |
| Сервер Roslyn | Загрузка исходников по SourceLink | Переход к определению при `dotnet.navigation.navigateToSourceLinkAndEmbeddedSources=true` | Адреса SourceLink из сборок | Настройка только объявлена в `package.json` |
| Отладчик vsdbg | Загрузка символов | Отладка при `searchMicrosoftSymbolServer` или `searchNuGetOrgSymbolServer=true` (по умолчанию `false`) | `msdl.microsoft.com`, `symbols.nuget.org` | [src/shared/configurationProvider.ts:224-244](src/shared/configurationProvider.ts) |
| **Другие расширения, если установлены** | | | | |
| C# Dev Kit | Собственная активность | Если установлен | Не видно | [src/lsptoolshost/server/roslynLanguageServer.ts:274-278](src/lsptoolshost/server/roslynLanguageServer.ts) |
| Copilot, Copilot Chat | Собственная активность | Установлены Dev Kit и Copilot | Не видно | [src/lsptoolshost/copilot/contextProviders.ts:74-186](src/lsptoolshost/copilot/contextProviders.ts) |
| **VS Code и браузер** | | | | |
| VS Code | Загрузка JSON-схем | Открытие `appsettings*.json`, `omnisharp.json`, `global.json`, `launchSettings.json` | `json.schemastore.org` | [package.json:1832](package.json) |
| VS Code | Репортёр проблем | «Report Issue» в сообщении об ошибке | Не видно | [src/shared/reportIssue.ts:71-75](src/shared/reportIssue.ts) |
| Браузер | Открытие ссылок | По клику в уведомлениях, 8 мест | `aka.ms`, `dot.net`, `mono-project.com` | [src/coreclrDebug/activate.ts:233](src/coreclrDebug/activate.ts) и другие |
| Браузер | Отладка Blazor WebAssembly | F5 с типом `blazorwasm` | URL приложения из `launchSettings.json`, по умолчанию `https://localhost:5001` | [src/razor/src/blazorDebug/blazorDebugConfigurationProvider.ts:155-175](src/razor/src/blazorDebug/blazorDebugConfigurationProvider.ts) |
| **Инструменты на машине** | | | | |
| `dotnet` | `dotnet restore` | Только режим OmniSharp | NuGet-источники проекта | [src/omnisharp/features/commands.ts:208-242](src/omnisharp/features/commands.ts) |
| `dotnet` | `dotnet tool install --global` | «C#: Collect Logs» после подтверждения, если инструмента нет | nuget.org | [src/lsptoolshost/logging/loggingUtils.ts:203-264](src/lsptoolshost/logging/loggingUtils.ts) |
| `ssh`, `docker` | Команда `pipeProgram` из launch.json | Удалённое подключение отладчика | Хост из launch.json | [src/shared/processPicker.ts:219-316](src/shared/processPicker.ts) |

## Примечания

- **Телеметрия расширения.** Ключ лежит в `aiKey` манифеста ([package.json](package.json), строка 2062) и имеет формат ключа 1DS. Поэтому библиотека `@vscode/extension-telemetry@0.9.0`, вкомпилированная в расширение, отправляет события запросом `POST https://mobile.events.data.microsoft.com/OneCollector/1.0`. Отправитель создаётся, только когда VS Code сообщает, что включена телеметрия использования или ошибок. При `telemetry.telemetryLevel=off` соединений нет, и то же значение `off` расширение передаёт серверу Roslyn аргументом `--telemetryLevel`. Расширение вызывает только обычные методы отправки (`sendTelemetryEvent`, `sendTelemetryErrorEvent`) и это правило не обходит. В этом репозитории отправитель не создаётся: на его месте в `src/main.ts` стоит заглушка, которая отбрасывает все события и сообщает уровень `off`, поэтому тот же уровень уходит и серверу Roslyn. Библиотека `@vscode/extension-telemetry` в пакет не попадает. Ключ `aiKey` в манифесте остался, но его больше никто не читает: расширение его не использует, а текущий VS Code отправляет телеметрию отладчика только по полю `customTelemetryEndpoint`, которого в манифесте нет.
- **Размеры пакетов.** Прочитаны из заголовка `Content-Length` серверов Microsoft 23 ноября 2026 года. Это размеры сжатых zip-архивов.
- **Загрузка .NET Install Tool.** Адреса проверены по исходникам последнего релиза `Runtime-v2.3.3` на GitHub; само расширение C# требует версию не ниже 2.2.3. Другая версия зависимости может вести себя иначе. `dotnet.findPath` — только локальный поиск. `dotnet.acquire` работает в три шага: скачивает метаданные выпусков, скачивает скрипт `dotnet-install.sh`, затем скрипт качает архив runtime. Всё это — `builds.dotnet.microsoft.com`. При сбое установки зависимость делает DNS-запрос `www.microsoft.com`. Собственная телеметрия зависимости идёт на адрес из строки подключения в её манифесте.
- **Что осталось непроверенным.** Адрес скрипта установки для Windows (`dotnet-install.ps1` скачать не удалось), установщик системных библиотек Linux и поведение телеметрии самой зависимости. Собственные обращения сервера Roslyn, отладчика vsdbg, C# Dev Kit и Copilot по исходникам не видны: их подтвердит только анализ трафика готовой сборки.

## Как проверялось

- **Код расширения** — по исходникам этого репозитория: поиск сетевых примитивов, вызовов API VS Code, запускаемых процессов и адресов в манифесте.
- **Телеметрия** — по пакетам `@vscode/extension-telemetry@0.9.0` и его зависимостям в версиях из `package-lock.json`; контрольные суммы пакетов совпали.
- **.NET Install Tool** — по исходникам тега `Runtime-v2.3.3` репозитория `dotnet/vscode-dotnet-runtime`.
- **Отключение телеметрии в этом репозитории** — 24 ноября 2026 года: бандл из собранных пакетов сверен с прежним. Адрес `mobile.events.data.microsoft.com` и путь `OneCollector` из него исчезли, ключ `aiKey` больше не читается, заглушка на месте. Поведение VS Code с полем `aiKey` сверено с исходниками VS Code на ветке `main`. Запуск расширения в VS Code с этой правкой не проверялся.
- **Встроенный `VSWebAssemblyBridge` в этом репозитории** — 24 ноября 2026 года: пакеты распакованы, и код активации (`installRuntimeDependencies`) для каждого пакета на своей платформе не находит ничего, что нужно скачивать. В пакете без встроенного моста та же проверка показывала его загрузку. Запуск расширения в VS Code не проверялся.
- **Требование `RoslynCopilot` убрано в этом репозитории** — 24 ноября 2026 года: строки требования больше нет в бандле всех четырёх пакетов, код активации на распакованных пакетах не находит ничего, что нужно скачивать. Сценарий с установленным C# Dev Kit в VS Code не проверялся.
