<div align="center">
  <h1>GraphQL Network Inspector</h1>
  <h3>A better network inspector for viewing and debugging GraphQL requests.</h3>
  <img alt="MIT License" src="https://img.shields.io/github/license/warrenday/graphql-network-inspector" />
  <a href="https://twitter.com/warrenjday">
    <img alt="Twitter" src="https://img.shields.io/twitter/url.svg?label=%40warrenjday&style=social&url=https%3A%2F%2Ftwitter.com%2Fwarrenjday" />
  </a>
  <br />
  <br />
</div>

![Application Preview](docs/main.jpg)

A platform agnostic network inspector specifically built for GraphQL. Clearly see individual GraphQL requests including support for query batching.

The plugin is available for both Chrome and Firefox:

1. [Chrome Webstore](https://chrome.google.com/webstore/detail/graphql-network-inspector/ndlbedplllcgconngcnfmkadhokfaaln)

2. [Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/graphql-network-inspector)

## Local Development

Install dependencies:

```bash
yarn
```

Run the development server:

```bash
yarn start
```

You can also test the extension in the browser by running:

```bash
yarn build --watch
```

Then load the `build` directory as an unpacked extension in your browser. Changes will be loaded automatically, however to see the changes you will need to close and reopen devtools.

## Contribute

PRs are welcome! The best way to do this is to first fork the repository, create a branch and open a pull request back to this repository.

If you want to add a large feature please first raise an issue to discuss. This avoids wasted effort.

## License

The MIT License (MIT)

Copyright (c) 2020 GraphQL Network Inspector authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
