import convert from '@ueno/markdown-to-prismic-richtext';
import fs from 'fs';
import matter from 'gray-matter';

const mdToPrismic = filePath => {
  const markdownContent = fs.readFileSync(filePath, 'utf8');
  const {data: frontmatter, content, ...rest} = matter(markdownContent);
  const richText = convert(content);

  const formattedFrontmatter = Object.keys(frontmatter).reduce((acc, key) => {
    if (typeof frontmatter[key] === 'number') {
      return ({...acc, [key]: frontmatter[key].toString()})
    }

    if (typeof frontmatter[key] instanceof Date) {
      return ({...acc, [key]: frontmatter[key].toJSON()})
    }

    return ({ ...acc, [key]: frontmatter[key] })
  }, {})

  return {
    ...formattedFrontmatter,
    slices: [
      {
        key: "paragraph",
        value: {
          "variation": "default",
          "items": [{}],
          "primary": {
            content: richText,
          },
        },
      },
    ],
  };
};

export default mdToPrismic;
