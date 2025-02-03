import { WebPartContext } from "@microsoft/sp-webpart-base";

// ILeaveFrontProps.ts
export interface ILeaveFrontProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context:WebPartContext
}
