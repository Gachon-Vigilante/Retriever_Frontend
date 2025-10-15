import React from "react";
import styles from "../css/components/GraphErrorModal.module.css";

const GraphErrorModal = ({ open, message, onClose }) => {
    if (!open) return null;
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
                {message}
                <div>
                    <button className={styles.closeButton} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphErrorModal;
