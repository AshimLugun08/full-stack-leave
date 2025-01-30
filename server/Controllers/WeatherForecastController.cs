using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LeaveRequest.Controllers
{
    [ApiController]
    [Route("api/")]
    public class LeaveController : ControllerBase
    {
        private readonly string _connectionString;
        private static readonly DateTime MinSqlDate = new DateTime(1753, 1, 1);
        private static readonly DateTime MaxSqlDate = new DateTime(9999, 12, 31);

        public LeaveController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("LeaveDatabase");
        }

        private bool IsValidSqlDate(DateTime date)
        {
            return date >= MinSqlDate && date <= MaxSqlDate;
        }

        private SqlConnection GetSqlConnection()
        {
            return new SqlConnection(_connectionString);
        }

        [HttpGet("getAll")]
        public async Task<IActionResult> GetLeaves()
        {
            var leaves = new List<LeaveRequest>();
            var query = "SELECT * FROM LeaveRequests WHERE Active = 1";

            try
            {
                using var connection = GetSqlConnection();
                await connection.OpenAsync();
                using var command = new SqlCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    leaves.Add(new LeaveRequest
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        EmployeeName = reader.GetString(reader.GetOrdinal("EmployeeName")),
                        StartDate = reader.GetDateTime(reader.GetOrdinal("StartDate")),
                        EndDate = reader.GetDateTime(reader.GetOrdinal("EndDate")),
                        Status = reader.GetString(reader.GetOrdinal("Status")),
                        RowId = reader.GetGuid(reader.GetOrdinal("RowId")),
                        CreatedBy = reader.GetString(reader.GetOrdinal("CreatedBy")),
                        CreatedTimestamp = reader.GetDateTime(reader.GetOrdinal("CreatedTimestamp")),
                        ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? null : reader.GetString(reader.GetOrdinal("ModifiedBy")),
                        ModifiedTimestamp = reader.IsDBNull(reader.GetOrdinal("ModifiedTimestamp")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedTimestamp")),
                        Active = reader.GetBoolean(reader.GetOrdinal("Active")),
                        Flag = reader.GetString(reader.GetOrdinal("Flag")),
                        Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp"))
                    });
                }
            }
            catch (SqlException ex)
            {
                return StatusCode(500, new { message = "Error while retrieving data", error = ex.Message });
            }

            return Ok(leaves);
        }

        [HttpPost("addLeave")]
        public async Task<IActionResult> AddLeave([FromBody] LeaveRequest leaveRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!IsValidSqlDate(leaveRequest.StartDate) || !IsValidSqlDate(leaveRequest.EndDate))
            {
                return BadRequest(new { message = "Dates must be between 1/1/1753 and 12/31/9999." });
            }

            if (leaveRequest.StartDate > leaveRequest.EndDate)
            {
                return BadRequest(new { message = "Start date cannot be later than end date." });
            }

            leaveRequest.RowId = leaveRequest.RowId == Guid.Empty ? Guid.NewGuid() : leaveRequest.RowId;
            leaveRequest.CreatedTimestamp = DateTime.Now;
            leaveRequest.Active = true;
            leaveRequest.Flag = "Created";
            leaveRequest.Timestamp = DateTime.Now;

            var query = @"INSERT INTO LeaveRequests 
                        (EmployeeName, StartDate, EndDate, Status, RowId, CreatedBy, CreatedTimestamp, ModifiedBy, Active, Flag, Timestamp) 
                        VALUES 
                        (@EmployeeName, @StartDate, @EndDate, @Status, @RowId, @CreatedBy, @CreatedTimestamp, @ModifiedBy, @Active, @Flag, @Timestamp)";

            try
            {
                using var connection = GetSqlConnection();
                await connection.OpenAsync();

                using var command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@EmployeeName", leaveRequest.EmployeeName);
                command.Parameters.AddWithValue("@StartDate", leaveRequest.StartDate);
                command.Parameters.AddWithValue("@EndDate", leaveRequest.EndDate);
                command.Parameters.AddWithValue("@Status", leaveRequest.Status);
                command.Parameters.AddWithValue("@RowId", leaveRequest.RowId);
                command.Parameters.AddWithValue("@CreatedBy", leaveRequest.CreatedBy ?? "System");
                command.Parameters.AddWithValue("@CreatedTimestamp", leaveRequest.CreatedTimestamp);
                command.Parameters.AddWithValue("@ModifiedBy", leaveRequest.ModifiedBy ?? "System");
                command.Parameters.AddWithValue("@Active", leaveRequest.Active);
                command.Parameters.AddWithValue("@Flag", leaveRequest.Flag);
                command.Parameters.AddWithValue("@Timestamp", leaveRequest.Timestamp);

                await command.ExecuteNonQueryAsync();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, new { message = "Error while adding leave request", error = ex.Message });
            }

            return Ok(new { message = "Leave request added successfully!" });
        }

        [HttpPut("updateLeave/{id}")]
        public async Task<IActionResult> UpdateLeave(int id, [FromBody] LeaveRequest leaveRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!IsValidSqlDate(leaveRequest.StartDate) || !IsValidSqlDate(leaveRequest.EndDate))
            {
                return BadRequest(new { message = "Dates must be between 1/1/1753 and 12/31/9999." });
            }

            if (leaveRequest.StartDate > leaveRequest.EndDate)
            {
                return BadRequest(new { message = "Start date cannot be later than end date." });
            }

            var query = @"UPDATE LeaveRequests 
                         SET EmployeeName = @EmployeeName,
                             StartDate = @StartDate,
                             EndDate = @EndDate,
                             Status = @Status,
                             ModifiedBy = @ModifiedBy,
                             ModifiedTimestamp = @ModifiedTimestamp,
                             Flag = @Flag,
                             Timestamp = @Timestamp
                         WHERE Id = @Id AND Active = 1";

            try
            {
                using var connection = GetSqlConnection();
                await connection.OpenAsync();

                // First check if the record exists
                var checkQuery = "SELECT COUNT(1) FROM LeaveRequests WHERE Id = @Id AND Active = 1";
                using (var checkCommand = new SqlCommand(checkQuery, connection))
                {
                    checkCommand.Parameters.AddWithValue("@Id", id);
                    var exists = (int)await checkCommand.ExecuteScalarAsync() > 0;
                    if (!exists)
                    {
                        return NotFound(new { message = "Leave request not found!" });
                    }
                }

                // Proceed with update
                using var command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@Id", id);
                command.Parameters.AddWithValue("@EmployeeName", leaveRequest.EmployeeName);
                command.Parameters.AddWithValue("@StartDate", leaveRequest.StartDate);
                command.Parameters.AddWithValue("@EndDate", leaveRequest.EndDate);
                command.Parameters.AddWithValue("@Status", leaveRequest.Status);
                command.Parameters.AddWithValue("@ModifiedBy", leaveRequest.ModifiedBy ?? "System");
                command.Parameters.AddWithValue("@ModifiedTimestamp", DateTime.Now);
                command.Parameters.AddWithValue("@Flag", "Updated");
                command.Parameters.AddWithValue("@Timestamp", DateTime.Now);

                await command.ExecuteNonQueryAsync();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, new { message = "Error while updating leave request", error = ex.Message });
            }

            return Ok(new { message = "Leave request updated successfully!" });
        }

        [HttpDelete("deleteData/{id}")]
        public async Task<IActionResult> DeleteLeave(int id)
        {
            var query = @"UPDATE LeaveRequests 
                          SET Active = 0, ModifiedTimestamp = GETDATE(), Flag = 'Deleted' 
                          WHERE Id = @Id AND Active = 1";

            try
            {
                using var connection = GetSqlConnection();
                await connection.OpenAsync();
                using var command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@Id", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Leave request not found!" });
                }
            }
            catch (SqlException ex)
            {
                return StatusCode(500, new { message = "Error while deleting leave request", error = ex.Message });
            }

            return Ok(new { message = "Leave request deleted successfully!" });
        }

        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetLeaveById(int id)
        {
            LeaveRequest leaveRequest = null;
            var query = "SELECT * FROM LeaveRequests WHERE Id = @Id AND Active = 1";

            try
            {
                using var connection = GetSqlConnection();
                await connection.OpenAsync();
                using var command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@Id", id);
                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    leaveRequest = new LeaveRequest
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        EmployeeName = reader.GetString(reader.GetOrdinal("EmployeeName")),
                        StartDate = reader.GetDateTime(reader.GetOrdinal("StartDate")),
                        EndDate = reader.GetDateTime(reader.GetOrdinal("EndDate")),
                        Status = reader.GetString(reader.GetOrdinal("Status")),
                        RowId = reader.GetGuid(reader.GetOrdinal("RowId")),
                        CreatedBy = reader.GetString(reader.GetOrdinal("CreatedBy")),
                        CreatedTimestamp = reader.GetDateTime(reader.GetOrdinal("CreatedTimestamp")),
                        ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? null : reader.GetString(reader.GetOrdinal("ModifiedBy")),
                        ModifiedTimestamp = reader.IsDBNull(reader.GetOrdinal("ModifiedTimestamp")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedTimestamp")),
                        Active = reader.GetBoolean(reader.GetOrdinal("Active")),
                        Flag = reader.GetString(reader.GetOrdinal("Flag")),
                        Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp"))
                    };
                }

                if (leaveRequest == null)
                {
                    return NotFound(new { message = "Leave request not found!" });
                }
            }
            catch (SqlException ex)
            {
                return StatusCode(500, new { message = "Error retrieving leave request", error = ex.Message });
            }

            return Ok(leaveRequest);
        }
    }
}