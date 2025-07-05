import React, { useState, useRef, useEffect, useLayoutEffect, cloneElement, ReactElement } from 'react';
import { createPortal } from 'react-dom';

interface DropdownProps {
  trigger: ReactElement;
  children: React.ReactNode;
  className?: string;
  onOpen?: () => void;
}

export default function Dropdown({ trigger, children, className }: DropdownProps) {
  const { onOpen } = arguments[0];
  const [isOpen, setIsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setAnchorRect(rect);
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      onOpen?.();
    }
    setIsOpen(open => !open);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !wrapperRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && anchorRect && menuRef.current) {
      const { height: mh, width: mw } = menuRef.current.getBoundingClientRect();
      let top = anchorRect.bottom;
      if (anchorRect.bottom + mh > window.innerHeight) top = anchorRect.top - mh;
      let left = anchorRect.left;
      if (anchorRect.left + mw > window.innerWidth) left = window.innerWidth - mw - 8;
      if (left < 8) left = 8;
      setMenuPosition({ top: top + window.scrollY, left: left + window.scrollX });
    }
  }, [isOpen, anchorRect]);

  const triggerEl = React.isValidElement(trigger)
    ? cloneElement(trigger, { ref: buttonRef, onClick: toggle })
    : trigger;

  return (
    <div ref={wrapperRef}>
      {triggerEl}
      {isOpen && menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className={className}
            style={{ position: 'absolute', top: menuPosition.top, left: menuPosition.left }}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}
