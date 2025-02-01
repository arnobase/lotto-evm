import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LiveDraw.module.css';

interface LiveDrawProps {
  winningNumbers: number[];
  onComplete: () => void;
  drawNumber: string;
}

const LiveDraw: React.FC<LiveDrawProps> = ({ winningNumbers, onComplete, drawNumber }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isVisible && winningNumbers.length > 0) {
      const timeouts: NodeJS.Timeout[] = [];
      setCurrentIndex(-1);

      winningNumbers.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setCurrentIndex(index);
          
          if (index === winningNumbers.length - 1) {
            const endTimeout = setTimeout(() => {
              setIsVisible(false);
              const completeTimeout = setTimeout(onComplete, 1000);
              timeouts.push(completeTimeout);
            }, 3000);
            timeouts.push(endTimeout);
          }
        }, (index + 1) * 3000);
        
        timeouts.push(timeout);
      });

      return () => {
        timeouts.forEach(clearTimeout);
        setCurrentIndex(-1);
        setIsVisible(true);
      };
    }
  }, [isVisible, winningNumbers, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={styles.container}
        >
          <div className={styles.content}>
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={styles.title}
            >
              Live Draw #{drawNumber}
            </motion.h1>

            <div className={styles.numbersContainer}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.numberSlot}>
                  {index <= currentIndex ? (
                    <motion.div
                      initial={{ 
                        scale: 0,
                        rotateX: -180,
                        rotateY: -180
                      }}
                      animate={{ 
                        scale: 1,
                        rotateX: 0,
                        rotateY: 0
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        duration: 1,
                        bounce: 0.5
                      }}
                      className={styles.number}
                    >
                      {winningNumbers[index]}
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotateZ: [0, -5, 5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={styles.placeholder}
                    >
                      ?
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveDraw; 