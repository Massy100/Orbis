import React, { useEffect } from "react";
import "../styles/sidebar-drop-down.css";




type SidebarDropDownProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    width?: number; // px
    children: React.ReactNode;
};

export default function SidebarDropDown({
    open,
    onClose,
    title,
    width = 420,
    children,
}: SidebarDropDownProps) {
    useEffect(() => {
        if (!open) return;

        // Press esc to close
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <div
            className={`sidebar-drop-down-general ${open ? "sidebar-drop-down-open" : ""}`}
            aria-hidden={!open}
        >
            <div className="sidebar-drop-down-overlay" onClick={onClose} />

            <aside
                className="sidebar-drop-down-panel"
                role="dialog"
                aria-modal="true"
                aria-label={title ?? "Panel"}
                style={{ width: `min(${width}px, 100vw)` }}
            >
                <div className="sidebar-drop-down-header">
                    <h2 className="sidebar-drop-down-title">{title}</h2>
                    <button className="sidebar-drop-down-close" onClick={onClose} type="button">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg>
                    </button>
                </div>

                <div className="sidebar-drop-down-body">{children}</div>
            </aside>
        </div>
    );
}
