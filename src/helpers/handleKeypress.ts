const changePage = (modifier:number, numberOfPages: number) => {
  const hash = location.hash.replace("#", "");
  const currentPage = hash.length === 0 ? 1 : parseInt(hash);

  // Don't go backward from page 1
  if (currentPage <= 1 && modifier === -1) {
    return false;
  }

  const newHash = currentPage + modifier;

  // Don't go beyond the last page
  if (newHash > numberOfPages || newHash < 1) {
    return false;
  }
  
  window.location.href = location.origin + location.pathname + "#" + newHash;
  
  setTimeout(() => {
    if (modifier === -1) {
      scrollToTarget(1000000)
    } else {
      scrollToTarget(0);
    }
  }, 1);
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

  const amountToScroll = findAmountToScroll(sectionHeight);
    
  const body = document.body,
        html = document.documentElement;

  const maxHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      
  const hash = location.hash.replace("#", "");

  if (event.key === "ArrowUp" && event.altKey) {
    scrollToTarget(0);

    return event.preventDefault();
  }

  if (event.key === "ArrowDown" && event.altKey) {
    scrollToTarget(maxHeight);

    return event.preventDefault();
  }

  if (event.code === "ArrowDown") {
    if (amountToScroll >= (maxHeight - sectionHeight - sectionHeight)) {
      return changePage(1, numberOfPages);
    }
    
    scrollToTarget(amountToScroll + sectionHeight);

    return event.preventDefault();
  }
  
  if (event.code === "ArrowUp") {
    if (amountToScroll <= 0 && hash !== "1" && hash !== "") {
      return changePage(-1, numberOfPages);
    }

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
