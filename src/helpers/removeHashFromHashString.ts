const removeHashFromHashString = (hashString: string) => {
  if (hashString.startsWith("#")) {
    return hashString.substring(1);
  }
  return hashString;
};

export default removeHashFromHashString;
