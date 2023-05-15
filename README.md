# md-to-prismic

A simple cli tool to convert markdown files to Prismic JSON.
It supports YAML front matter to define the UID and other Custom Type fields.
Markdown files are converted to a format that can be imported into the Afosto Prismic account as a blog post.

![ezgif com-crop](https://user-images.githubusercontent.com/7714133/236067121-8683950a-5175-499d-8de4-bcea78551b9c.gif)


## Usage
Globally install the package in your machine with your prefered package manager.
```shell
npm install -g @gijsbotje/md-to-prismic
```

## Run with arguments
Instead of using the prompts you can also set arguments.

| argument             | description                                          | type                                            | default value        |
|----------------------|------------------------------------------------------|-------------------------------------------------|----------------------|
| -p, --pathToConvert  | Path of the file or folder to convert                | [string] [required]                             | [default: null]      |
| -o, --outputAs       | Output the rich text as a slice or field.            | [string] [required] [choices: "slice", "field"] | [default: null]      |
| -f, --fieldName      | ID of the field to output the richt text in          | [string] [required]                             | [default: null]      |
| -s, --sliceName      | ID of the slice to output the richt text in.         | [string] [required: when outputAs === 'slice']  | [default: null]      |
| -v, --sliceVariation | Variation of the slice to output the richt text in.  | [string] [required: when outputAs === 'slice']  | [default: "default"] |

```shell
md-to-prismic -p ./examples -o slice -f content -s paragraph
```

## Supported Markdown elements
Because of the limitations within the Prismic rich text editor,
not all elements are supported. Below is a list of all markdown
elements and how they are handled.

| Element          | Markdown Syntax                 | Support                                                                 |
|------------------|---------------------------------|-------------------------------------------------------------------------|
| Text             | `paragraph text`                | ✅                                                                       |
| Heading          | `# h1`                          | ✅                                                                       |
| Bold             | `**bold text**`                 | ✅                                                                       |
| Italic           | `*italic text*`                 | ✅                                                                       |
| Link             | `[label](https://mywebsite.com)` | ✅                                                                       |
| image            | `![alt text](image.jpg)`        | ✅                                                                       |
| Ordered list     | `1. First item`                 | ⚠️ A list can only have one level in prismic                            |
| Unordered list   | `- First item`                  | ⚠️ A list can only have one level in prismic                            |
| Inline code      | `` `code` ``                    | 🚫                                                                      |
| Horizontal rule  | `---`                            | 🚫                                                                      |


### Extended Markdown Syntax
| Element          | Markdown Syntax                                                      | Support                                                                 |
|------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------|
| Table            | table                                                                | 🚫                                                                      |
| Fenced code bock | code                                                                 | ⚠️ Adds an empty preformatted text line. Looking for a fix on this one. |
| Footnote         | `Here's a sentence with a footnote. [^1] [^1]: This is the footnote.` | 🚫                                                                      |
| Heading ID       | `### My Great Heading {#custom-id}`                                   | 🚫                                                                      |
| Definition list  | `term: definition`                                                | 🚫                                                                  |
| Strikethrough    | `~~strike though~~`                                                   |  🚫                                                                       |
| Task list        | `- [x] Write the press release`                                       | 🚫                                                                  |
| Emoji            | `smile! :joy:`                                                        |  🚫                                                                       |
| Highlight        | `highlight ==these words==.`                                          | 🚫                                                                      |
| Subscript        | `h~2~o`                                                               |  🚫                                                                       |
| Superscript      | `x^2^`                                                                 |  🚫                                                                       |



## Contributing
clone the repository to your machine.

```shell
git clone git@github.com:afosto/md-to-prismic.git
```

Install the dependencies with yarn.

```shell
npm install
```

Link the package on your local machine.

```shell
npm link
```

You can now run the package in a folder with markdown files.
```shell
md-to-prismic
```
