using GamersCommunity.Core.Services;
using __GamePascal__.Database.Context;
using __GamePascal__.Database.Models;

namespace __GamePascal__.Consumer.Services.Data;

public class ItemsService(__GamePascal__DbContext context)
    : GenericDataService<__GamePascal__DbContext, Item>(context, "Items")
{
}
