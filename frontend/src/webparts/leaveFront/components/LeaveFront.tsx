import * as React from 'react';
import styles from './LeaveFront.module.scss';
import PostComponent from './postleave';
import GetDataComponent from './getcomp';
import LeaveDetailsComponent from './getidcomp';
import { ILeaveFrontProps } from './ILeaveFrontProps';


export default class LeaveFront extends React.Component<ILeaveFrontProps> {
  private redirectToPostData = (): void => {
    window.location.href = 'https://366pidev.sharepoint.com/sites/Ashim_Team_Site/_layouts/15/workbench.aspx/postdata';
  };

  private redirectToHome = (): void => {
    window.location.href = 'https://366pidev.sharepoint.com/sites/Ashim_Team_Site/_layouts/15/workbench.aspx';
  };

  public render(): React.ReactElement<ILeaveFrontProps> {
    const { hasTeamsContext,context } = this.props;
    const currentPath: string = window.location.pathname.toString();

    const isPostDataPage = currentPath.indexOf('/postdata') !== -1;
    const isWorkbenchPage = currentPath.indexOf('/workbench.aspx') !== -1 && !isPostDataPage && currentPath.indexOf('/item-details/') === -1;
    const isItemDetailsPage = currentPath.indexOf('/item-details/') !== -1;

    return (
      <section className={`${styles.leaveFront} ${hasTeamsContext ? styles.teams : ''}`}>
        <h2>Leave Request</h2>
        <button onClick={this.redirectToPostData} className={styles.redirectButton}>Go to Post Data</button>
        <button onClick={this.redirectToHome} className={styles.redirectButton}>Go to Home</button>

        {isPostDataPage && <PostComponent context={context}/>}
        {isWorkbenchPage && <GetDataComponent />}
        {isItemDetailsPage && <LeaveDetailsComponent />}
      </section>
    );
  }
}