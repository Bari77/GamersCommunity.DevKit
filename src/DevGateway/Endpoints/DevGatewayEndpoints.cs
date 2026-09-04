using System.Text.Json;
using System.Text.Json.Serialization;
using DevGateway.Configuration;
using DevGateway.Messaging;
using GamersCommunity.Core.Enums;
using GamersCommunity.Core.Rabbit;
using Microsoft.Extensions.Options;

namespace DevGateway.Endpoints;

public static class DevGatewayEndpoints
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public static IEndpointRouteBuilder MapDevGatewayEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", () => Results.Json(new { status = "Healthy", gateway = "dev" }, JsonOpts));

        app.MapPost("/api/{ms}/{resource}", async (
            string ms,
            string resource,
            HttpRequest req,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var jsonBody = await new StreamReader(req.Body).ReadToEndAsync(ct);
            var msg = CreateBusMessage(opts, ResolveType(res), resource, "Create", jsonBody);
            var id = await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.Created($"/api/{ms}/{resource}/{id}", id);
        });

        app.MapGet("/api/{ms}/{resource}", async (
            string ms,
            string resource,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var msg = CreateBusMessage(opts, ResolveType(res), resource, "List");
            var result = await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.Text(result, "application/json");
        });

        app.MapPut("/api/{ms}/{resource}", async (
            string ms,
            string resource,
            HttpRequest req,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var jsonBody = await new StreamReader(req.Body).ReadToEndAsync(ct);
            var msg = CreateBusMessage(opts, ResolveType(res), resource, "Update", jsonBody);
            await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.NoContent();
        });

        app.MapDelete("/api/{ms}/{resource}", async (
            string ms,
            string resource,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var msg = CreateBusMessage(opts, ResolveType(res), resource, "Delete");
            await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.NoContent();
        });

        app.MapGet("/api/{ms}/{resource}/{id:int}", async (
            string ms,
            string resource,
            int id,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var msg = CreateBusMessage(opts, ResolveType(res), resource, "Get", id.ToString(), id);
            var result = await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.Text(result, "application/json");
        });

        app.MapPut("/api/{ms}/{resource}/{id:int}", async (
            string ms,
            string resource,
            int id,
            HttpRequest req,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var jsonBody = await new StreamReader(req.Body).ReadToEndAsync(ct);
            var msg = CreateBusMessage(opts, ResolveType(res), resource, "Update", jsonBody, id);
            await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.NoContent();
        });

        app.MapDelete("/api/{ms}/{resource}/{id:int}", async (
            string ms,
            string resource,
            int id,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();

            var msg = CreateBusMessage(opts, ResolveType(res), resource, "Delete", id.ToString(), id);
            await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.NoContent();
        });

        app.MapPost("/api/{ms}/{resource}/actions/{action}", async (
            string ms,
            string resource,
            string action,
            HttpRequest req,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();
            if (!IsActionAllowed(res, action)) return Results.Unauthorized();

            var jsonBody = await new StreamReader(req.Body).ReadToEndAsync(ct);
            var msg = CreateBusMessage(opts, ResolveType(res), resource, action, jsonBody);
            var result = await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.Text(result, "application/json");
        });

        app.MapPost("/api/{ms}/{resource}/{id:int}/actions/{action}", async (
            string ms,
            string resource,
            int id,
            string action,
            HttpRequest req,
            IOptions<DevGatewayOptions> options,
            RabbitRpcClient rpc,
            CancellationToken ct) =>
        {
            var opts = options.Value;
            if (!IsMicroserviceAllowed(ms, opts)) return Results.BadRequest("Unknown microservice.");
            if (!TryGetResource(opts, resource, out var res)) return Results.Unauthorized();
            if (!IsActionAllowed(res, action)) return Results.Unauthorized();

            var jsonBody = await new StreamReader(req.Body).ReadToEndAsync(ct);
            var msg = CreateBusMessage(opts, ResolveType(res), resource, action, jsonBody, id);
            var result = await rpc.CallAsync(opts.Queue, JsonSerializer.Serialize(msg, JsonOpts), ct);
            return Results.Text(result, "application/json");
        });

        return app;
    }

    private static bool IsMicroserviceAllowed(string ms, DevGatewayOptions opts) =>
        !string.IsNullOrWhiteSpace(opts.MicroserviceId) &&
        opts.MicroserviceId.Equals(ms, StringComparison.OrdinalIgnoreCase);

    private static bool TryGetResource(DevGatewayOptions opts, string resource, out ResourceOptions res)
    {
        var found = opts.Resources.FirstOrDefault(r =>
            r.Name.Equals(resource, StringComparison.OrdinalIgnoreCase));
        if (found is null)
        {
            res = null!;
            return false;
        }

        res = found;
        return true;
    }

    private static bool IsActionAllowed(ResourceOptions res, string action)
    {
        if (res.Actions.Count == 0) return true;
        return res.Actions.Any(a => a.Equals(action, StringComparison.OrdinalIgnoreCase));
    }

    private static BusServiceTypeEnum ResolveType(ResourceOptions res)
    {
        if (Enum.TryParse<BusServiceTypeEnum>(res.Type, ignoreCase: true, out var type))
            return type;
        return BusServiceTypeEnum.DATA;
    }

    private static BusMessage CreateBusMessage(
        DevGatewayOptions opts,
        BusServiceTypeEnum type,
        string resource,
        string action,
        string? data = null,
        int? id = null) =>
        new()
        {
            Type = type,
            Resource = resource,
            Action = action,
            Data = data,
            Id = id,
            Caller = opts.InjectFakeCaller
                ? new CallerIdentity
                {
                    Subject = opts.FakeCaller.Subject,
                    Email = opts.FakeCaller.Email,
                    Username = opts.FakeCaller.Username,
                    Roles = opts.FakeCaller.Roles
                }
                : null
        };
}
