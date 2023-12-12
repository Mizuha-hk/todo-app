using System;
using Azure;
using Azure.Data.Tables;

namespace api.Entity
{
    public class TodoEntity: ITableEntity
    {
        //id
        public string RowKey { get; set; }
        //userId
        public string PartitionKey { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTimeOffset? Timestamp { get; set; }   
        public ETag ETag { get; set; }
    }
}