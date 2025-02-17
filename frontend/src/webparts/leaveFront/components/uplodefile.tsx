import * as React from 'react';
import { PrimaryButton, Stack } from '@fluentui/react';
 // Define props interface

interface IFileUploadState {
  file: File | null;
  fileUploading: boolean;
}
// IFileUploadProps.ts
export interface IFileUploadProps {
    context: any; // SPFx Context
    listName: string; // The SharePoint list name where files will be uploaded
    uploadFilesTo: 'DocumentLibrary' | 'ListItem'; // Define whether files are uploaded to a document library or list item attachments
    queryString: string; // Query string parameter used to fetch the item ID (if uploading to a list item)
    fileTypes: string; // Allowed file types for upload (e.g., "jpg,png,pdf")
    digest: string;
    uploadFileToSharePoint: (file: File, itemId: number) => void; // The X-RequestDigest value for CSRF protection
  }
  
export default class FileUploadComponent extends React.Component<IFileUploadProps, IFileUploadState> {
  constructor(props: IFileUploadProps) {
    super(props);
    this.state = {
      file: null,
      fileUploading: false,
    };
  }

  handleFileUpload = (file: File) => {
    const { uploadFileToSharePoint } = this.props;
    const itemId = 123; // Example item ID, this should come from your context or query string
    uploadFileToSharePoint(file, itemId);
  };


  render() {
    const { file, fileUploading } = this.state;

    return (
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '4px' }}>
        <h3 style={{ marginTop: '0' }}>Upload Supporting Document</h3>
        <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
          <Stack.Item grow>
            <input
              type="file"
              onChange={(e) => this.handleFileChange(e.target.files ? e.target.files[0] : null)}
              style={{ width: '100%' }}
            />
          </Stack.Item>
          <PrimaryButton
       
            disabled={fileUploading || !file}
            text={fileUploading ? 'Uploading...' : 'Upload File'}
          />
        </Stack>
        {file && (
          <div style={{ marginTop: '10px', color: '#666' }}>
            Selected file: {file.name}
          </div>
        )}
      </div>
    );
  }
    handleFileChange(arg0: File | null): void {
        throw new Error('Method not implemented.');
    }
}
