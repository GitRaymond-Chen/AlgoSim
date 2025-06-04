import React, { useState, useEffect, useCallback } from 'react';
import './InsertionSortVisualizer.css'; // To be created

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

const InsertionSortVisualizer = () => {
  const [array, setArray] = useState(generateRandomArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1); // Outer loop: element to be inserted
  const [comparisonIndex, setComparisonIndex] = useState(0); // Inner loop: position to insert / compare
  const [currentKey, setCurrentKey] = useState(null); // The element being inserted

  const resetArray = useCallback(() => {
    const newArr = generateRandomArray();
    setArray(newArr);
    setIsSorted(false);
    setIsSorting(false);
    setCurrentIndex(1);
    setComparisonIndex(0); // Will be set to i-1 in step
    setCurrentKey(null);
  }, []);

  const stepInsertionSort = useCallback(() => {
    if (isSorted) return;

    let i = currentIndex;
    let j = comparisonIndex;
    let key = currentKey;
    const n = array.length;
    let newArray = [...array];

    if (i < n) {
      if (key === null) { // Pick the key for the current i
        key = newArray[i];
        setCurrentKey(key);
        setComparisonIndex(i - 1); // Start comparing from element before key
        return; // Next step will do the comparison/shifting
      }

      j = comparisonIndex; // Use the state's comparisonIndex

      if (j >= 0 && newArray[j] > key) {
        newArray[j + 1] = newArray[j]; // Shift element to the right
        setComparisonIndex(j - 1);
      } else {
        newArray[j + 1] = key; // Insert key in correct position
        setCurrentIndex(i + 1); // Move to next element to insert
        setCurrentKey(null); // Reset key for next iteration
        setComparisonIndex(i); // Reset j for next i (will be i in next step's key pick)
        if (i + 1 >= n) {
          setIsSorted(true);
          setIsSorting(false);
        }
      }
    } else {
      setIsSorted(true);
      setIsSorting(false);
    }
    setArray(newArray);
  }, [array, currentIndex, comparisonIndex, currentKey, isSorted]);

  useEffect(() => {
    if (isSorting && !isSorted) {
      const timer = setTimeout(stepInsertionSort, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSorting, isSorted, stepInsertionSort]);

  const startSort = () => {
    if (isSorted) resetArray();
    // if starting fresh or after pause, ensure key is picked up if needed
    if (currentIndex < array.length && currentKey === null) {
        setCurrentKey(array[currentIndex]);
        setComparisonIndex(currentIndex - 1);
    }
    setIsSorting(true);
  };

  const stopSort = () => {
    setIsSorting(false);
  };

  return (
    <div className="insertion-sort-visualizer">
      <div className="controls">
        <button onClick={resetArray} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepInsertionSort} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="array-container">
        {array.map((value, idx) => (
          <div
            className={`array-bar 
              ${idx === currentIndex ? 'current-key-source' : ''} 
              ${idx === comparisonIndex ? 'comparing' : ''} 
              ${isSorted || idx < currentIndex && currentKey === null ? 'sorted' : ''}`}
            key={idx}
            style={{ height: `${value * 3}px` }}
          >
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>
      {currentKey !== null && (
        <div className="key-display">
          Current Key: <div className="key-element" style={{height: `${currentKey * 3}px`, width: '28px', backgroundColor: '#fca311'}}>{currentKey}</div>
        </div>
      )}
    </div>
  );
};

export default InsertionSortVisualizer;
