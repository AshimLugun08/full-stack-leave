using System;
using System.ComponentModel.DataAnnotations;

namespace LeaveRequest
{
    public class LeaveRequest
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Employee Name is required")]
        public string EmployeeName { get; set; }

        [Required(ErrorMessage = "Start Date is required")]
        [DataType(DataType.Date)]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End Date is required")]
        [DataType(DataType.Date)]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; }

        [Required]
        public Guid RowId { get; set; } = Guid.NewGuid();  // Default value added

        public string CreatedBy { get; set; }

        public DateTime CreatedTimestamp { get; set; } = DateTime.Now;  // Default value added

        [Required]
        public string ModifiedBy { get; set; }

        public DateTime? ModifiedTimestamp { get; set; }

        public bool Active { get; set; } = true;  // Default value added

        [Required]
        public string Flag { get; set; } = "Created";

        public DateTime Timestamp { get; set; } = DateTime.Now;  // Default value added
    }
}