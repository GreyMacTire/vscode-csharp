# Чистая установка и проверка расширения C#

Инструкция для машины без доступа в интернет: что принести, в каком порядке ставить и чем проверить. Действия расписаны и проверены на Linux (Ubuntu 22.04). Для Windows и macOS отличается только шаг с установкой .NET, он отмечен и не проверялся.

Проверено 25 ноября 2026 года на VS Code 1.148.0 с расширением C# 2.160.4 этой сборки, .NET Install Tool 3.2.0 и SDK .NET 10.0.404. Как именно — в конце, в разделе «Что проверено».

## Почему всё ставится вручную

В оригинальном расширении недостающее докачивается из интернета. В этой сборке каждая такая загрузка выключена, поэтому всё приносят заранее.

| Что нужно | Зачем |
|---|---|
| Среда выполнения .NET 10 не ниже 10.0.5 | На ней работает сервер Roslyn: подсказки, ошибки, переход к определению |
| .NET Install Tool | Через него расширение ищет .NET на машине. Без него расширение не запускается |
| SDK той версии, на которой написаны проекты | Чтобы расширение поняло проект и чтобы проект собирался. SDK 10 собирает только проекты на .NET 10 |
| Пакеты проектов на внутреннем источнике | Restore запускается только командой, из интернета ничего не качается |

## Что принести на машину

| Что | Где взять |
|---|---|
| VS Code 1.148.0 | [Deb для Linux](https://update.code.visualstudio.com/1.148.0/linux-deb-x64/stable), [RPM для Linux](https://update.code.visualstudio.com/1.148.0/linux-rpm-x64/stable), [установщик для Windows](https://update.code.visualstudio.com/1.148.0/win32-x64/stable) |
| Расширение C# | Папка [vsix](vsix) этого репозитория, файл под свою платформу: `csharp-win32-x64`, `csharp-linux-x64`, `csharp-darwin-x64` или `csharp-darwin-arm64` с номером версии. Остальные файлы в папке — старые сборки, их не брать |
| .NET Install Tool 3.2.0 | [Прямая ссылка](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/ms-dotnettools/vsextensions/vscode-dotnet-runtime/3.2.0/vspackage), SHA-256 `0efa1a5a91bca853631a5f71551a81bf29ae7069bd510f5538cc7e5fb12f0540` |
| .NET 10 | Таблица ниже |

Ссылки на .NET ведут на серверы Microsoft и взяты из [официального списка выпусков](https://builds.dotnet.microsoft.com/dotnet/release-metadata/10.0/releases.json). Общая страница загрузки: [dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0).

| Платформа | SDK 10.0.404: среда, ASP.NET Core и средства разработки | Только среда выполнения 10.0.15 | Среда выполнения ASP.NET Core 10.0.15 |
|---|---|---|---|
| Linux x64 | [dotnet-sdk-10.0.404-linux-x64.tar.gz](https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.404/dotnet-sdk-10.0.404-linux-x64.tar.gz) | [dotnet-runtime-10.0.15-linux-x64.tar.gz](https://builds.dotnet.microsoft.com/dotnet/Runtime/10.0.15/dotnet-runtime-10.0.15-linux-x64.tar.gz) | [aspnetcore-runtime-10.0.15-linux-x64.tar.gz](https://builds.dotnet.microsoft.com/dotnet/aspnetcore/Runtime/10.0.15/aspnetcore-runtime-10.0.15-linux-x64.tar.gz) |
| Windows x64 | [dotnet-sdk-10.0.404-win-x64.exe](https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.404/dotnet-sdk-10.0.404-win-x64.exe) | [dotnet-runtime-10.0.15-win-x64.exe](https://builds.dotnet.microsoft.com/dotnet/Runtime/10.0.15/dotnet-runtime-10.0.15-win-x64.exe) | [aspnetcore-runtime-10.0.15-win-x64.exe](https://builds.dotnet.microsoft.com/dotnet/aspnetcore/Runtime/10.0.15/aspnetcore-runtime-10.0.15-win-x64.exe) |
| macOS Intel | [dotnet-sdk-10.0.404-osx-x64.pkg](https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.404/dotnet-sdk-10.0.404-osx-x64.pkg) | [dotnet-runtime-10.0.15-osx-x64.pkg](https://builds.dotnet.microsoft.com/dotnet/Runtime/10.0.15/dotnet-runtime-10.0.15-osx-x64.pkg) | [aspnetcore-runtime-10.0.15-osx-x64.tar.gz](https://builds.dotnet.microsoft.com/dotnet/aspnetcore/Runtime/10.0.15/aspnetcore-runtime-10.0.15-osx-x64.tar.gz) |
| macOS Apple Silicon | [dotnet-sdk-10.0.404-osx-arm64.pkg](https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.404/dotnet-sdk-10.0.404-osx-arm64.pkg) | [dotnet-runtime-10.0.15-osx-arm64.pkg](https://builds.dotnet.microsoft.com/dotnet/Runtime/10.0.15/dotnet-runtime-10.0.15-osx-arm64.pkg) | [aspnetcore-runtime-10.0.15-osx-arm64.tar.gz](https://builds.dotnet.microsoft.com/dotnet/aspnetcore/Runtime/10.0.15/aspnetcore-runtime-10.0.15-osx-arm64.tar.gz) |

Что выбрать:

- **SDK** закрывает всё сразу: внутри него есть и среда выполнения, и ASP.NET Core той же версии. Он же нужен, чтобы собирать проекты на .NET 10.
- **Две среды выполнения** — минимум для одного только расширения, если проекты на .NET 10 собирать на этой машине не нужно. ASP.NET Core нужен только вместе с C# Dev Kit.
- Пакеты .NET из репозитория дистрибутива (`apt-get install dotnet-sdk-…`) не брать: в Ubuntu 22.04 это версия 8.0, расширению она не подходит.

Контрольные суммы SHA-512 для всех двенадцати файлов — в конце, в разделе «Контрольные суммы .NET».

## Установка

### 1. Поставить .NET

**Linux.** Нужны права администратора. Распаковать архив SDK в системную папку и показать её системе:

```bash
sudo mkdir -p /usr/share/dotnet
sudo tar -xzf dotnet-sdk-10.0.404-linux-x64.tar.gz -C /usr/share/dotnet
sudo ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet
sudo mkdir -p /etc/dotnet
echo "/usr/share/dotnet" | sudo tee /etc/dotnet/install_location /etc/dotnet/install_location_x64
```

Если ставятся только среды выполнения, архив `dotnet-runtime-…` (и, если планируется C# Dev Kit, `aspnetcore-runtime-…`) распаковывается в ту же папку `/usr/share/dotnet`, остальные команды те же.

Три вещи делают .NET видимым для всех программ и всех пользователей: папка, ссылка `/usr/bin/dotnet` и файл `/etc/dotnet/install_location_x64`. Без них .NET виден только в терминале, а VS Code, запущенный с рабочего стола, его не находит.

**Windows.** Запустить установщик `dotnet-sdk-10.0.404-win-x64.exe`. Он сам прописывает .NET в пути системы.

**macOS.** Открыть пакет `dotnet-sdk-10.0.404-osx-x64.pkg` или `dotnet-sdk-10.0.404-osx-arm64.pkg`.

Windows и macOS не проверялись: способ взят из описания установщиков Microsoft.

### 2. Проверить, что .NET виден везде

**Linux.** Команда запускает `dotnet` с теми же путями, что бывают у VS Code, запущенного с рабочего стола, без настроек терминала:

```bash
env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin dotnet --list-sdks
```

Должно напечатать `10.0.404`. Для одних сред выполнения — `dotnet --list-runtimes` и строка `Microsoft.NETCore.App 10.0.15`.

**Windows и macOS.** Открыть новое окно терминала (не то, что было открыто до установки) и выполнить `dotnet --list-sdks`.

### 3. Поставить VS Code

Например, на Ubuntu: `sudo apt install ./code_1.148.0-1795526052_amd64.deb`. При этом `apt` подтягивает зависимости из репозиториев дистрибутива: в закрытом контуре они должны быть там доступны. Файл, которым пользовались при проверке, имеет SHA-256 `da33c10565e17b83f93508a365222f31bba116ab5c9e7bef7f562783943fd513`.

### 4. Поставить расширения из файлов

В панели расширений нажать «…» и выбрать «Install from VSIX…». Порядок такой:

1. .NET Install Tool;
2. расширение C# под свою платформу;
3. полностью закрыть VS Code и открыть заново.

Магазином расширений не пользоваться.

### 5. Не ставить C# Dev Kit

Если VS Code предложит его установить — отказаться. C# Dev Kit сам ставит SDK через .NET Install Tool и сам запускает restore при открытии проекта. В этой сборке он не нужен: расширение C# работает без него.

### 6. Выключить телеметрию .NET Install Tool

Добавить строку в файл настроек VS Code и перезапустить его:

```json
"dotnetAcquisitionExtension.enableTelemetry": false
```

Файл настроек: Linux `~/.config/Code/User/settings.json`, Windows `%APPDATA%\Code\User\settings.json`, macOS `~/Library/Application Support/Code/User/settings.json`. В самой сборке C# ничего менять не нужно: загрузка .NET и автозапуск restore в ней уже выключены.

### 7. Настроить источники пакетов для проектов

Restore идёт к источникам из `nuget.config`. Конфиги объединяются со всех уровней, а при первом restore SDK сам создаёт пользовательский конфиг с `nuget.org`. Поэтому одного конфига на уровне машины мало: пользовательский конф добавит `nuget.org` к тому, что прописан в нём. Надёжно убрать `nuget.org` так — заменить пользовательский конф файлом с пустым списком источников и своим внутренним источником:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="internal" value="https://адрес-внутреннего-источника/v3/index.json" />
  </packageSources>
</configuration>
```

Файл: `~/.nuget/NuGet/NuGet.Config` на Linux и macOS, `%appdata%\NuGet\Nuget.Config` на Windows. Затем в открытом проекте выполняется команда «.NET: Restore Project».

## Проверка

Демо-проект — папка [demo-csharp](demo-csharp) в этом репозитории. Библиотек он не подключает, поэтому собирается без источника пакетов. Можно открыть её прямо из репозитория или скопировать в домашний каталог.

1. **Запуск.** Открыть папку `demo-csharp`, открыть `Program.cs` и согласиться с вопросом о доверии к папке. Ошибок в правом нижнем углу быть не должно.
2. **Откуда взялся .NET.** Панель «Output» (Ctrl+Shift+U), канал «C#». Должны быть строки `Locating .NET runtime version 10.0.5` и `Dotnet path: …`; строк с `could not find` и `not found` быть не должно.
3. **Нет обращений к сети.** Там же, канал «.NET Install Tool»: не должно быть строк `Making Web Request`.
4. **Restore только вручную.** Пока не запущена команда «.NET: Restore Project», в папке проекта нет файла `obj/project.assets.json`. Папка `obj` с несколькими служебными файлами появится сама: это не restore, сервер готовит их, чтобы читать проект.
5. **Restore вручную.** Ctrl+Shift+P, «.NET: Restore Project». Файл `obj/project.assets.json` появляется.
6. **Редактор.** Набрать `calculator.` — появится список методов. Набрать несуществующее имя — подчеркнётся красным. Нажать F12 на `Add` — откроется `Calculator.cs`.
7. **Отладка.** Поставить точку останова на строке с `Console.WriteLine`, нажать F5, выбрать C#. Программа остановится на точке, а в терминале или в консоли отладки напечатает `2 + 3 = 5` и `10 / 4 = 2.5`.
8. **Диагностические инструменты не устанавливаются.** Ctrl+Shift+P, «C#: Collect Logs», выбрать вариант с трассировкой, дампом памяти или GC-дампом. Должно выйти сообщение с командой для ручной установки, без кнопки «Install».
9. **Главное для закрытого контура.** Отключить сеть и повторить шаги 1–8. Всё должно работать так же.

Логи лежат в Linux в `~/.config/Code/logs/`, в папке с датой и временем запуска: `window*/exthost/ms-dotnettools.csharp/C#.log` и `window*/exthost/ms-dotnettools.vscode-dotnet-runtime/`.

## Если что-то не так

| Признак | Причина | Что делать |
|---|---|---|
| `command 'dotnet.findPath' not found` | Пакет собран до 23:39 25 ноября 2026 года, без правки, которая ждёт запуска .NET Install Tool | Взять пакет новой сборки из `vsix/`. Со старым пакетом помогает приём: запустить VS Code, подождать несколько секунд, пока он не загрузится, и только потом открывать файл `.cs` |
| `The C# extension could not find the .NET 10.0.5 runtime or later on this machine` | VS Code не видит .NET | Шаги 1–2: папка, ссылка `/usr/bin/dotnet`, файл `/etc/dotnet/install_location_x64` |
| В канале «.NET Install Tool» есть `Making Web Request` | То же: не найдя .NET, инструмент пошёл его качать | То же |
| `The .NET SDK cannot be located` | SDK не виден VS Code, отладка не включится | Шаги 1–2 |
| Ставится SDK 8 из пакетов системы | Установлен C# Dev Kit и просит SDK | Убрать C# Dev Kit, шаг 5 |
| Restore заканчивается ошибкой `NU1301` или `NU1100` | Источнику пакетов недоступен, или в конфиге нет нужного | Шаг 7: пользовательский конфиг с `<clear />` и внутренним источником |
| Проект на .NET 8 не собирается, ошибка `NU1301` | SDK 10 без сети не собирает проекты на более старых версиях | Поставить рядом SDK версии проекта |
| На Mac с Apple Silicon расширение пытается скачать отладчик | Стоит пакет `darwin-x64`, в нём только отладчик для x64 | Взять пакет `darwin-arm64` |

## Контрольные суммы .NET

SHA-512 из официального списка выпусков. `sha512sum` печатает строчными буквами, регистр не важен:

```bash
sha512sum dotnet-sdk-10.0.404-linux-x64.tar.gz
```

```
577d0eb17fec33d029104c5c63a1ab0accc3e28776274abef2218dbac5af18d2109b5406d26b31d76f5c245215e3ba0926a94c20246c672c41847c9e1eb1dc50  dotnet-sdk-10.0.404-linux-x64.tar.gz
a90177d75bc891f71aa814dde3bcf76a356f5a506824669f1891754457954a3d13b72f3ca04c98fa0fe588514a5a781f8a87b17930ee802105c14f9edb28318a  dotnet-runtime-10.0.15-linux-x64.tar.gz
704751c6d671b720935a18849e8f10cdb6938549e9cf25493050ebc838a95eb5cb1caa9936d2edae3b85c5975778ed926e9b736e3a2582d861411babba3229c3  aspnetcore-runtime-10.0.15-linux-x64.tar.gz
c86b0aeb8c5ce0cd6dd290fb2b10bb112302d849d05cbcbcbc0ed4e5a15f66d1376e05bc77910bf66580d6a779390ec863e2bd6e51e7e21880d587b8b30c7b08  dotnet-sdk-10.0.404-win-x64.exe
c202a6721d66f49086e087a58e31c448062b0718fdd66b31807d7b2b31673adae5d3ccb36fc7451e113172ce59913d6c8034a35d5cc1cf6b079d5b544f1f425b  dotnet-runtime-10.0.15-win-x64.exe
716a82305a97b74fed21a982af4ca0f6d2c68489b6bfd1a88d565f8dbc73591873eb6c9e5289af6686e1b0a8090501ee920bb65e83dd506ff71f6ad932edc8d1  aspnetcore-runtime-10.0.15-win-x64.exe
3bfce34a3fd00d5d633e6d03f3073e88603b9440ca0e6ba02568fb1f7ce14f35f82c023fda2e9484e5858815f3a08e65e43a4b803a117b96e48c392f5d3c66c6  dotnet-sdk-10.0.404-osx-x64.pkg
57812a628f69a1842b02262dd220a98518dcbd357c7bfc36528aa9adea9c3c57671a892763393c0803b091bec89b74a1719dfa3decc7d0396b8118b503a252e1  dotnet-runtime-10.0.15-osx-x64.pkg
5981a3fe43285b0277458dbb33ec6c3cdb561f6de37ef7cc2d15a3b5c2d608625887124cc7f31bae412a37b3cc443fe876716d809f38983f9124d2b5e334c7c3  aspnetcore-runtime-10.0.15-osx-x64.tar.gz
63650c979c33a7152fe7dc88d37423c6926f6abb4c9615a9c76032e0fa737b6ec254321dc920984d52e69b9296e96662a70a402367e6d778d9387c1d14fac69c  dotnet-sdk-10.0.404-osx-arm64.pkg
ac74210bbf90df1e3bbb90611d1e956e4c34a67b390fdaf20d5c4bb3dd82c4bedc5ca3fddbbba1b8ed7e4c3228cd6f003eb58e635f0a313ccbdac347f4fce129  dotnet-runtime-10.0.15-osx-arm64.pkg
68b8d201be12e3d8f8bd9e3b0f59b50097fb3a0d35b2f599a269bb26ed75d5b7c3c00aecd0fc5979bc224559550b694abe047d4f962ccb58b50e985f07edfd72  aspnetcore-runtime-10.0.15-osx-arm64.tar.gz
```

## Что проверено

- **Чистая установка на Linux, 25 ноября 2026 года.** Отдельный пустой профиль VS Code; в него по порядку установлены .NET Install Tool 3.2.0 и пакет `csharp-linux-x64-2.160.4.vsix` сборки 23:39–23:43. VS Code запущен сразу с открытой папкой `demo-csharp` и файлом `Program.cs`. Расширение C# само активировало инструмент, .NET найден. В канале «C#»: `Dotnet path`, `Language server initialized`, проект загружен. У инструмента ноль запросов к сети и ни одной загрузки. Файла `obj/project.assets.json` не появилось, папки хранилища инструмента нет.
- **Тот же прогон без правки** ожидания запуска: расширение обращается к инструменту раньше, чем тот готов, сервер не запускается, в канале «C#» — `command 'dotnet.findPath' not found`. Причина в том, что в этой сборке инструмент не объявлен зависимостью пакета, и VS Code не запускает его первым. С тем же пакетом без правки работает обходной приём из таблицы: файл `.cs` открыт через 20 секунд после запуска VS Code, сервер запустился. Открыть папку проекта уже запущенным VS Code и затем файл — не проверялось.
- **Источники пакетов.** В пустом домашнем каталоге без сети первый `dotnet restore` создаёт `~/.nuget/NuGet/NuGet.Config` с `nuget.org`. Проверено на проекте с одной библиотекой: с одним конфигом на уровне машины (пустой список источников и внутренняя папка) restore проходит, но с предупреждением `NU1900`: это обращение к `nuget.org` за данными об уязвимостях. С тем же конфигом на уровне пользователя restore проходит без предупреждений.
- **Демо-проект** без сети: `dotnet run` печатает `2 + 3 = 5` и `10 / 4 = 2.5`, и в папке репозитория, и в копии в домашнем каталоге.
- **Ссылки** на .NET, VS Code и .NET Install Tool отвечают; файл .NET Install Tool по прямой ссылке побайтно совпадает с тем, что ставился. Контрольная сумма SDK для Linux x64 сверена со скачанным файлом, остальные одиннадцать взяты из списка выпусков и не сверялись.
- **Не проверялось:** установка .NET в `/usr/share/dotnet` (при проверке стояла папка в домашнем каталоге, остальные два шага те же), Windows и macOS, шаги проверки 5–9 руками в редакторе, в том числе повтор без сети.
