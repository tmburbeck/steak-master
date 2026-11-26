namespace SteakMaster.Api.Cooking;

/// <summary>What the user chose on the setup screen.</summary>
/// <param name="Cut">Steak cut, e.g. "Ribeye".</param>
/// <param name="ThicknessInches">Thickness of the steak in inches.</param>
/// <param name="Doneness">"Rare", "Medium Rare", "Medium", "Medium Well" or "Well Done".</param>
/// <param name="Method">"Cast iron" or "Grill".</param>
public record CookingRequest(string Cut, double ThicknessInches, string Doneness, string Method);

/// <summary>How long each stage of the cook should take, in seconds.</summary>
public record CookingPlanResponse(int FirstSideSeconds, int SecondSideSeconds, int RestSeconds, string Note);
