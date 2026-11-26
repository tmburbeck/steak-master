namespace SteakMaster.Api.Cooking;

/// <summary>
/// Estimates cooking times for a steak.
///
/// The formula starts from a baseline (a 1.25" medium steak in cast iron takes
/// about 3.5 minutes total) and scales it up or down for thickness, doneness,
/// cooking method and cut. The mobile app's cooking.ts uses the same numbers
/// so both give identical results.
///
/// These are rough estimates only; a thermometer reading is what confirms doneness.
/// </summary>
public static class CookingPlanCalculator
{
    public const double MinThicknessInches = 0.5;
    public const double MaxThicknessInches = 4.0;

    private const double BaseSeconds = 210;
    private const double BaseThicknessInches = 1.25;
    private const int MinimumTotalSeconds = 120;
    private const double FirstSideShare = 0.52;   // first side gets slightly more time
    private const int RestSeconds = 300;

    private const string Note =
        "Estimate only. Use an instant-read thermometer; time alone cannot establish doneness.";

    public static CookingPlanResponse CreatePlan(CookingRequest request)
    {
        var estimatedSeconds = BaseSeconds
            * (request.ThicknessInches / BaseThicknessInches)
            * MethodMultiplier(request.Method)
            * DonenessMultiplier(request.Doneness)
            * CutMultiplier(request.Cut);

        var totalSeconds = Math.Max(MinimumTotalSeconds, (int)Math.Round(estimatedSeconds));
        var firstSideSeconds = (int)Math.Round(totalSeconds * FirstSideShare);

        return new CookingPlanResponse(firstSideSeconds, totalSeconds - firstSideSeconds, RestSeconds, Note);
    }

    /// <summary>A grill runs a little hotter than a pan.</summary>
    private static double MethodMultiplier(string method) =>
        method.Equals("Grill", StringComparison.OrdinalIgnoreCase) ? 0.95 : 1.0;

    /// <summary>Rarer steaks need less time; more well-done steaks need more.</summary>
    private static double DonenessMultiplier(string doneness) => doneness.ToLowerInvariant() switch
    {
        "rare" => 0.78,
        "medium rare" => 0.92,
        "medium" => 1.0,
        "medium well" => 1.12,
        "well done" => 1.28,
        _ => 1.0,
    };

    /// <summary>Filet mignon is lean and cooks a bit faster.</summary>
    private static double CutMultiplier(string cut) =>
        cut.Equals("Filet Mignon", StringComparison.OrdinalIgnoreCase) ? 0.95 : 1.0;
}
