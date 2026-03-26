'use client';

import { useEffect, useState } from 'react';
import '../styles/pagination.css';

type PaginationProps = {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

const DEFAULT_PAGE_SIZE = 10;

export default function Pagination({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const safePageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const [inputValue, setInputValue] = useState(String(safePageSize));

    useEffect(() => {
        setInputValue(String(safePageSize));
    }, [safePageSize]);

    const startItem = totalItems === 0 ? 0 : (page - 1) * safePageSize + 1;
    const endItem = Math.min(page * safePageSize, totalItems);

    const applyPageSize = () => {
        const value = Number(inputValue);

        if (!Number.isFinite(value) || value <= 0) {
            setInputValue(String(DEFAULT_PAGE_SIZE));
            onPageSizeChange(DEFAULT_PAGE_SIZE);
            return;
        }

        const normalizedValue = Math.floor(value);
        setInputValue(String(normalizedValue));
        onPageSizeChange(normalizedValue);
    };

    return (
        <div className="pagination">
            <div className="pagination-summary">
                <p className="pagination-summary-badge">
                    {startItem}-{endItem} de {totalItems}
                </p>
                <p className="pagination-summary-numbers">
                    Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                </p>
            </div>

            <div className="pagination-controls">
                <button
                    type="button"
                    className="pagination-button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                >
                    <p className="pagination-arrow">←</p>
                    <p>Anterior</p>
                </button>

                <button
                    type="button"
                    className="pagination-button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    <p>Siguiente</p>
                    <p className="pagination-arrow">→</p>
                </button>
            </div>

            <div className="pagination-size">
                <label htmlFor="pageSize" className="pagination-label">
                    Registros por página
                </label>

                <input
                    id="pageSize"
                    type="number"
                    min={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={applyPageSize}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') applyPageSize();
                    }}
                    className="pagination-input"
                />
            </div>
        </div>
    );
}

// Example usage:
{/* <Pagination
    page={page}
    pageSize={pageSize}
    totalItems={totalItems}
    onPageChange={(newPage) => {
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    }}
    // onPageSizeChange will reset to page 1 to avoid invalid page numbers after changing page size
    onPageSizeChange={(size) => {
        const safeSize = size > 0 ? size : 10;
        setPageSize(safeSize);
        setPage(1);
    }}
/> */}