# md-to-prismic

A simple cli tool to convert markdown files to Prismic JSON.
It supports YAML frontmatter to define the UID and document title.
Markdown files are converted to a format that can be imported into the Afosto Prismic account as a blog post.

![ezgif com-crop](https://user-images.githubusercontent.com/7714133/236067121-8683950a-5175-499d-8de4-bcea78551b9c.gif)


## Usage
clone the respository to your machine.

```shell
git clone git@github.com:afosto/md-to-prismic.git
```

Install the dependencies with yarn.

```shell
yarn install
```

Link the package on your local machine.

```shell
yarn link
```

You can now run the package in a folder with makdown files.
```shell
md-to-prismic
```
