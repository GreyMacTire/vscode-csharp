namespace DemoCSharp;

/// <summary>
/// Два действия для проверки подсказок, перехода к определению и отладки.
/// </summary>
public sealed class Calculator
{
    public int Add(int left, int right) => left + right;

    public double Divide(int left, int right)
    {
        if (right == 0)
        {
            throw new DivideByZeroException("Division by zero is not allowed.");
        }

        return (double)left / right;
    }
}
