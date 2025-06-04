import React, { useState, useEffect, useCallback } from 'react';
import './SelectionSortVisualizer.css'; // We'll create this CSS file

const ARRAY_SIZE = 15;
const MIN_VAL = 5;
const MAX_VAL = 100;
const DELAY_MS = 150;

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

const SelectionSortVisualizer = () => {
  const [array, setArray] = useState(generateRandomArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Outer loop: marks the start of the unsorted part
  const [comparisonIndex, setComparisonIndex] = useState(1); // Inner loop: finds the minimum in the unsorted part
  const [minIndex, setMinIndex] = useState(0); // Index of the current minimum element found

  const resetArray = useCallback(() => {
    setArray(generateRandomArray());
    setIsSorted(false);
    setIsSorting(false);
    setCurrentIndex(0);
    setComparisonIndex(1);
    setMinIndex(0);
  }, []);

  const stepSelectionSort = useCallback(() => {
    if (isSorted) return;

    let i = currentIndex;
    let j = comparisonIndex;
    let currentMinIdx = minIndex;
    const n = array.length;
    let newArray = [...array];

    if (i < n - 1) {
      if (j < n) {
        if (newArray[j] < newArray[currentMinIdx]) {
          currentMinIdx = j;
        }
        setComparisonIndex(j + 1);
        setMinIndex(currentMinIdx);
      } else {
        // Inner loop finished, swap if minIndex is different from i
        if (currentMinIdx !== i) {
          [newArray[i], newArray[currentMinIdx]] = [newArray[currentMinIdx], newArray[i]];
        }
        // Move to the next position for the outer loop
        const nextI = i + 1;
        setCurrentIndex(nextI);
        setComparisonIndex(nextI + 1);
        setMinIndex(nextI);
        if (nextI >= n - 1) { // Check if sorting is complete after this pass
          setIsSorted(true);
          setIsSorting(false);
        }
      }
    } else {
      // Sorting is complete
      setIsSorted(true);
      setIsSorting(false);
    }
    setArray(newArray);
  }, [array, currentIndex, comparisonIndex, minIndex, isSorted]);

  useEffect(() => {
    if (isSorting && !isSorted) {
      const timer = setTimeout(stepSelectionSort, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSorting, isSorted, stepSelectionSort]);

  const startSort = () => {
    if (isSorted) resetArray();
    setIsSorting(true);
    // Ensure minIndex is correctly set for the first pass if starting from a non-initial state
    if (currentIndex === 0 && comparisonIndex === 1) {
        setMinIndex(0);
    }
  };

  const stopSort = () => {
    setIsSorting(false);
  };

  return (
    <div className="selection-sort-visualizer">
      <div className="controls">
        <button onClick={resetArray} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepSelectionSort} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="array-container">
        {array.map((value, idx) => (
          <div
            className={`array-bar 
              ${idx === currentIndex ? 'current-outer' : ''} 
              ${idx === comparisonIndex -1 ? 'comparing' : ''} 
              ${idx === minIndex ? 'min-element' : ''} 
              ${isSorted || idx < currentIndex ? 'sorted' : ''}`}
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

export default SelectionSortVisualizer;
