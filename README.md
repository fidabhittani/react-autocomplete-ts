# Typescript Autocomplete

Follwing technologies were used to develop the autocomplete

- React 16+
- Typescript 2.8+

## Installation

```
npm install
npm start
```

### Requirements

- Nodejs > 8
- npm > 5

# Usage

- Default Usage.

```sh
<AutoComplete
  options={options}
  selectedItem={selectedItem}
  onSelect={this.onSelectItem}
/>
```

- Local options usage / Css classes

```sh
<AutoComplete
  options={options}
  constainerClass={"container-auto"}
  itemClass={"auto-item"}
  activeClass={"active"}
  selectedItem={selectedItem}
  onSelect={this.onSelectItem}
/>
```

- Remote Options/API usage

```sh
<AutoComplete
  options={options}
  constainerClass={"container-auto"}
  itemClass={"auto-item"}
  activeClass={"active"}
  selectedItem={selectedItem}
  onSelect={this.onSelectItem}
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
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
