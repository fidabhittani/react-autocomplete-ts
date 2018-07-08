import * as React from "react";
import AutoComplete from "./components/autocomplete";
import { ISingleOption } from "./components/autocomplete/typings";
import { apiUrl, headers } from "./config";
import { countries } from "./utils/countries";

import MainLayout from "./components/Layout";

import { Container, Header } from "semantic-ui-react";

interface IAppState {
  options: string[];
  selectedItem: ISingleOption;
}
class App extends React.Component<any, IAppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      options: countries,
      selectedItem: { key: 0, value: "", text: "" }
    };
  }

  /**
   * On Selecting an Item
   */

  public onSelectItem = (selectedItem: ISingleOption) => {
    this.setState({ selectedItem });
  };

  public render() {
    const { options, selectedItem } = this.state;
    return (
      <React.Fragment>
        <MainLayout>
          <Container>
            <Header as="h2">TypeScript React Autocomplete</Header>
            <form className="ui form">
              <h4 className="ui dividing header">Usage</h4>

              <div className="field">
                <div className="two fields">
                  <div className="field">
                    <label>Local Options Usage</label>
                    <AutoComplete
                      options={options}
                      constainerClass={"ui input"}
                      selectedItem={selectedItem}
                      onSelect={this.onSelectItem}
                    />
                  </div>
                  <div className="field">
                    <label>Remote Usage</label>
                    <AutoComplete
                      selectedItem={selectedItem}
                      onSelect={this.onSelectItem}
                      constainerClass={"ui input"}
                      fields={{
                        image: "avatar_url",
                        key: "id",
                        text: "login",
                        value: "login"
                      }}
                      resource={{
                        headers,
                        url: `${apiUrl}search`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="field">
                <label>Default Usage</label>
                <AutoComplete
                  options={options}
                  selectedItem={selectedItem}
                  onSelect={this.onSelectItem}
                />
              </div>
            </form>
          </Container>
        </MainLayout>
      </React.Fragment>
    );
  }
}

export default App;
