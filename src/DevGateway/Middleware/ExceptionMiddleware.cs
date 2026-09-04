using System.Net;
using System.Text.Json;
using GamersCommunity.Core.Exceptions;

namespace DevGateway.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await WriteErrorAsync(context, ex);
        }
    }

    private static Task WriteErrorAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
            return Task.CompletedTask;

        object body;
        if (exception is AppException app)
        {
            context.Response.StatusCode = (int)app.StatusCode;
            body = new { code = app.Code, message = app.Message };
        }
        else
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            body = new { code = "ERROR", message = "An unexpected error occurred." };
        }

        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}
