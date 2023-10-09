import emojify  from 'node-emojify';

const mdLinkGlobal = /\[([\w\s\d'"]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g;
const mdLink = /\[([\w\s\d'"]+)\]\((https?:\/\/[\w\d./?=#]+)\)/;

interface LinkObject {
  linkElement: JSX.Element;
  original: string;
}

const hydrateLinkElement = (linkText: string, url: string): JSX.Element => (
  <a href={url} key={linkText.substr(0, 4)}>
    {linkText}
  </a>
);

const stripArrayToString = (array: string[]): string => (Array.isArray(array) ? array[0] : array);

const formatLinkObject = (matches: RegExpMatchArray): LinkObject[] => {
  const output: LinkObject[] = [];

  matches.forEach((element: string) => {
    const linkArray = element.match(mdLink);

    if (linkArray) {
      const linkElement = hydrateLinkElement(linkArray[1], linkArray[2]);

      output.push({
        linkElement,
        original: linkArray[0],
      });
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
