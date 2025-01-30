import * as React from 'react';
import { Component } from 'react';
import { Dropdown, IDropdownOption, TextField, PrimaryButton } from '@fluentui/react';

// Define interface for leave request data
interface ILeaveRequest {
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

// Interface for component state
interface IState {
  employeeName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  modifiedBy: string;
}

class PostComponent extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    // Initialize state with default values
    this.state = {
      employeeName: '',
      startDate: '',
      endDate: '',
      status: 'Pending', // Default status
      createdBy: '',
      modifiedBy: '',
    };
  }

  // Dropdown options for status
  statusOptions: IDropdownOption[] = [
    { key: 'Pending', text: 'Pending' },
    { key: 'Approved', text: 'Approved' },
    { key: 'Rejected', text: 'Rejected' },
  ];

  // Handle form input change
  handleInputChange = (newValue: string, field: keyof IState) => {
    this.setState({
      [field]: newValue,
    } as Pick<IState, keyof IState>);
  };

  // Handle form submission
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const { employeeName, startDate, endDate, status, createdBy, modifiedBy } = this.state;

    // Create leave request object with all required fields
    const leaveRequest: ILeaveRequest = {
      employeeName: employeeName,
      startDate: startDate,
      endDate: endDate,
      status: status,
      createdBy: createdBy,
      modifiedBy: modifiedBy,
      active: true,
      flag: 'Created', // Default flag
      timestamp: new Date().toISOString(), // Current timestamp
    };

    // Make POST request to API
    try {
      const response = await fetch('https://localhost:44387/api/addLeave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveRequest),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Leave request added successfully:', result);
      } else {
        console.error('Error adding leave request:', result);
      }
    } catch (error) {
      console.error('Error posting leave request:', error);
    }
  };

  render() {
    const { employeeName, startDate, endDate, status, createdBy, modifiedBy } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <TextField
            label="Employee Name"
            value={employeeName}
            onChange={(e, newValue) => this.handleInputChange(newValue || '', 'employeeName')}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e, newValue) => this.handleInputChange(newValue || '', 'startDate')}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e, newValue) => this.handleInputChange(newValue || '', 'endDate')}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <Dropdown
            label="Status"
            selectedKey={status}
            options={this.statusOptions}
            onChange={(e, option) => this.handleInputChange(option?.key as string, 'status')}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <TextField
            label="Created By"
            value={createdBy}
            onChange={(e, newValue) => this.handleInputChange(newValue || '', 'createdBy')}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <TextField
            label="Modified By"
            value={modifiedBy}
            onChange={(e, newValue) => this.handleInputChange(newValue || '', 'modifiedBy')}
            required
          />
        </div>

        <div style={{ marginTop: '15px' }}>
          <PrimaryButton type="submit">Submit Leave Request</PrimaryButton>
        </div>
      </form>
    );
  }
}

export default PostComponent;
