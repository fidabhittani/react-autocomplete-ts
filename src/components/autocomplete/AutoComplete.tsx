import * as React from "react";

import axios from "axios";

import "./autocomplete.css";
import { IAutoCompleteProps, ISingleOption } from "./typings";

/**
 * Sorting the option collection. Sorting internally will make the component less dependent on outside of components
 * and imports statements.
 */
export const sortOptions = (a: ISingleOption, b: ISingleOption) => {
  if (a.text < b.text) {
    return -1;
  }
  if (a.text > b.text) {
    return 1;
  }
  return 0;
};

export default class AutoComplete extends React.Component<
  IAutoCompleteProps,
  any
> {
  public searchInputField: any;
  public autoCompleteContainer: any;
  public autocompleteItem: any;
  /**
   * Consturctor to initialize state
   * @param props
   */
  constructor(props: IAutoCompleteProps) {
    super(props);
    this.state = {
      currentlyfocused: 0,
      filteredOptions: [],
      options: this.prepareAutocompleteOptions(props.options || []).sort(
        sortOptions
      ),
      searchValue: "",
      selectedItem: props.selectedItem || {}
    };
    // Creating refs
    this.searchInputField = React.createRef();
    this.autoCompleteContainer = React.createRef();
    this.autocompleteItem = React.createRef();
    // Debouncing the Server requests
    this.processRemoteChange = this._debounce(
      this.processRemoteChange,
      200,
      false
    );
  }
  public componentDidMount() {
    console.log("mounte complete");
  }

  /**
   * Custom debounce function to ignore immediate hits on change to the server. debounce will respond to events
   * generated in a certain interval, very necessary for events like these, when we need to fire up api requests on
   * change. It ensures better UX.
   * @param func
   * @param wait
   * @param immediate
   */
  public _debounce(func: any, wait: number, immediate: boolean) {
    let timeout: any;
    return (): any => {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) {
          func.apply(context);
        }
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context);
      }
    };
  }
  /**
   * As options either from an API or local options needed to be mapped to formed an object array, and if already an object array
   * then add three more keys {key, value, text}. which the component use internally to indetify different items and display the
   * value being specified on the UI.
   * These 3 fields are custom and can be provided through field props.
   */
  public prepareAutocompleteOptions = (options: any) => {
    const { fields }: any = this.props;
    return (
      (options &&
        options.map((option: any, index: number) => {
          const isObject = typeof option === "object";
          const newOption = {
            image: isObject ? option[fields.image || ""] : "",
            key: isObject ? option[fields.key] : `${option}-${index}`,
            text: isObject ? option[fields.text] : option,
            value: isObject ? option[fields.value] : option
          };
          if (isObject) {
            return {
              ...option,
              ...newOption
            };
          }
          return newOption;
        })) ||
      []
    );
  };

  /**
   * Handle Key Down events:
   * Key down events for : Arrow UP (38) Arrow Down (13) Enter(27) Esc (27).
   * Here this will control the navigation and if some item is pressed with enter, it will get selected
   * and be set on the on the implementers function.
   */

  public handleKeyDown = (event: any) => {
    const keysOfInterest: number[] = [38, 40, 13, 27];
    const { filteredOptions } = this.state;
    // We will skip the rest of the keydowns except for the ones we care.
    if (keysOfInterest.includes(event.keyCode)) {
      let { currentlyfocused } = this.state;
      this.autoCompleteContainer.current.focus();
      if (event.keyCode === 38) {
        currentlyfocused--;
      }
      if (event.keyCode === 40) {
        currentlyfocused++;
      }
      // If we get enter on the input field
      if (event.keyCode === 13 && this.autocompleteItem.current) {
        this.autocompleteItem.current.click();
      }
      // If we get ESC on the input field
      if (event.keyCode === 27 && this.autocompleteItem.current) {
        this.setState({
          filteredOptions: []
        });
        this.autocompleteItem.current.focus();
      }

      if (currentlyfocused < 0) {
        currentlyfocused = filteredOptions.length;
      }

      if (currentlyfocused > filteredOptions.length) {
        currentlyfocused = 1;
      }

      this.setState({ currentlyfocused }, () => {
        console.info("index updated to :", currentlyfocused);
      });
    }
  };
  /**
   * Process Change is an implementation which will fire up when a resource is not defined, it will look for the local options
   * array being provide, starts searching and filtering the local options arrays. there is no api request involved.
   */
  public processChange = (value: string) => {
    const { options } = this.state;
    let { currentlyfocused } = this.state;

    const filteredOptions = options
      .filter((option: any) => {
        return option.text
          .toLocaleLowerCase()
          .startsWith(value.toLocaleLowerCase());
      })
      .sort(sortOptions);
    if (filteredOptions.length > 0) {
      currentlyfocused = 1;
    }
    this.setState({ searchValue: value, filteredOptions, currentlyfocused });
  };
  /**
   * This is just a simple catch handle implementation, Generally an elegant way of handling erros from api will be to
   * use a global handler for all resource/api requests. which can setup erros someehere in redux or something
   * and a Message compoenent is then used to display those messages.
   */
  public handleResourceErrors = (error: any) => {
    // TODO: pass in global handlers for errors
    if (error.response) {
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log(error.message);
    }
    console.log(error.config);
  };
  /**
   * Here we are actually making an async request to the resource specified to fullfill the need of the
   * ProcessRemoteChange. Async/Await is being used here instead of a promise callback to make it look
   * more synchronous and enclosed it inside of try catch.
   */
  public getResourceData = async (search: string) => {
    try {
      const { resource } = this.props;
      const { url, headers } = resource || { url: "", headers: {} };
      const response: any = await axios.get(`${url}/users?q=${search}`, {
        headers
      });
      const {
        data: { items = [] }
      } = response;
      return items;
    } catch (error) {
      this.handleResourceErrors(error);
      this.setState({ filteredOptions: [], searchValue: "" });
    }
  };

  /**
   * HandleChange will pass on control to this function in case of when we have a resource props defined
   * this will initiate an ajax call to the resource mentioned with options in the resource. we have placed axios
   * as a dependency on this component, to make it able to do ajax calls to the resources.
   * This will fire up a loader, for now its just text, but a loader can be defined for it from the UI tool kit which
   * implements it.
   * The function will map the values and add certain keys to it {key, text, value} which will be specified in the field props.
   * This will enable the autocomplete to show the text specified on the fields props and identify the resource by the defined key field.
   */

  public processRemoteChange = async () => {
    const { searchValue } = this.state;
    let { currentlyfocused } = this.state;

    let filteredOptions = [];
    filteredOptions.push({ disabled: true });
    this.setState({ searchValue, filteredOptions });
    const items: any = await this.getResourceData(searchValue);
    filteredOptions = this.prepareAutocompleteOptions(items);
    if (filteredOptions.length > 0) {
      currentlyfocused = 1;
    }
    this.setState({ filteredOptions, currentlyfocused });
  };

  /**
   * Handle any changes on the Input field, When some input is detected we will see if we have a remote resource
   * in case there is no remote resource on the props we will initiate the local options process on the dropdown
   * autocomplete
   */

  public handleChange = (e: any) => {
    const searchValue = e.target.value;
    const { resource } = this.props;
    const { onSelect } = this.props;
    const { selectedItem } = this.state;
    if (onSelect && (selectedItem.key !== 0 || !searchValue)) {
      onSelect({ key: 0, text: "", value: "" });
    }

    if (!searchValue) {
      this.setState({ filteredOptions: [], searchValue: "" });
      return;
    }

    this.setState({ searchValue });
    // If remote resource is configured than process remote
    if (resource && resource.url) {
      this.processRemoteChange();
      return;
    }
    this.processChange(searchValue);
  };
  /**
   * When a certain item in the list is click we will select its value and pass it on to the component which is
   * implementing it, the component which implements the autocomplete will provide an api/function which will then
   * get the selected value to the implementer.
   */
  public getValue = (searchValue: any) => {
    const { onSelect } = this.props;
    this.setState({ searchValue: searchValue.text, filteredOptions: [] });
    if (onSelect) {
      onSelect(searchValue);
    }
    this.searchInputField.current.focus();
  };

  /**
   * When clicked away from the input we will get rid of the autocomplete and disable the list of items
   * we can do a cache on the results from API but that is not implemented to keep it simple for now
   */
  public onInputBlur = () => {
    this.setState({
      filteredOptions: []
    });
  };

  /**
   * Render can be split down to further more components, but this component will be less touched, and the implementer
   * component will provide the props to make it function
   */
  public render() {
    const {
      filteredOptions: options,
      currentlyfocused: cf,
      selectedItem
    } = this.state;
    const { activeClass, itemClass, inputClass, constainerClass } = this.props;
    let { searchValue } = this.state;
    if (selectedItem.key) {
      searchValue = selectedItem.text;
    }
    return (
      <div className={`search-complete-quandoo ${constainerClass}`}>
        <input
          type="text"
          className={inputClass}
          ref={this.searchInputField}
          placeholder="Search"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onClick={this.handleChange}
          autoFocus={true}
          onBlur={this.onInputBlur}
          value={searchValue}
          style={{
            width: "100%"
          }}
        />

        <div
          className={itemClass || "search-complete-quandoo-items"}
          ref={this.autoCompleteContainer}
          style={{
            background: "#ffffff",
            left: 0,
            maxHeight: "400px",

            overflowX: "hidden",
            overflowY: "auto",
            position: "absolute",
            right: 0,
            top: "100%",
            zIndex: 99
          }}
        >
          {options &&
            options.length > 0 &&
            options.map((option: ISingleOption, index: number) => {
              const { text, image } = option;
              console.log(image);

              const nI = index + 1;
              if (option.disabled) {
                return <div>Loading...</div>;
              }
              return (
                <div
                  onClick={this.getValue.bind(null, option)}
                  onKeyPress={this.handleKeyDown}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    width: "100%"
                  }}
                  key={"option-" + index}
                  ref={nI === cf ? this.autocompleteItem : null}
                  className={
                    nI === cf ? activeClass || "search-complete-active" : ""
                  }
                >
                  {image && (
                    <img
                      src={image}
                      width={20}
                      style={{
                        paddingRight: "10px",
                        verticalAlign: "middle"
                      }}
                    />
                  )}
                  <strong>{text.substr(0, searchValue.length)}</strong>
                  {text.substr(searchValue.length)}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
