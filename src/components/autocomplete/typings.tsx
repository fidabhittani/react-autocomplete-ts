/**
 * Single Option to Autocomplete interface
 */
export interface ISingleOption {
  disabled?: string;
  image?: string;
  key: string | number;
  text: string;
  value: string;
}
/**
 * Remote resource
 */
export interface IRemoteResource {
  url: string;
  headers?: any;
}
/**
 * IAutoCompleteList Interface
 */
export interface IAutoCompleteList {
  itemClass?: string;
  activeClass?: string;
  cf: number;
  autocompleteItem: any;
  searchValue?: string;
  autoCompleteContainer: any;
  options?: ISingleOption[];
  handleKeyDown: any;
  getValue: any;
}
/**
 * Props to autocomplete interface
 */
export interface IAutoCompleteProps {
  children?: React.ReactNode;
  constainerClass?: string;
  options?: ISingleOption[] | string[];
  selectedItem?: ISingleOption;
  onSelect?: any;
  activeClass?: string;
  itemClass?: string;
  inputClass?: string;
  resource?: IRemoteResource;
  fields?: ISingleOption;
}
