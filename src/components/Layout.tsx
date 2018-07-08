import * as React from "react";
import { Grid, Menu } from "semantic-ui-react";

export interface IProps {
  children?: React.ReactNode;
}
/**
 * Application layout component
 */
const Layout = ({ children }: IProps) => {
  return (
    <div>
      <Grid.Row columns={1}>
        <Grid.Column>
          <Menu>
            <Menu.Item header={true}>feeda apps</Menu.Item>
            <Menu.Item name="demo" />
          </Menu>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row columns={1}>
        <Grid.Column>
          <div className="body">{children}</div>
        </Grid.Column>
      </Grid.Row>
    </div>
  );
};
export default Layout;
