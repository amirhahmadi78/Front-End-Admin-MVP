
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  showInfo = true,
  className = ''
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`pagination-container ${className}`}>
      {showInfo && (
        <div className="pagination-info">
          <span>
            صفحه {currentPage} از {totalPages} | مجموع: {totalRecords.toLocaleString('fa-IR')} رکورد
          </span>
        </div>
      )}

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          title="صفحه قبلی"
        >
          <i className="fas fa-chevron-right"></i>
          قبلی
        </button>

        <div className="pagination-numbers">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              className={`pagination-number ${
                page === currentPage ? 'active' :
                page === '...' ? 'dots' : ''
              }`}
              onClick={() => handlePageChange(page)}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          title="صفحه بعدی"
        >
          بعدی
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
