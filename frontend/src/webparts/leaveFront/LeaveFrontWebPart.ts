// LeaveFrontWebPart.ts
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'LeaveFrontWebPartStrings';
import LeaveFront from './components/LeaveFront';
import { ILeaveFrontProps } from './components/ILeaveFrontProps';

export interface ILeaveFrontWebPartProps {
  description: string;  // Declare description in WebPart props
}

export default class LeaveFrontWebPart extends BaseClientSideWebPart<ILeaveFrontWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  public render(): void {
    const element: React.ReactElement<ILeaveFrontProps> = React.createElement(
      LeaveFront,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks?.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context
      }
    );
  
    ReactDom.render(element, this.domElement);
  }
  protected async onInit(): Promise<void> {
    this._environmentMessage = await this._getEnvironmentMessage();
  }

  private async _getEnvironmentMessage(): Promise<string> {
    const teamsContext = this.context.sdks?.microsoftTeams;
    
    if (teamsContext) {
      try {
        const context = await teamsContext.teamsJs.app.getContext();
        switch (context.app.host.name) {
          case 'Office':
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
          case 'Outlook':
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
          case 'Teams':
          case 'TeamsModern':
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
          default:
            return strings.UnknownEnvironment;
        }
      } catch (error) {
        console.error("Error fetching Teams context:", error);
      }
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || '');
      this.domElement.style.setProperty('--link', semanticColors.link || '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || '');
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
