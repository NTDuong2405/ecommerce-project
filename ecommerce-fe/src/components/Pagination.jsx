import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total } = meta;
  const totalPages = Math.ceil(total / limit);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 rounded-xl font-bold transition-all ${
            i === page 
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
      <div className="text-sm text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-slate-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-slate-900">{total}</span> results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
