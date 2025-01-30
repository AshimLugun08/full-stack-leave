import * as React from 'react';
import styles from './LeaveFront.module.scss';
import type { ILeaveFrontProps } from './ILeaveFrontProps';
import PostComponent from './postleave'; // Importing the PostComponent from postdata
import GetDataComponent from './getcomp';
import LeaveDetailsComponent from './getidcomp'; // Importing the new LeaveDetailsComponent

export default class LeaveFront extends React.Component<ILeaveFrontProps> {
  private redirectToPostData = (): void => {
    window.location.href = 'https://366pidev.sharepoint.com/sites/Ashim_Team_Site/_layouts/15/workbench.aspx/postdata';
  };

  private redirectToHome = (): void => {
    window.location.href = 'sites/Ashim_Team_Site/_layouts/15/workbench.aspx';
  };

  public render(): React.ReactElement<ILeaveFrontProps> {
    const { hasTeamsContext } = this.props;
    const currentPath: string = window.location.pathname.toString();

    return (
      <section className={`${styles.leaveFront} ${hasTeamsContext ? styles.teams : ''}`}>
        <h2>Leave Request</h2>
        <button onClick={this.redirectToPostData} className={styles.redirectButton}>Go to Post Data</button>
        <button onClick={this.redirectToHome} className={styles.redirectButton}>Go to Home</button>

        {/* Render PostComponent when URL contains '/postdata' */}
        {currentPath.indexOf('/postdata') !== -1 && <PostComponent />}

        {/* Render GetDataComponent when URL contains '/workbench.aspx' and not '/postdata' or '/item-details/' */}
        {currentPath.indexOf('/workbench.aspx') !== -1 && currentPath.indexOf('/postdata') === -1 && currentPath.indexOf('/item-details/') === -1 && <GetDataComponent />}

        {/* Render LeaveDetailsComponent when URL contains '/item-details/' */}
        {currentPath.indexOf('/item-details/') !== -1 && <LeaveDetailsComponent />}
      </section>
    );
  }
}
