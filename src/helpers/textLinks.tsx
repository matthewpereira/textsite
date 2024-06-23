import emojify from "./emojiConverter";

const mdLinkGlobal = /\[([\w\s\d'"]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g;
const mdLink = /\[([\w\s\d'"]+)\]\((https?:\/\/[\w\d./?=#]+)\)/;

interface LinkObject {
  linkElement: JSX.Element;
  original: string;
}

export const hydrateLinkElement = (linkText: string, url: string): JSX.Element => (
  <a href={url} key={linkText.substring(0, 4)}>
    {linkText}
  </a>
);

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

const reconstructCaption = (caption: string, links: LinkObject[]): JSX.Element[] => {
  const output: any[] = [];

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
  

export const formatCaption = (caption: string): string | JSX.Element => {
  const linkElements = hydrateLinkElements(caption);

  if (!linkElements) {
    return emojify(caption);
  }

  const reconstructedCaption = reconstructCaption(caption, linkElements);

  const reconstructedCaptionWithEmoji = reconstructedCaption.map((captionFragment) =>
    typeof captionFragment === 'string' ? emojify(captionFragment) : captionFragment
  );

  return reconstructedCaptionWithEmoji[0];
};

export default formatCaption;
