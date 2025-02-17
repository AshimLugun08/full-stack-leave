import * as React from 'react';
import { TextField, PrimaryButton, Dropdown, IDropdownOption } from '@fluentui/react';

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
  documentLink: string | null;
}

interface IState {
  leaveRequest: ILeaveRequest | null;
  updatedLeaveRequest: ILeaveRequest | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  file: File | null;
  id: string | null;
}

class GetDataByIdComponent extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      leaveRequest: null,
      updatedLeaveRequest: null,
      loading: true,
      error: null,
      isEditing: false,
      file: null,
      id: null,
    };
  }

  componentDidMount() {
    const url = window.location.pathname;
    const extractedId = url.split('/').pop();

    if (!extractedId) {
      this.setState({ error: 'No ID found in URL.', loading: false });
      return;
    }

    this.setState({ id: extractedId });
    this.fetchLeaveRequest(extractedId);
  }

  fetchLeaveRequest = async (id: string) => {
    try {
      const response = await fetch(`https://localhost:44387/api/getById/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ILeaveRequest = await response.json();
      this.setState({ leaveRequest: data, updatedLeaveRequest: { ...data } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching leave request.';
      this.setState({ error: errorMessage });
      console.error('Error:', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEditClick = () => {
    const { leaveRequest } = this.state;
    // Ensure we create a new copy of the leave request for editing
    this.setState({ 
      isEditing: true,
      updatedLeaveRequest: leaveRequest ? { ...leaveRequest } : null 
    });
  };

  handleInputChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof ILeaveRequest
  ) => {
    const value = (event.target as HTMLInputElement).value;
    this.setState((prevState) => ({
      updatedLeaveRequest: prevState.updatedLeaveRequest
        ? { ...prevState.updatedLeaveRequest, [field]: value }
        : null
    }));
  };

  handleStatusChange = (_event: React.FormEvent, option?: IDropdownOption) => {
    if (option) {
      this.setState((prevState) => ({
        updatedLeaveRequest: prevState.updatedLeaveRequest
          ? { ...prevState.updatedLeaveRequest, status: option.key as string }
          : null
      }));
    }
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.setState({ file: files[0] });
    }
  };

  handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { updatedLeaveRequest, file, id } = this.state;
    
    if (!updatedLeaveRequest || !id) {
      this.setState({ error: 'Missing required data for update.' });
      return;
    }

    try {
      let documentUrl = updatedLeaveRequest.documentLink;
      if (file) {
        documentUrl = await this.uploadFileToSharePoint(file);
      }

      const updatedData = { ...updatedLeaveRequest, documentLink: documentUrl };

      const response = await fetch(`https://localhost:44387/api/updateLeave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.setState({ 
        leaveRequest: updatedData, 
        isEditing: false,
        file: null,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating leave request.';
      this.setState({ error: errorMessage });
      console.error('Update error:', error);
    }
  };

  uploadFileToSharePoint = async (file: File): Promise<string> => {
    try {
      // Simulated upload - in real implementation, handle actual file upload
      return new Promise((resolve) => {
        setTimeout(() => resolve(`https://sharepoint.com/docs/${file.name}`), 2000);
      });
    } catch (error) {
      throw new Error('Failed to upload file to SharePoint');
    }
  };

  handleDownloadReport = async () => {
    const { id } = this.state;
    if (!id) {
      this.setState({ error: 'No ID available for downloading report.' });
      return;
    }

    try {
      const response = await fetch(`https://localhost:44387/api/generate/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_report_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error downloading report.';
      this.setState({ error: errorMessage });
      console.error('Download error:', error);
    }
  };

  render() {
    const { leaveRequest, isEditing, updatedLeaveRequest, loading, error } = this.state;

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!leaveRequest) return <p>No leave request data found.</p>;

    const statusOptions: IDropdownOption[] = [
      { key: 'Approved', text: 'Approved' },
      { key: 'Pending', text: 'Pending' },
      { key: 'Rejected', text: 'Rejected' }
    ];

    return (
      <div>
        <h2>Leave Request Details</h2>
        {isEditing && updatedLeaveRequest ? (
          <form onSubmit={this.handleUpdateSubmit}>
            <TextField
              label="Employee Name"
              value={updatedLeaveRequest.employeeName}
              onChange={(e) => this.handleInputChange(e, 'employeeName')}
              required
            />
            <TextField
              label="Start Date"
              value={updatedLeaveRequest.startDate}
              onChange={(e) => this.handleInputChange(e, 'startDate')}
              type="date"
              required
            />
            <TextField
              label="End Date"
              value={updatedLeaveRequest.endDate}
              onChange={(e) => this.handleInputChange(e, 'endDate')}
              type="date"
              required
            />
            <Dropdown
              label="Status"
              selectedKey={updatedLeaveRequest.status}
              options={statusOptions}
              onChange={this.handleStatusChange}
              required
            />
            <input
              type="file"
              onChange={this.handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <PrimaryButton text="Save" type="submit" />
          </form>
        ) : (
          <div>
            <p><strong>Employee Name:</strong> {leaveRequest.employeeName}</p>
            <p><strong>Start Date:</strong> {leaveRequest.startDate}</p>
            <p><strong>End Date:</strong> {leaveRequest.endDate}</p>
            <p><strong>Status:</strong> {leaveRequest.status}</p>
            {leaveRequest.documentLink && (
              <p>
                <strong>Document:</strong>{' '}
                <a
                  href={leaveRequest.documentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              </p>
            )}
            <PrimaryButton text="Edit" onClick={this.handleEditClick} />
          </div>
        )}
        <div style={{ marginTop: '1rem' }}>
          <PrimaryButton text="Download Report" onClick={this.handleDownloadReport} />
        </div>
      </div>
    );
  }
}

export default GetDataByIdComponent;