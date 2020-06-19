import React from 'react';
import '../css/Pagination.css';

const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
}

function Pagination({ currentPage, totalPages, paginate, loading }) {
    const LEFT_PAGE = 'LEFT';
    const RIGHT_PAGE = 'RIGHT';
    let pageNeighbours = 1
    let pages = []

    const fetchPageNumbers = () => {
        /**
         * totalNumbers: the total page numbers to show on the control
         * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
         */
        const totalNumbers = (pageNeighbours * 2) + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {

            const startPage = Math.max(2, currentPage - pageNeighbours);
            const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

            let pages = range(startPage, endPage);

            /**
             * hasLeftSpill: has hidden pages to the left
             * hasRightSpill: has hidden pages to the right
             * spillOffset: number of hidden pages either to the left or to the right
             */
            const hasLeftSpill = startPage > 2;
            const hasRightSpill = (totalPages - endPage) > 1;
            const spillOffset = totalNumbers - (pages.length + 1);

            switch (true) {
                // handle: (1) < {5 6} [7] {8 9} (10)
                case (hasLeftSpill && !hasRightSpill): {
                    const extraPages = range(startPage - spillOffset, startPage - 1);
                    pages = [LEFT_PAGE, ...extraPages, ...pages];
                    break;
                }

                // handle: (1) {2 3} [4] {5 6} > (10)
                case (!hasLeftSpill && hasRightSpill): {
                    const extraPages = range(endPage + 1, endPage + spillOffset);
                    pages = [...pages, ...extraPages, RIGHT_PAGE];
                    break;
                }

                // handle: (1) < {4 5} [6] {7 8} > (10)
                case (hasLeftSpill && hasRightSpill):
                default: {
                    pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
                    break;
                }
            }

            return [1, ...pages, totalPages];

        }

        return range(1, totalPages);

    }
    if (!totalPages || loading) return null
    pages = fetchPageNumbers()
    return (
        <nav>
            <ul className='pagination'>
                {pages.map((page, index) => {
                    if (page === LEFT_PAGE) return (
                        <li key={index} className="pagination__item">
                            <a className="pagination__link" href="#" aria-label="Previous" onClick={() => paginate(currentPage-1)}>
                                <span aria-hidden="true">&laquo;</span>
                                <span className="sr-only">Previous</span>
                            </a>
                        </li>
                    )
                    if (page === RIGHT_PAGE) return (
                        <li key={index} className="pagination__item">
                            <a className="pagination__link" href="#" aria-label="Next" onClick={() => paginate(currentPage+1)}>
                                <span aria-hidden="true">&raquo;</span>
                                <span className="sr-only">Next</span>
                            </a>
                        </li>
                    )
                    return (
                        <li key={index} className={`pagination__item`}>
                            <a className={`pagination__link ${currentPage === page ? 'pagination__link--active' : ''}`} href="#" onClick={() => paginate(page)}>{page}</a>
                        </li>
                    )
                })}

            </ul>
        </nav>);
}

export default Pagination