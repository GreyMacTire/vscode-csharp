# Сборка расширения C# для VS Code на Ubuntu 22.04

Инструкция повторяет сборку вендора: его конвейер упаковывает VSIX на Ubuntu 22.04, amd64, и делает это теми же командами. Здесь только сборка: без подписи и без публикации в Marketplace.

Инструкция рассчитана на чистую систему Ubuntu 22.04 LTS и обычного пользователя с правами `sudo`. `sudo` нужен только в шагах 1–3. Все команды выполняются в bash.

## Что получится

Восемь пакетов `vsix/csharp-<платформа>-<версия>.vsix`: `win32-x64`, `win32-arm64`, `linux-x64`, `linux-arm64`, `alpine-x64`, `alpine-arm64`, `darwin-x64`, `darwin-arm64`. Рядом с каждым появится файл `.manifest`: он нужен только для подписи, его можно не забирать.

Пакеты выйдут неподписанными. Для установки вручную через «Install from VSIX» подпись не нужна. Готовое расширение требует VS Code 1.106 или новее.

Сборка ничего не выключает: все сетевые соединения, описанные в [NETWORK-ACTIVITY.md](NETWORK-ACTIVITY.md), в пакетах сохраняются.

## Что нужно заранее

| Инструмент | Версия | Как ставит вендор | Как ставит инструкция |
|---|---|---|---|
| Node.js | 24.x | Официальную сборку с nodejs.org ([azure-pipelines/install-node.yml](azure-pipelines/install-node.yml)) | Официальный архив с nodejs.org |
| .NET SDK | 10.0.400 | По [msbuild/global.json](msbuild/global.json) ([azure-pipelines/prereqs.yml](azure-pipelines/prereqs.yml)) | Официальный скрипт `dotnet-install.sh` |
| git | любой из Ubuntu 22.04 | Выгрузка с полной историей | Обычный `git clone` |

Компиляторы и `python` не нужны: все нативные модули ставятся готовыми сборками.

Закладывайте не меньше 5 ГиБ на диск. Это оценка по составу сборки, точный объём я не измерял.

## Шаг 1. Системные пакеты

```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates xz-utils unzip \
  libc6 libgcc-s1 libstdc++6 libicu70 libssl3 libgssapi-krb5-2
```

Последняя строка — библиотеки, которых требует среда .NET: ICU, OpenSSL и Kerberos она подгружает во время работы.

## Шаг 2. Node.js 24

```bash
NODE_VERSION=24.22.3
curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"
curl -fsSL -o SHASUMS256.txt "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"
grep " node-v${NODE_VERSION}-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c -
sudo tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 --no-same-owner
node --version && npm --version
```

Проверка контрольной суммы должна напечатать `node-v24.22.3-linux-x64.tar.xz: OK`.

`24.22.3` — новейший релиз линейки 24.x на 23 ноября 2026 года. Конвейер вендора берёт именно новейший релиз линейки. Чтобы сделать так же:

```bash
NODE_VERSION=$(curl -fsSL https://nodejs.org/dist/index.json 2>/dev/null | grep -m1 -oE '"v24\.[0-9]+\.[0-9]+"' | tr -d '"v')
```

## Шаг 3. .NET SDK 10.0.400

```bash
curl -fsSL -o dotnet-install.sh https://dot.net/v1/dotnet-install.sh
sudo bash dotnet-install.sh --version 10.0.400 --install-dir /usr/share/dotnet --no-path
sudo ln -sfn /usr/share/dotnet/dotnet /usr/bin/dotnet
dotnet --list-sdks
```

Последняя команда должна напечатать `10.0.400 [/usr/share/dotnet/sdk]`.

Версия взята из `msbuild/global.json`, где кроме неё задан `rollForward: latestMajor`, поэтому подошла бы и любая более новая. В репозитории Microsoft для Ubuntu 22.04 .NET 10 нет: на 23 ноября 2026 года там есть SDK только до 9.0. Поэтому ставится официальным скриптом, как это делает задача конвейера.

## Шаг 4. Исходники

```bash
git clone --branch v2.160.4 https://github.com/dotnet/vscode-csharp.git
cd vscode-csharp
```

Тег `v2.160.4` — это релиз от 18 сентября 2026 года, коммит `87fca8f19e80a439147d8bc139deaf32092deb3`. Исходники в каталоге `vscode-csharp-2.160.4` ему соответствуют: в манифесте `package.json` совпадают версии компонентов, зависимости, адреса загрузки и секция `contributes`. Остальные файлы с тегом я не сравнивал. Для своей копии клонируйте свой репозиторий на нужной ветке.

`git clone` оставит репозиторий в состоянии detached HEAD — это нормально.

Клонируйте именно git-ом и не обрезайте историю. Номер версии пакетов вычисляет Nerdbank.GitVersioning по числу коммитов от `version.json`, а не берёт его готовым ([tasks/packaging/offlinePackagingTasks.ts](tasks/packaging/offlinePackagingTasks.ts), строки 346–348). В конвейере вендора для этого сделана выгрузка с полной историей.

## Шаг 5. Зависимости

```bash
npm ci
```

Команда ставит npm-пакеты по `package-lock.json` и через hook `prepare` сама запускает `installDependencies`. Тот выполняет `dotnet restore` и раскладывает результат по каталогам: сервер Roslyn для текущей платформы в `.roslyn`, остальное в `.roslynDevKit`, `.xamlTools`, `.testDiscovery`.

Аутентификация не нужна: все пакеты, которые эта загрузка запрашивает напрямую, npm- и NuGet-источники из `.npmrc` и `NuGet.config` отдают анонимно.

Не задавайте `NODE_ENV=production` и не добавляйте `--omit=dev`: установочному скрипту нужны dev-зависимости, в частности `ts-node`.

## Шаг 6. Пакеты VSIX

```bash
npm run vsix:release:package
```

Команда обходит восемь платформ по очереди. Для каждой она скачивает архив отладчика, собирает код и вызывает `vsce package`. В выводе будет строка `SignType environment variable is not set, skipping JS signing.` — это ожидаемо, сборка идёт без подписи.

Полезные параметры, они передаются после `--`:

- `--prerelease` помечает пакет как предварительный. Вендор добавляет его для всех веток, кроме `release`.
- `-o <каталог>` переносит вывод из `vsix/` в другое место.

## Шаг 7. Проверка

```bash
ls -la vsix/
npm run test:artifacts
unzip -l vsix/csharp-linux-x64-*.vsix | grep -E "extension/\.(roslyn|debugger)/" | head -5
```

Вторая команда — та же, которой конвейер завершает сборку: она компилирует проект и проверяет, что каждый пакет не пуст и меньше 200 МБ ([test/lsptoolshost/artifactTests/vsix.test.ts](test/lsptoolshost/artifactTests/vsix.test.ts)). Третья показывает, что внутри пакета лежат сервер Roslyn и отладчик.

Дальше пакеты можно просто скопировать: каждый файл самодостаточен.

## Соответствие конвейеру вендора

| Шаг конвейера | Где описан | В инструкции |
|---|---|---|
| Выгрузка с полной историей | [azure-pipelines/build-vsix.yml](azure-pipelines/build-vsix.yml), строки 49–53 | Шаг 4 |
| Node.js 24.x | [azure-pipelines/install-node.yml](azure-pipelines/install-node.yml) | Шаг 2 |
| .NET SDK по `global.json` | [azure-pipelines/prereqs.yml](azure-pipelines/prereqs.yml), строки 18–21 | Шаг 3 |
| `npm ci` | там же, строка 42 | Шаг 5 |
| `npm run vsix:release:package` | `build-vsix.yml`, строки 87–94 | Шаг 6 |
| `npm run test:artifacts` | `build-vsix.yml`, строка 134 | Шаг 7 |
| Утилита `nbgv` 3.6.146 | `prereqs.yml`, строки 28–39 | Не нужна: она задаёт номер сборки в Azure Pipelines |
| `NuGetAuthenticate@1` | `prereqs.yml`, строка 11 | Не нужна: напрямую запрашиваемые пакеты доступны анонимно |
| .NET SDK 8.0.x, MicroBuild, `signVsix`, `verifyVsix` | `build-vsix.yml`, строки 67–124 | Пропущено: относится к подписи |

## Если что-то пошло не так

- **Ошибка от `nbgv` или пустая версия.** Исходники взяты не из `git clone`, либо история обрезана. Повторите шаг 4 полным клоном.
- **`Framework: 'Microsoft.NETCore.App', version '6.0.0' not found`.** Движок версионирования собран под .NET 6. На среде из SDK 10.0.400 он работает за счёт собственной настройки в `nbgv.runtimeconfig.json`, которая разрешает переход на старшую версию. Но начиная с .NET 12 загрузчик эту настройку игнорирует, так что на машине только с .NET 12 появится это сообщение. Тогда доустановите среду выполнения .NET 6 тем же скриптом:

  ```bash
  sudo bash dotnet-install.sh --runtime dotnet --channel 6.0 --install-dir /usr/share/dotnet --no-path
  ```
- **`npm ci` падает с 401, 403 или ошибкой DNS.** Нет доступа к адресам из `.npmrc` и `NuGet.config`.
- **Сборка остановилась на середине.** Чаще всего не хватило места на диске.

## Вариант: контейнер

Шаги те же внутри образа `ubuntu:22.04`, но от имени root и без `sudo`:

```bash
docker run --rm -it -v "$PWD/vsix-out:/out" ubuntu:22.04 bash
```

Внутри контейнера выполните шаги 1–7, убрав `sudo` из команд. В конце вынесите результат:

```bash
cp vsix/*.vsix /out/
```

## Что проверено и что нет

Проверено 23 ноября 2026 года:

- **Node.js.** `v24.22.3` — новейший релиз линейки, контрольная сумма `4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb` взята из `SHASUMS256.txt` на nodejs.org.
- **.NET.** Архив SDK 10.0.400 и скрипт установки доступны по адресам из шага 3. Список системных библиотек получен из самих бинарников среды .NET 10, все пакеты есть в Ubuntu 22.04.
- **Источники пакетов.** Все шесть NuGet-пакетов сборки, включая SDK-резолвер `Microsoft.Build.NoTargets` 3.7.0, отдаются фидом анонимно. Архивы отладчика на `download.visualstudio.microsoft.com` доступны.
- **Установочные скрипты npm.** `esbuild` и `@vscode/vsce-sign` берут готовые бинарники из npm, `keytar` — готовый бинарник с GitHub, и он на месте. `fsevents` запускается только на macOS.
- **Исходники.** Тег `v2.160.4` существует, его манифест совпадает с локальным.

Не проверено:

- **Сквозной прогон.** Инструкция не запускалась на Ubuntu 22.04 от начала до конца: система, где она написана, — macOS без .NET.
- **Версия в имени файла.** Точное имя пакетов для сборки из тега вычисляет Nerdbank.GitVersioning, оно появится в выводе шага 6.
- **arm64.** Конвейер вендора собирает только на amd64. Для arm64 замените в шаге 2 `linux-x64` на `linux-arm64` и возьмите контрольную сумму из того же файла `SHASUMS256.txt`.
