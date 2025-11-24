import { useState } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import Button from '../ui/Button'

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  variant = 'default',
}) => {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (pages[pages.length - 1] !== '...') pages.push(i)
      }

      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 my-8 animate-fade-in">
      {/* Previous */}
      <Button
        variant="glass"
        size="sm"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 disabled:opacity-30"
      >
        <IoChevronBack size={18} />
      </Button>

      {/* Pages */}
      <div className="flex gap-2">
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-3 py-2 text-gray-500 dark:text-gray-400 font-bold"
            >
              {page}
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                page === currentPage
                  ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-lg scale-110'
                  : 'glass-effect border border-white/10 text-gray-900 dark:text-white hover:border-neon-purple/50 hover:scale-105'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <Button
        variant="glass"
        size="sm"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 disabled:opacity-30"
      >
        <IoChevronForward size={18} />
      </Button>
    </div>
  )
}

export default Pagination
