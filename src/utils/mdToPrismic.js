import convert from '@ueno/markdown-to-prismic-richtext';
import fs from 'fs';
import matter from 'gray-matter';

const mdToPrismic = filePath => {
  const markdownContent = fs.readFileSync(filePath, 'utf8');
  const {data: frontmatter, content, ...rest} = matter(markdownContent);
  const richText = convert(content);

  return {
    ...frontmatter,
    slices: [
      {
        key: "paragraph",
        value: richText,
      },
    ],
  };
};

export default mdToPrismic;
