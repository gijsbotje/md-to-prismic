import convert from '@gijsbotje/md-to-prismic-richtext';
import matter from 'gray-matter';
import chalk from "chalk";

const requiredFields = ['type', 'lang'];

const mdToPrismic = (markdown, {fileName, fieldName, sliceName, sliceVariation = 'default', outputAs} = {}) => {
  const {data: frontmatter, content} = matter(markdown);
  const richText = convert(content);
  const frontmatterKeys = Object.keys(frontmatter);


  const missingFields = requiredFields.reduce((acc, field) => {
    if (frontmatterKeys.includes(field)) return acc;
    return [...acc, field];
  }, []);

  if (missingFields.length > 0) {
    console.log(chalk.red(`missing fields ${missingFields.join(', ')}${fileName ? ` in ${fileName}` : ''}`));
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
