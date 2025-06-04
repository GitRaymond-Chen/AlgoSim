import React, { useState, useEffect, useCallback } from 'react';
import './MergeSortVisualizer.css'; // To be created

const ARRAY_SIZE = 15;
const MIN_VAL = 5;
const MAX_VAL = 100;
const DELAY_MS = 200;

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

// Generates a history of steps for Merge Sort visualization
function getMergeSortHistory(initialArray) {
  const history = [];
  let array = [...initialArray];

  function recordState(highlights, auxArrays = null) {
    history.push({ arrayState: [...array], highlights, auxArrays });
  }

  function merge(low, mid, high) {
    const leftSize = mid - low + 1;
    const rightSize = high - mid;
    const L = new Array(leftSize);
    const R = new Array(rightSize);

    for (let i = 0; i < leftSize; i++) L[i] = array[low + i];
    for (let i = 0; i < rightSize; i++) R[i] = array[mid + 1 + i];
    
    recordState({ activeRange: [low, high], status: `Copying to temp L & R arrays`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R] });

    let i = 0, j = 0, k = low;
    while (i < leftSize && j < rightSize) {
      recordState({ activeRange: [low, high], comparing_main: [low + i, mid + 1 + j], writing_main: k, status: `Comparing L[${i}] (${L[i]}) and R[${j}] (${R[j]})`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R], l_idx: i, r_idx: j });
      if (L[i] <= R[j]) {
        array[k] = L[i];
        i++;
      } else {
        array[k] = R[j];
        j++;
      }
      recordState({ arrayState: [...array], activeRange: [low, high], writing_main_done: k, status: `Wrote ${array[k]} to main array at index ${k}`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R], l_idx: i-1 <0 && L[i-1] === array[k] ? i-1 : i, r_idx: j-1 < 0 && R[j-1] === array[k] ? j-1: j});
      k++;
    }

    while (i < leftSize) {
      recordState({ activeRange: [low, high], writing_main: k, from_aux: 'L', aux_idx: i, status: `Copying remaining L[${i}] (${L[i]})`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R], l_idx: i });
      array[k] = L[i];
      recordState({ arrayState: [...array], activeRange: [low, high], writing_main_done: k, status: `Wrote ${array[k]} to main array at index ${k}`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R], l_idx: i });
      i++;
      k++;
    }

    while (j < rightSize) {
      recordState({ activeRange: [low, high], writing_main: k, from_aux: 'R', aux_idx: j, status: `Copying remaining R[${j}] (${R[j]})`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R], r_idx: j });
      array[k] = R[j];
      recordState({ arrayState: [...array], activeRange: [low, high], writing_main_done: k, status: `Wrote ${array[k]} to main array at index ${k}`, currentLow: low, currentMid: mid, currentHigh: high }, { L: [...L], R: [...R], r_idx: j });
      j++;
      k++;
    }
  }

  function sortRecursive(low, high) {
    if (low >= high) return;
    const mid = Math.floor(low + (high - low) / 2);
    recordState({ activeRange: [low, high], status: `Splitting: low=${low}, mid=${mid}, high=${high}`, currentLow: low, currentMid: mid, currentHigh: high });
    sortRecursive(low, mid);
    sortRecursive(mid + 1, high);
    recordState({ activeRange: [low, high], status: `Ready to Merge: low=${low}, mid=${mid}, high=${high}`, currentLow: low, currentMid: mid, currentHigh: high });
    merge(low, mid, high);
    recordState({ activeRange: [low, high], status: `Merged segment [${low}-${high}]`, currentLow: low, currentMid: mid, currentHigh: high, segmentSorted: true });
  }

  recordState({ status: 'Initial array' });
  sortRecursive(0, array.length - 1);
  recordState({ arrayState: [...array], highlights: { sorted: true }, status: 'Array sorted' });
  return history;
}

const MergeSortVisualizer = () => {
  const [masterArray, setMasterArray] = useState(generateRandomArray()); // For reset purposes
  const [currentDisplayArray, setCurrentDisplayArray] = useState([...masterArray]);
  const [sortHistory, setSortHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [auxArrays, setAuxArrays] = useState(null);
  const [statusText, setStatusText] = useState('Press Start Sort');

  const initializeSort = useCallback(() => {
    const newArray = generateRandomArray();
    setMasterArray(newArray);
    setCurrentDisplayArray([...newArray]);
    const history = getMergeSortHistory([...newArray]);
    setSortHistory(history);
    setCurrentStepIndex(0);
    setIsSorted(false);
    setIsSorting(false);
    if (history.length > 0) {
      setHighlights(history[0].highlights || {});
      setAuxArrays(history[0].auxArrays || null);
      setStatusText(history[0].highlights?.status || 'Ready');
      setCurrentDisplayArray(history[0].arrayState);
    }
  }, []);

  useEffect(() => {
    initializeSort();
  }, [initializeSort]);

  const stepForward = useCallback(() => {
    if (currentStepIndex >= sortHistory.length - 1) {
      setIsSorted(true);
      setIsSorting(false);
      setHighlights({ sorted: true });
      setStatusText('Array sorted!');
      if (sortHistory.length > 0) setCurrentDisplayArray(sortHistory[sortHistory.length - 1].arrayState);
      return;
    }
    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);
    setCurrentDisplayArray(sortHistory[nextStep].arrayState);
    setHighlights(sortHistory[nextStep].highlights || {});
    setAuxArrays(sortHistory[nextStep].auxArrays || null);
    setStatusText(sortHistory[nextStep].highlights?.status || '');
  }, [currentStepIndex, sortHistory]);

  useEffect(() => {
    if (isSorting && !isSorted) {
      const timer = setTimeout(stepForward, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSorting, isSorted, stepForward]);

  const startSort = () => {
    if (isSorted) initializeSort(); // Reset if already sorted
    setIsSorting(true);
     // If starting from step 0, apply initial state immediately
    if (currentStepIndex === 0 && sortHistory.length > 0) {
        setCurrentDisplayArray(sortHistory[0].arrayState);
        setHighlights(sortHistory[0].highlights || {});
        setAuxArrays(sortHistory[0].auxArrays || null);
        setStatusText(sortHistory[0].highlights?.status || 'Sorting...');
    }
  };

  const stopSort = () => setIsSorting(false);

  return (
    <div className="merge-sort-visualizer">
      <div className="controls">
        <button onClick={initializeSort} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepForward} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="status-text">{statusText}</div>
      {auxArrays && (auxArrays.L || auxArrays.R) && (
        <div className="aux-arrays-container">
          {auxArrays.L && <div className="aux-array">L: {auxArrays.L.map((val, i) => <span key={`l-${i}`} className={i === auxArrays.l_idx ? 'current-aux' : ''}>{val}</span>)}</div>}
          {auxArrays.R && <div className="aux-array">R: {auxArrays.R.map((val, i) => <span key={`r-${i}`} className={i === auxArrays.r_idx ? 'current-aux' : ''}>{val}</span>)}</div>}
        </div>
      )}
      <div className="array-container">
        {currentDisplayArray.map((value, idx) => {
          let barClass = 'array-bar';
          if (highlights.sorted) barClass += ' sorted';
          else if (highlights.segmentSorted && idx >= highlights.currentLow && idx <= highlights.currentHigh) barClass += ' segment-sorted';
          if (highlights.activeRange && idx >= highlights.activeRange[0] && idx <= highlights.activeRange[1]) barClass += ' active-segment';
          if (highlights.comparing_main && (idx === highlights.comparing_main[0] || idx === highlights.comparing_main[1])) barClass += ' comparing';
          if (highlights.writing_main_done === idx) barClass += ' writing-target-done';
          else if (highlights.writing_main === idx) barClass += ' writing-target';
          
          return (
            <div className={barClass} key={idx} style={{ height: `${value * 3}px` }}>
              <span className="bar-value">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MergeSortVisualizer;
