import * as React from 'react';
import { Component } from 'react';
import { Dropdown, IDropdownOption, PrimaryButton, TextField } from '@fluentui/react';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import axios from 'axios';
import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/folders";  // Add this import
import "@pnp/sp/files";    // Add this import

interface IProps {
  context: any; // SPFx Context
}

interface IState {
  employeeName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  modifiedBy: string;
  selectedUsers: string[];
  loading: boolean;
  file: File | null;
}

class PostComponent extends Component<IProps, IState> {
  private peoplePickerContext: IPeoplePickerContext;
  private sp = spfi().using(SPFx(this.props.context));

  constructor(props: IProps) {
    super(props);

    this.peoplePickerContext = {
      absoluteUrl: this.props.context.pageContext.web.absoluteUrl,
      msGraphClientFactory: this.props.context.msGraphClientFactory,
      spHttpClient: this.props.context.spHttpClient
    };

    this.state = {
      employeeName: '',
      startDate: '',
      endDate: '',
      status: 'Pending',
      createdBy: '',
      modifiedBy: '',
      selectedUsers: [],
      loading: false,
      file: null,
    };
  }

  statusOptions: IDropdownOption[] = [
    { key: 'Pending', text: 'Pending' },
    { key: 'Approved', text: 'Approved' },
    { key: 'Rejected', text: 'Rejected' },
  ];

  private _getPeoplePickerItems = (items: any[]) => {
    if (items.length > 0) {
      const selectedUserId = items[0].text;
      this.setState({ employeeName: selectedUserId });
    } else {
      this.setState({ employeeName: '' });
    }
  };

  handleInputChange = (newValue: string, field: keyof IState) => {
    this.setState({
      [field]: newValue,
    } as unknown as Pick<IState, keyof IState>);
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      this.setState({ file: event.target.files[0] });
    }
  };

  uploadFileToSharePoint = async (): Promise<string | null> => {
    const { file } = this.state;
    if (!file) return null;

    try {
      const response = await this.sp.web.getFolderByServerRelativePath("leave_doc")
        .files.addUsingPath(file.name, file, { Overwrite: true });
      return response.ServerRelativeUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const { employeeName, startDate, endDate, status, createdBy, modifiedBy } = this.state;
    this.setState({ loading: true });

    // Upload file to SharePoint and get the document link
    const documentLink = await this.uploadFileToSharePoint();

    // Prepare the leave request data
    const leaveRequest = {
      employeeName,
      startDate,
      endDate,
      status,
      createdBy,
      modifiedBy,
      documentLink,
      active: true,
      flag: 'Created',
      timestamp: new Date().toISOString(),
    };

    try {
      // Post leave request data to the API
      const response = await axios.post('https://localhost:44387/api/addLeave', leaveRequest, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Leave request added successfully:', response.data);
    } catch (error) {
      console.error('Error posting leave request:', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { startDate, endDate, status, createdBy, modifiedBy, loading } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <PeoplePicker
          context={this.peoplePickerContext}
          titleText="Select Employee"
          personSelectionLimit={3}
          groupName={""}
          showtooltip={true}
          required={true}
          disabled={false}
          searchTextLimit={5}
          onChange={this._getPeoplePickerItems}
          principalTypes={[PrincipalType.User]}
          resolveDelay={1000}
        />

        <TextField label="Start Date" type="date" value={startDate} onChange={(e, newValue) => this.handleInputChange(newValue || '', 'startDate')} required />
        <TextField label="End Date" type="date" value={endDate} onChange={(e, newValue) => this.handleInputChange(newValue || '', 'endDate')} required />
        <Dropdown label="Status" selectedKey={status} options={this.statusOptions} onChange={(e, option) => this.handleInputChange(option?.key as string, 'status')} required />
        <TextField label="Created By" value={createdBy} onChange={(e, newValue) => this.handleInputChange(newValue || '', 'createdBy')} required />
        <TextField label="Modified By" value={modifiedBy} onChange={(e, newValue) => this.handleInputChange(newValue || '', 'modifiedBy')} required />
        
        <input type="file" onChange={this.handleFileChange} style={{ marginTop: '15px' }} />

        <PrimaryButton type="submit" disabled={loading} style={{ marginTop: '15px' }}>
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </PrimaryButton>
      </form>
    );
  }
}

export default PostComponent;
