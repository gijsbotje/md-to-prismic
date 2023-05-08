import convert from '@ueno/markdown-to-prismic-richtext';
import fs from 'fs';
import matter from 'gray-matter';
import chalk from "chalk";
import path from "path";

const requiredFields = ['type', 'lang'];

const mdToPrismic = (filePath, {fieldName, sliceName, sliceVariation, outputAs}) => {
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

  if (outputAs === 'slice') {

    return {
      ...formattedFrontmatter,
      slices: [
        {
          key: sliceName,
          value: {
            "variation": sliceVariation,
            "items": [{}],
            "primary": {
              [fieldName]: richText,
            },
          },
        },
      ],
    };
  }

  return {
    ...formattedFrontmatter,
    [fieldName]: richText,
  };
};

export default mdToPrismic;
