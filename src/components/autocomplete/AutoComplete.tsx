import * as React from "react";

import axios from "axios";

import "./autocomplete.css";
import { IAutoCompleteProps, ISingleOption } from "./typings";

/**
 * Sorting the option collection
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
  /**
   *  Custom debounce function
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
   * Prepare collection for the UI
   */
  public prepareAutocompleteOptions = (options: any) => {
    const { fields }: any = this.props;
    return options.map((option: any, index: number) => {
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
    });
  };

  /**
   * Handle Key Down events
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
   * Process Change
   */
  public processChange = (value: string) => {
    const { options } = this.state;
    const filteredOptions = options
      .filter((option: any) => {
        return option.text
          .toLocaleLowerCase()
          .startsWith(value.toLocaleLowerCase());
      })
      .sort(sortOptions);
    this.setState({ searchValue: value, filteredOptions });
  };
  /**
   * Handle Resource erros
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
   * Getting resourse data
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
      this.setState({ filteredOptions: [], searchValue: "" });
    }
  };

  /**
   * Process Remote onChange
   */

  public processRemoteChange = async () => {
    const { searchValue } = this.state;
    const { fields }: any = this.props;
    let filteredOptions = [];
    filteredOptions.push({
      disabled: true,
      key: 0,
      text: "Loading...",
      value: "Loading..."
    });

    this.setState({ searchValue, filteredOptions });
    const items: any = await this.getResourceData(searchValue);
    filteredOptions =
      items &&
      items.map((item: any) => {
        return {
          ...item,
          image: item[fields.image || ""],
          key: item[fields.key],
          text: item[fields.text],
          value: item[fields.value]
        };
      });
    this.setState({ filteredOptions });
  };

  /**
   * Handle any changes on the Input field
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
   * Get values when clicked
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
   * On Blur
   */
  public onInputBlur = () => {
    this.setState({
      filteredOptions: []
    });
  };
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
