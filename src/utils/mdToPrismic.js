import convert from '@ueno/markdown-to-prismic-richtext';
import fs from 'fs';
import matter from 'gray-matter';
import chalk from "chalk";
import path from "path";

const requiredFields = ['type', 'uid', 'lang'];

const mdToPrismic = filePath => {
  const markdownContent = fs.readFileSync(filePath, 'utf8');
  const {data: frontmatter, content} = matter(markdownContent);
  const richText = convert(content);
  const frontmatterKeys = Object.keys(frontmatter);


  const missingFields = requiredFields.reduce((acc, field) => {
    if (frontmatterKeys.includes(field)) return acc;
    return [...acc, field];
  }, []);

  if (missingFields.length > 0) {
    console.log(chalk.red(`missing fields ${missingFields.join(', ')} in ${path.basename(filePath)}`));
    return null;
  }

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
