import * as React from 'react';
import { useEffect, useState } from 'react';
import { TextField, PrimaryButton, Dropdown, IDropdownOption } from '@fluentui/react'; // Fluent UI components for styling

interface ILeaveRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  modifiedBy: string;
  active: boolean;
  flag: string;
  timestamp: string;
  documentLink: string | null; // Add document URL field
}

const GetDataByIdComponent: React.FC = () => {
  const [leaveRequest, setLeaveRequest] = useState<ILeaveRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatedLeaveRequest, setUpdatedLeaveRequest] = useState<ILeaveRequest | null>(null);
  const [file, setFile] = useState<File | null>(null); // Store the uploaded file

  useEffect(() => {
    const url = window.location.pathname;
    const id = url.split('/').pop(); // Extract the ID from the URL

    if (!id) {
      setError('No ID found in URL.');
      setLoading(false);
      return;
    }

    const fetchLeaveRequest = async (): Promise<void> => {
      try {
        const response = await fetch(`https://localhost:44387/api/getById/${id}`);
        if (response.ok) {
          const data: ILeaveRequest = await response.json();
          setLeaveRequest(data);
          setUpdatedLeaveRequest(data);
        } else {
          setError('Leave request not found.');
        }
      } catch (error) {
        setError('Error fetching leave request.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequest();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ILeaveRequest) => {
    if (updatedLeaveRequest) {
      setUpdatedLeaveRequest({
        ...updatedLeaveRequest,
        [field]: e.target.value,
      });
    }
  };

  const handleStatusChange = (e: React.FormEvent, option?: IDropdownOption) => {
    if (updatedLeaveRequest && option) {
      setUpdatedLeaveRequest({
        ...updatedLeaveRequest,
        status: option.key as string,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updatedLeaveRequest) return;

    // Upload file if it exists
    let documentUrl = updatedLeaveRequest.documentLink;
    if (file) {
      // Assuming uploadFileToSharePoint is a function to handle file upload to SharePoint
      documentUrl = await uploadFileToSharePoint(file);
    }

    const updatedData = {
      ...updatedLeaveRequest,
      documentUrl, // Include document URL in the update
    };

    const url = `https://localhost:44387/api/updateLeave/${leaveRequest?.id}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Leave request updated:', result);
        setIsEditing(false);
        setLeaveRequest(updatedData); // Update the displayed leave request
      } else {
        setError('Error updating leave request.');
      }
    } catch (error) {
      setError('Error updating leave request.');
      console.error('Error:', error);
    }
  };

  const uploadFileToSharePoint = async (file: File): Promise<string | null> => {
    // Placeholder function for file upload logic (replace with actual implementation)
    try {
      // Mock the SharePoint file upload process
      const uploadUrl = `https://sharepoint.example.com/files/${file.name}`;
      console.log(`File uploaded: ${uploadUrl}`);
      return uploadUrl; // Return the file URL after uploading
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const statusOptions: IDropdownOption[] = [
    { key: 'Pending', text: 'Pending' },
    { key: 'Approved', text: 'Approved' },
    { key: 'Denied', text: 'Denied' },
  ];

  return (
    <div>
      {isEditing ? (
        <div>
          <h3>Update Leave Request</h3>
          <form onSubmit={handleUpdateSubmit}>
            <div>
              <TextField
                label="Employee Name"
                value={updatedLeaveRequest?.employeeName || ''}
                onChange={(e, newValue) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'employeeName')}
                required
              />
            </div>
            <div>
              <TextField
                label="Start Date"
                type="date"
                value={updatedLeaveRequest?.startDate || ''}
                onChange={(e, newValue) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'startDate')}
                required
              />
            </div>
            <div>
              <TextField
                label="End Date"
                type="date"
                value={updatedLeaveRequest?.endDate || ''}
                onChange={(e, newValue) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'endDate')}
                required
              />
            </div>
            <div>
              <Dropdown
                label="Status"
                selectedKey={updatedLeaveRequest?.status || 'Pending'}
                options={statusOptions}
                onChange={handleStatusChange}
                required
              />
            </div>
            <div>
              <TextField
                label="Created By"
                value={updatedLeaveRequest?.createdBy || ''}
                onChange={(e, newValue) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'createdBy')}
                required
              />
            </div>
            <div>
              <TextField
                label="Modified By"
                value={updatedLeaveRequest?.modifiedBy || ''}
                onChange={(e, newValue) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'modifiedBy')}
                required
              />
            </div>
            <div>
              <input type="file" onChange={handleFileChange} />
              {file && <p>Selected file: {file.name}</p>}
            </div>
            <div>
              <PrimaryButton type="submit">Update</PrimaryButton>
            </div>
          </form>
        </div>
      ) : (
        leaveRequest && (
          <div>
            <h3>Leave Request Details</h3>
            <p><strong>Employee Name:</strong> {leaveRequest.employeeName}</p>
            <p><strong>Start Date:</strong> {leaveRequest.startDate}</p>
            <p><strong>End Date:</strong> {leaveRequest.endDate}</p>
            <p><strong>Status:</strong> {leaveRequest.status}</p>
            <p><strong>Created By:</strong> {leaveRequest.createdBy}</p>
            <p><strong>Modified By:</strong> {leaveRequest.modifiedBy}</p>
            <p><strong>Timestamp:</strong> {leaveRequest.timestamp}</p>
            {leaveRequest.documentLink && (
              <p><strong>Document Link:</strong> <a href={leaveRequest.documentLink} target="_blank" rel="noopener noreferrer">View Document</a></p>
            )}
            <PrimaryButton onClick={handleEditClick}>Edit</PrimaryButton>
          </div>
        )
      )}
    </div>
  );
};

export default GetDataByIdComponent;
