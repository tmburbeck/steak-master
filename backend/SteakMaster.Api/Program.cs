// Steak Master API: a small ASP.NET Core service that calculates cooking times.
// The mobile app calls POST /api/cooking/plan and falls back to its own
// built-in estimate if this server can't be reached.

using SteakMaster.Api.Cooking;

var builder = WebApplication.CreateBuilder(args);

// Allow requests from the places the app runs during development:
// a local browser, the Capacitor native shell, and the Android emulator.
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .SetIsOriginAllowed(IsAllowedOrigin)
    .AllowAnyHeader()
    .AllowAnyMethod()));

// Swagger generates interactive API docs at /swagger (development only).
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Simple "is the server up?" check.
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "SteakMaster.Api" }));

// Returns how long to cook each side and how long to rest.
app.MapPost("/api/cooking/plan", (CookingRequest request) =>
{
    if (request.ThicknessInches is < CookingPlanCalculator.MinThicknessInches
                                 or > CookingPlanCalculator.MaxThicknessInches)
    {
        return Results.BadRequest(new { error = "Thickness must be between 0.5 and 4 inches." });
    }

    return Results.Ok(CookingPlanCalculator.CreatePlan(request));
});

app.Run();

static bool IsAllowedOrigin(string origin) =>
    origin.StartsWith("http://localhost")      // desktop browser / iOS simulator
    || origin.StartsWith("capacitor://")        // native iOS app
    || origin.StartsWith("http://10.0.2.2");    // Android emulator's address for the host machine
