import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useOrders } from "../../hooks/useOrders";
import { useAuthStore } from "../../stores/authStore";
import NotificationList from "./NotificationList";

const CustomerNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Only fetch orders if authenticated
  const { data: orders } = useOrders();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isAuthenticated) return null;

  // Notification count logic
  const unreadCount = isAuthenticated ? (orders || []).filter((o) => {
    const isRecent = new Date().getTime() - new Date(o.updated_at).getTime() < 7 * 24 * 60 * 60 * 1000;
    return isRecent;
  }).length : 0;

  const handleNotificationClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 bg-[var(--color-error)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-primary)]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-2 right-2 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
          >
            {/* Notification List Container */}
            <NotificationList 
              orders={orders || []} 
              onItemClick={handleNotificationClick}
              maxHeight="320px"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerNotificationBell;
