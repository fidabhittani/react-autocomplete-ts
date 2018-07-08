import * as React from "react";
import AutoComplete from "./components/autocomplete";
import { ISingleOption } from "./components/autocomplete/typings";
import { apiUrl, headers } from "./config";
import { countries } from "./utils/countries";
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
      <div className="App">
        <AutoComplete
          selectedItem={selectedItem}
          onSelect={this.onSelectItem}
          itemClass={"quandoo-demo-autocomplete-items"}
          inputClass={"quandoo-demo-autocomplete-input"}
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
        <AutoComplete
          options={options}
          selectedItem={selectedItem}
          onSelect={this.onSelectItem}
          itemClass={"quandoo-demo-autocomplete-items"}
          inputClass={"quandoo-demo-autocomplete-input"}
        />
      </div>
    );
  }
}

export default App;
