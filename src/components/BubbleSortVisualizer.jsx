import React, { useState, useEffect, useCallback } from 'react';
import './BubbleSortVisualizer.css';

const ARRAY_SIZE = 15;
const MIN_VAL = 5;
const MAX_VAL = 100;
const DELAY_MS = 100;

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

const BubbleSortVisualizer = () => {
  const [array, setArray] = useState(generateRandomArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the main loop (outer loop)
  const [comparisonIndex, setComparisonIndex] = useState(0); // Tracks the inner loop comparison
  const [swapped, setSwapped] = useState(false); // Tracks if a swap occurred in the current pass

  const resetArray = useCallback(() => {
    setArray(generateRandomArray());
    setIsSorted(false);
    setIsSorting(false);
    setCurrentIndex(0);
    setComparisonIndex(0);
    setSwapped(false);
  }, []);

  const stepBubbleSort = useCallback(() => {
    if (isSorted) return;

    let i = currentIndex;
    let j = comparisonIndex;
    const n = array.length;
    let newArray = [...array];
    let currentSwapped = swapped;

    if (i < n - 1) {
      if (j < n - i - 1) {
        if (newArray[j] > newArray[j + 1]) {
          [newArray[j], newArray[j + 1]] = [newArray[j + 1], newArray[j]];
          currentSwapped = true;
        }
        setComparisonIndex(j + 1);
      } else {
        // Inner loop finished
        if (!currentSwapped && i > 0) { // Optimization: if no swaps in a pass, array is sorted
          setIsSorted(true);
          setIsSorting(false);
          setArray(newArray);
          return;
        }
        setCurrentIndex(i + 1);
        setComparisonIndex(0);
        currentSwapped = false; // Reset for next pass
      }
    } else {
      // All passes done
      setIsSorted(true);
      setIsSorting(false);
    }
    setArray(newArray);
    setSwapped(currentSwapped);
  }, [array, currentIndex, comparisonIndex, isSorted, swapped]);

  useEffect(() => {
    if (isSorting && !isSorted) {
      const timer = setTimeout(stepBubbleSort, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSorting, isSorted, stepBubbleSort]);

  const startSort = () => {
    if (isSorted) resetArray(); // If already sorted, reset before starting again
    setIsSorting(true);
  };

  const stopSort = () => {
    setIsSorting(false);
  };

  return (
    <div className="bubble-sort-visualizer">
      <div className="controls">
        <button onClick={resetArray} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepBubbleSort} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="array-container">
        {array.map((value, idx) => (
          <div
            className={`array-bar ${idx === comparisonIndex || idx === comparisonIndex + 1 ? 'comparing' : ''} ${isSorted ? 'sorted' : ''}`}
            key={idx}
            style={{ height: `${value * 3}px` }}
          >
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BubbleSortVisualizer;
