using GamersCommunity.Core.Services;
using __GamePascal__.Database.Context;

namespace __GamePascal__.Consumer.Services.Infra;

public class HealthService(__GamePascal__DbContext context) : HealthService<__GamePascal__DbContext>(context)
{
}
