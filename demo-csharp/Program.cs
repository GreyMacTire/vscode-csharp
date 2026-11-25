// Демо-проект для проверки расширения C#: подсказки, поиск ошибок, переход к определению, отладка.
// Библиотек не подключает, поэтому собирается и без доступа к источнику пакетов.
// Инструкция — в файле clean-install.md в корне репозитория.

using DemoCSharp;

var calculator = new Calculator();

Console.WriteLine($"2 + 3 = {calculator.Add(2, 3)}");
Console.WriteLine($"10 / 4 = {calculator.Divide(10, 4)}");

// Для проверки отладки на исключении убрать комментарий у следующей строки:
// Console.WriteLine($"10 / 0 = {calculator.Divide(10, 0)}");
