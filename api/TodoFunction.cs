using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.OpenApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure;
using Azure.Data.Tables;
using System.Linq;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;
using api.Entity;
using api.Models;


namespace api
{
    public static class TodoFunction
    {
        [FunctionName("GetTodos")]
        [OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
        [OpenApiParameter(name: "userId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
        [OpenApiParameter(name: "todoId", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
        [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<TodoModel>))]
        public static async Task<IActionResult> GetTodos(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "todo")] HttpRequest req,
            [Table("Todo", Connection = "AzureWebJobsStorage")] TableClient tableClient,
            ILogger log)
        {
            log.LogInformation($"GET /todo executed with userId: {req.Query["userId"]} and todoId: {req.Query["todoId"]}");

            string userId = req.Query["userId"];
            string todoId = req.Query["todoId"];

            if(string.IsNullOrEmpty(todoId))
            {
                var todos = tableClient.Query<TodoEntity>().Where(t => t.PartitionKey == userId).ToList();
                var todoModels = new List<TodoModel>();
                foreach(var todo in todos)
                {
                    todoModels.Add(new TodoModel
                    {
                        Id = todo.RowKey,
                        UserId = todo.PartitionKey,
                        Title = todo.Title,
                        Description = todo.Description
                    });
                }
                return new OkObjectResult(todoModels);               
            }
            else
            {
                var todo = await tableClient.GetEntityAsync<TodoEntity>(userId, todoId);
                var todoModel = new TodoModel
                {
                    Id = todo.Value.RowKey,
                    UserId = todo.Value.PartitionKey,
                    Title = todo.Value.Title,
                    Description = todo.Value.Description
                };

                return new OkObjectResult(todoModel);
            }
        }

        [FunctionName("AddTodo")]
        [OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(TodoRequestModel), Required = true, Description = "Todo object that needs to be added")]
        [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(TodoModel))]
        public static async Task<IActionResult> AddTodo(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "todo")] HttpRequest req,
            [Table("Todo", Connection = "AzureWebJobsStorage")] TableClient tableClient,
            ILogger log)
        {
            log.LogInformation($"POST /todo executed with body: {await req.ReadAsStringAsync()}");

            var requestBody = await req.ReadAsStringAsync();
            var todoRequestModel = JsonConvert.DeserializeObject<TodoRequestModel>(requestBody);

            if(string.IsNullOrEmpty(todoRequestModel.UserId) || string.IsNullOrEmpty(todoRequestModel.Title))
            {
                return new BadRequestObjectResult("UserId and Title are required");
            }

            var todoModel = new TodoModel
            {
                Id = System.Guid.NewGuid().ToString(),
                UserId = todoRequestModel.UserId,
                Title = todoRequestModel.Title,
                Description = todoRequestModel.Description
            };

            var todoEntity = new TodoEntity
            {
                RowKey = todoModel.Id,
                PartitionKey = todoModel.UserId,
                Title = todoModel.Title,
                Description = todoModel.Description,
                Timestamp = System.DateTimeOffset.UtcNow,
                ETag = ETag.All
            };

            await tableClient.AddEntityAsync(todoEntity);

            return new OkObjectResult(todoModel);
        }

        [FunctionName("DeleteTodo")]
        [OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
        [OpenApiParameter(name: "userId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
        [OpenApiParameter(name: "todoId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
        [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.NoContent, contentType: "application/json", bodyType: typeof(string))]
        public static async Task<IActionResult> DeleteTodo(
            [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "todo")] HttpRequest req,
            [Table("Todo", Connection = "AzureWebJobsStorage")] TableClient tableClient,
            ILogger log)
        {
            log.LogInformation($"DELETE /todo executed with userId: {req.Query["userId"]} and todoId: {req.Query["todoId"]}");

            string userId = req.Query["userId"];
            string todoId = req.Query["todoId"];

            await tableClient.DeleteEntityAsync(userId, todoId);

            return new NoContentResult();
        }
        
    }
}
