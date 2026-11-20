var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.SetIsOriginAllowed(origin => origin.StartsWith("http://localhost") || origin.StartsWith("capacitor://") || origin.StartsWith("http://10.0.2.2"))
          .AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }

app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "SteakMaster.Api" }));

app.MapPost("/api/cooking/plan", (CookingRequest request) =>
{
    if (request.ThicknessInches is < 0.5 or > 4)
        return Results.BadRequest(new { error = "Thickness must be between 0.5 and 4 inches." });

    var methodFactor = request.Method.Equals("Grill", StringComparison.OrdinalIgnoreCase) ? 0.95 : 1.0;
    var donenessFactor = request.Doneness.ToLowerInvariant() switch {
        "rare" => 0.78, "medium rare" => 0.92, "medium" => 1.0,
        "medium well" => 1.12, "well done" => 1.28, _ => 1.0
    };
    var cutFactor = request.Cut.Equals("Filet mignon", StringComparison.OrdinalIgnoreCase) ? 0.95 : 1.0;
    var total = Math.Max(120, (int)Math.Round(210 * request.ThicknessInches / 1.25 * methodFactor * donenessFactor * cutFactor));
    var first = (int)Math.Round(total * 0.52);
    return Results.Ok(new CookingPlanResponse(first, total - first, 300,
        "Estimate only. Use an instant-read thermometer; time alone cannot establish doneness."));
});

app.Run();

record CookingRequest(string Cut, double ThicknessInches, string Doneness, string Method);
record CookingPlanResponse(int FirstSideSeconds, int SecondSideSeconds, int RestSeconds, string Note);
