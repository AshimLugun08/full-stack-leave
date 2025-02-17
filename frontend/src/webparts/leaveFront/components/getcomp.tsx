import * as React from 'react';
import { Component } from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text'; // Correct import for Text
import { Link } from '@fluentui/react/lib/Link'; // Import the Link component

interface ILeaveRequest {
  id: string; // Ensure the ID is included
  employeeName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  modifiedBy: string;
  active: boolean;
  flag: string;
  timestamp: string;
  documentLink:string
}

interface IState {
  leaveRequests: ILeaveRequest[];
  error: string | null;
  loading: boolean;
}

class GetLeaveRequests extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      leaveRequests: [],
      error: null,
      loading: true,
    };
  }

  // Fetch leave requests on component mount
  componentDidMount() {
    this.fetchLeaveRequests();
  }

  // Fetch leave requests from the API
  fetchLeaveRequests = async (): Promise<void> => {
    try {
      const response = await fetch('https://localhost:44387/api/getAll'); // Adjust API endpoint as needed
      if (response.ok) {
        const data: ILeaveRequest[] = await response.json();
        
        // Format the startDate and endDate to 'YYYY-MM-DD' format (8 digits)
        const formattedData = data.map((request) => ({
          ...request,
          startDate: request.startDate ? new Date(request.startDate).toISOString().slice(0, 10) : '',
          endDate: request.endDate ? new Date(request.endDate).toISOString().slice(0, 10) : '',
        }));
  
        console.log(formattedData);
        this.setState({ leaveRequests: formattedData, loading: false });
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      this.setState({ error: 'Error fetching leave requests', loading: false });
      console.error('Error fetching leave data:', error);
    }
  };

  // Delete leave request by ID
  handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`https://localhost:44387/api/deleteData/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log(`Leave request with id ${id} deleted successfully.`);
        this.setState(prevState => ({
          leaveRequests: prevState.leaveRequests.filter(request => request.id !== id),
        }));
      } else {
        throw new Error('Failed to delete leave request');
      }
    } catch (error) {
      this.setState({ error: 'Error deleting leave request' });
      console.error('Error deleting leave request:', error);
    }
  };

  // Columns for the details list
  columns: IColumn[] = [
    { key: 'employeeName', name: 'Employee Name', fieldName: 'employeeName', minWidth: 100, maxWidth: 200, isMultiline: false },
    { key: 'startDate', name: 'Start Date', fieldName: 'startDate', minWidth: 100, maxWidth: 150, isMultiline: false },
    { key: 'endDate', name: 'End Date', fieldName: 'endDate', minWidth: 100, maxWidth: 150, isMultiline: false },
    { key: 'status', name: 'Status', fieldName: 'status', minWidth: 100, maxWidth: 150, isMultiline: false },
    { key: 'createdBy', name: 'Created By', fieldName: 'createdBy', minWidth: 100, maxWidth: 150, isMultiline: false },
    { key: 'modifiedBy', name: 'Modified By', fieldName: 'modifiedBy', minWidth: 100, maxWidth: 150, isMultiline: false },
    { key: 'timestamp', name: 'Timestamp', fieldName: 'timestamp', minWidth: 100, maxWidth: 150, isMultiline: false },
    {
      key: 'documentLink',
      name: 'Link',
      fieldName: 'link',
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ILeaveRequest) => (
        <Link href={`${item.documentLink}`} target="_blank">
          View Details
        </Link>
      ),
    },
    {
      key: 'edit',
      name: 'Edit',
      fieldName: 'edit',
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ILeaveRequest) => (
        <DefaultButton
          text="Edit"
          onClick={() => this.handleEdit(item)}
        />
      ),
    },
    {
      key: 'delete',
      name: 'Delete',
      fieldName: 'delete',
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ILeaveRequest) => (
        <DefaultButton
          text="Delete"
          onClick={() => this.handleDelete(item.id)}
          style={{ backgroundColor: 'red', color: 'white' }} // Optional: Add custom style
        />
      ),
    },
  ];

  // Handle the Edit button click
  handleEdit = (item: ILeaveRequest): void => {
    console.log('Editing leave request:', item);

    // Redirect to item-details with the ID of the leave request
    window.location.href = `https://366pidev.sharepoint.com/sites/Ashim_Team_Site/_layouts/15/workbench.aspx/item-details/${item.id}`;
  };

  // Render component
  render() {
    const { leaveRequests, error, loading } = this.state;

    return (
      <div>
        {loading && <Text>Loading data...</Text>}
        {error && <Text>{error}</Text>}
        {!loading && !error && leaveRequests.length === 0 && <Text>No leave requests found.</Text>}
        {!loading && !error && leaveRequests.length > 0 && (
          <DetailsList
            items={leaveRequests}
            columns={this.columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.fixedColumns}
          />
        )}
      </div>
    );
  }
}

export default GetLeaveRequests;
