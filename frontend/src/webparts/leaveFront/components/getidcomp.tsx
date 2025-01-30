import * as React from 'react';
import { TextField, PrimaryButton } from '@fluentui/react'; // Fluent UI components for styling

// Define interface for leave request data
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
}

interface IState {
  leaveRequest: ILeaveRequest | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  updatedLeaveRequest: ILeaveRequest | null;
}

class GetDataByIdComponent extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      leaveRequest: null,
      loading: true,
      error: null,
      isEditing: false,
      updatedLeaveRequest: null,
    };
  }

  componentDidMount() {
    // Extract ID from the URL (assumes the URL is like /item-details/{id})
    const url = window.location.pathname;
    const id = url.split('/').pop(); // Extract the ID from the URL

    if (!id) {
      this.setState({
        error: 'No ID found in URL.',
        loading: false,
      });
      return;
    }

    this.fetchLeaveRequest(id);
  }

  fetchLeaveRequest = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`https://localhost:44387/api/getById/${id}`);
      if (response.ok) {
        const data: ILeaveRequest = await response.json();
        this.setState({
          leaveRequest: data,
          updatedLeaveRequest: data, // Initialize updatedLeaveRequest with fetched data
          loading: false,
        });
      } else {
        this.setState({
          error: 'Leave request not found.',
          loading: false,
        });
      }
    } catch (error) {
      this.setState({
        error: 'Error fetching leave request.',
        loading: false,
      });
      console.error('Error:', error);
    }
  };

  handleEditClick = () => {
    this.setState({ isEditing: true });
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ILeaveRequest) => {
    const { updatedLeaveRequest } = this.state;
    if (updatedLeaveRequest) {
      this.setState({
        updatedLeaveRequest: {
          ...updatedLeaveRequest,
          [field]: e.target.value,
        },
      });
    }
  };

  handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { updatedLeaveRequest, leaveRequest } = this.state;
    if (!updatedLeaveRequest) return;

    const url = `https://localhost:44387/api/updateLeave/${leaveRequest?.id}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLeaveRequest),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Leave request updated:', result);
        this.setState({
          isEditing: false,
          leaveRequest: updatedLeaveRequest,
        });
      } else {
        this.setState({ error: 'Error updating leave request.' });
      }
    } catch (error) {
      this.setState({ error: 'Error updating leave request.' });
      console.error('Error:', error);
    }
  };

  render() {
    const { leaveRequest, loading, error, isEditing, updatedLeaveRequest } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    return (
      <div>
        {isEditing ? (
          <div>
            <h3>Update Leave Request</h3>
            <form onSubmit={this.handleUpdateSubmit}>
              <div>
                <TextField
                  label="Employee Name"
                  value={updatedLeaveRequest?.employeeName || ''}
                  onChange={(e, newValue) =>
                    this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'employeeName')
                  }
                  required
                />
              </div>
              <div>
                <TextField
                  label="Start Date"
                  type="date"
                  value={updatedLeaveRequest?.startDate || ''}
                  onChange={(e, newValue) =>
                    this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'startDate')
                  }
                  required
                />
              </div>
              <div>
                <TextField
                  label="End Date"
                  type="date"
                  value={updatedLeaveRequest?.endDate || ''}
                  onChange={(e, newValue) =>
                    this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'endDate')
                  }
                  required
                />
              </div>
              <div>
                <TextField
                  label="Status"
                  value={updatedLeaveRequest?.status || ''}
                  onChange={(e, newValue) =>
                    this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'status')
                  }
                  required
                />
              </div>
              <div>
                <TextField
                  label="Created By"
                  value={updatedLeaveRequest?.createdBy || ''}
                  onChange={(e, newValue) =>
                    this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'createdBy')
                  }
                  required
                />
              </div>
              <div>
                <TextField
                  label="Modified By"
                  value={updatedLeaveRequest?.modifiedBy || ''}
                  onChange={(e, newValue) =>
                    this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'modifiedBy')
                  }
                  required
                />
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
              <PrimaryButton onClick={this.handleEditClick}>Edit</PrimaryButton>
            </div>
          )
        )}
      </div>
    );
  }
}

export default GetDataByIdComponent;
