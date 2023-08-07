import React          from 'react';
import { withRouter } from 'react-router';
import { Link }       from 'react-router-dom';

import styles         from './Pagination.module.scss';

const PrevButton = ({ currentPage, pathName }) => {
    if (parseInt(currentPage) < 2) {
        return null;
    }

    return (
        <div className={styles.gallery__pageArrow}>
            <Link to={`${pathName}#${currentPage - 1}`}>&lt;</Link>
        </div>
    )
};

const NextButton = ({currentPage, pageCount, pathName }) => {
    if (currentPage >= pageCount) {
        return null;
    }

    return (
        <div className={styles.gallery__pageArrow}>
            <Link to={`${pathName}#${parseInt(currentPage) + 1}`}>&gt;</Link>
        </div>
    )
};

const PageNumber = ({ currentPage, pageNumber, pathName }) => {
    if (currentPage.toString() === pageNumber.toString()) {
        return (
            <div className={styles.gallery__pageNumber__current}>
                {pageNumber}
            </div>
        );
    }

    return (
        <div className={styles.gallery__pageNumber}>
            <Link to={`${pathName}#${pageNumber}`}>{pageNumber}</Link>
        </div>
    )
}

const Pagination = ({ currentPage, pageCount, location }) => {
    if (pageCount < 2) {
        return null;
    }

    let pageNumbers = [];

    for (let i = 0; i < pageCount; i++) {
        pageNumbers.push(i + 1);
    }

    return (
        <div className={styles.gallery__pagination}>
            <PrevButton
                currentPage={parseInt(currentPage)}
                pageCount={parseInt(pageCount)}
                pathName={location.search}
            />
            {pageNumbers.map(pageNumber =>
                <PageNumber
                    key={pageNumber}
                    pageNumber={pageNumber}
                    currentPage={currentPage}
                    pageCount={pageCount}
                    pathName={location.search}
                />
            )}
            <NextButton
                currentPage={currentPage}
                pageCount={pageCount}
                pathName={location.search}
            />
        </div>
    );
  }

  export default withRouter(Pagination);