import emojify  from 'node-emojify';
import { validateMarkdownUrl, sanitizeLinkText } from './validateMarkdownUrl';

// Improved regex to match markdown links with better URL pattern
// Matches: [link text](url)
// Link text: Any characters except ]
// URL: Any non-whitespace characters except )
const mdLinkGlobal = /\[([^\]]+)\]\(([^\s)]+)\)/g;
const mdLink = /\[([^\]]+)\]\(([^\s)]+)\)/;

interface LinkObject {
  linkElement: JSX.Element;
  original: string;
}

const hydrateLinkElement = (linkText: string, url: string): JSX.Element | null => {
  // Validate URL for security
  if (!validateMarkdownUrl(url)) {
    console.warn('Invalid or unsafe URL detected in markdown link:', url);
    // Return plain text instead of link for security
    return <span key={linkText.substring(0, 4)}>{sanitizeLinkText(linkText)}</span>;
  }

  // Sanitize link text to prevent XSS
  const safeLinkText = sanitizeLinkText(linkText);

  return (
    <a href={url} key={linkText.substring(0, 4)} rel="noopener noreferrer" target="_blank">
      {safeLinkText}
    </a>
  );
};

const stripArrayToString = (array: string[]): string => (Array.isArray(array) ? array[0] : array);

const formatLinkObject = (matches: RegExpMatchArray): LinkObject[] => {
  const output: LinkObject[] = [];

  matches.forEach((element: string) => {
    const linkArray = element.match(mdLink);

    if (linkArray) {
      const linkElement = hydrateLinkElement(linkArray[1], linkArray[2]);

      // Only add if linkElement is not null (passed validation)
      if (linkElement) {
        output.push({
          linkElement,
          original: linkArray[0],
        });
      }
    }
  });

  return output;
};

const hydrateLinkElements = (cleanCaption: string): false | LinkObject[] => {
  const matches = cleanCaption.match(mdLinkGlobal);

  return matches ? formatLinkObject(matches) : false;
};

const formatCaption = (caption: string, links: LinkObject[]): JSX.Element[] => {
    const output: JSX.Element[] = [];
  
    let remainingCaption = caption;
  
    links.forEach((element) => {
      const parts = remainingCaption.split(element.original);
      output.push(emojify(parts[0])); // Convert plain text before link to JSX
      output.push(element.linkElement);
      remainingCaption = parts.slice(1).join(element.original); // Reconstruct the remaining caption
    });
  
    // Add the final part of the caption after the last link
    output.push(emojify(remainingCaption));
  
    return output;
  };
  

const parseStringForLinks = (caption: string): JSX.Element[] => {
  const cleanCaption = stripArrayToString([caption]);

  const linkElements = hydrateLinkElements(cleanCaption);

  if (!linkElements) {
    return [emojify(cleanCaption)];
  }

  const formattedCaption = formatCaption(cleanCaption, linkElements);

  const formattedCaptionWithEmoji = formattedCaption.map((captionFragment) =>
    typeof captionFragment === 'string' ? emojify(captionFragment) : captionFragment
  );

  return formattedCaptionWithEmoji;
};

export default parseStringForLinks;
