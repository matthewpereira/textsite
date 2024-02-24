const changePage = (modifier:number, numberOfPages: number) => {
  const search = location.search;
  const hash = location.hash.replace("#", "");

  if (hash.length === 0 && modifier === -1) {
    return false;
  }

  if (hash === "1" && modifier === -1) {
    return false;
  }

  const newHash = hash.length !== 0 ? parseInt(hash) + modifier : 2;

  if (newHash > numberOfPages) {
    return false;
  }

  window.location.href = location.origin + "/" + search + "#" + newHash;
  scrollToTarget(0);
}

const findAmountToScroll = (sectionHeight: number): number => {
  // Find current scroll distance from top of doc
  const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

  // Find number of gallery sections between first section and current position
  const scrollMultiplier = Math.round(currentScrollTop / window.innerHeight);

  if (currentScrollTop === sectionHeight) {
    return sectionHeight;
  }

  // If at the top of the doc, just move one screen down
  if (currentScrollTop < sectionHeight) {
    return 0;
  }

  // Otherwise, add the whole gallery height as well
  const galleryHeight = sectionHeight * scrollMultiplier;

  return galleryHeight;
}

const scrollToTarget = (newScrollTop: number): number =>
  document.body.scrollTop = document.documentElement.scrollTop = newScrollTop;

const HandleScrollKeypress = (event: KeyboardEvent, numberOfPages: number) => {
  const sectionHeight = window.innerHeight;

  const amountToScroll = findAmountToScroll(sectionHeight)

  if (event.key === "ArrowUp" && event.altKey) {
    scrollToTarget(0);

    return event.preventDefault();
  }

  if (event.key === "ArrowDown" && event.altKey) {
    const body = document.body,
          html = document.documentElement;
    const maxHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    scrollToTarget(maxHeight);

    return event.preventDefault();
  }

  if (event.code === "ArrowDown") {
    scrollToTarget(amountToScroll + sectionHeight);

    return event.preventDefault();
  }
  
  if (event.code === "ArrowUp") {
    scrollToTarget(amountToScroll - sectionHeight);

    return event.preventDefault();
  }
  
  if (event.code === "ArrowRight") {
    changePage(1, numberOfPages);
  }
  
  if (event.code === "ArrowLeft") {
    changePage(-1, numberOfPages);
  }

}

export default HandleScrollKeypress;