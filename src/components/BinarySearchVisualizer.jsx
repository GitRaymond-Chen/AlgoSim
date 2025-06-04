import React, { useState, useEffect, useCallback } from 'react';
import './BinarySearchVisualizer.css'; // To be created

const ARRAY_SIZE = 15;
const MIN_VAL = 1;
const MAX_VAL = 100;
const DELAY_MS = 300;

function generateSortedRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  arr.sort((a, b) => a - b);
  return arr;
}

function getRandomTarget(array) {
  if (array.length === 0) return Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
  if (Math.random() < 0.7) {
    return array[Math.floor(Math.random() * array.length)];
  } else {
    let randomVal;
    do {
      randomVal = Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
    } while (array.includes(randomVal)); // Ensure it's not in for a 'not found' case
    return randomVal;
  }
}

function getBinarySearchHistory(array, target) {
  const history = [];

  function recordState(highlights, statusText) {
    history.push({ arrayState: [...array], highlights, status: statusText, target });
  }

  recordState({}, `Starting binary search for target: ${target} in sorted array.`);

  let low = 0;
  let high = array.length - 1;
  let found = false;
  let foundIndex = -1;

  while (low <= high) {
    let mid = Math.floor(low + (high - low) / 2);
    recordState({ low, mid, high, comparing: mid }, `Searching in range [${low}-${high}]. Middle element is ${array[mid]} at index ${mid}.`);

    if (array[mid] === target) {
      recordState({ low, mid, high, foundAtIndex: mid }, `Target ${target} found at index ${mid}!`);
      found = true;
      foundIndex = mid;
      break;
    } else if (array[mid] < target) {
      recordState({ low, mid, high, adjust: 'low', newLow: mid + 1 }, `${array[mid]} < ${target}. Adjusting search range to [${mid + 1}-${high}].`);
      low = mid + 1;
    } else {
      recordState({ low, mid, high, adjust: 'high', newHigh: mid - 1 }, `${array[mid]} > ${target}. Adjusting search range to [${low}-${mid - 1}].`);
      high = mid - 1;
    }
  }

  if (!found) {
    recordState({ low, high, notFound: true }, `Target ${target} not found in the array.`);
  }
  recordState({ searchComplete: true, found, foundIndex }, `Search complete. Target ${found ? 'found at index ' + foundIndex : 'not found'}.`);
  return history;
}

const BinarySearchVisualizer = () => {
  const [masterArray, setMasterArray] = useState(generateSortedRandomArray());
  const [targetValue, setTargetValue] = useState(getRandomTarget(masterArray));
  const [currentDisplayArray, setCurrentDisplayArray] = useState([...masterArray]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchConcluded, setSearchConcluded] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [statusText, setStatusText] = useState('Press Start Search');

  const initializeSearch = useCallback(() => {
    const newArray = generateSortedRandomArray();
    const newTarget = getRandomTarget(newArray);
    setMasterArray(newArray);
    setTargetValue(newTarget);
    setCurrentDisplayArray([...newArray]);
    const history = getBinarySearchHistory([...newArray], newTarget);
    setSearchHistory(history);
    setCurrentStepIndex(0);
    setSearchConcluded(false);
    setIsSearching(false);
    if (history.length > 0) {
      setHighlights(history[0].highlights || {});
      setStatusText(history[0].status || 'Ready');
    }
  }, []);

  useEffect(() => {
    initializeSearch();
  }, [initializeSearch]);

  const stepForward = useCallback(() => {
    if (currentStepIndex >= searchHistory.length - 1) {
      setSearchConcluded(true);
      setIsSearching(false);
      const lastStep = searchHistory[searchHistory.length - 1];
      setHighlights(lastStep.highlights || {});
      setStatusText(lastStep.status || 'Search complete.');
      return;
    }
    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);
    setHighlights(searchHistory[nextStep].highlights || {});
    setStatusText(searchHistory[nextStep].status || '');
  }, [currentStepIndex, searchHistory]);

  useEffect(() => {
    if (isSearching && !searchConcluded) {
      const timer = setTimeout(stepForward, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchConcluded, stepForward]);

  const startSearch = () => {
    if (searchConcluded) initializeSearch();
    setIsSearching(true);
    if (currentStepIndex === 0 && searchHistory.length > 0) {
        setHighlights(searchHistory[0].highlights || {});
        setStatusText(searchHistory[0].status || 'Searching...');
    }
  };

  const stopSearch = () => setIsSearching(false);

  return (
    <div className="binary-search-visualizer">
      <div className="controls">
        <button onClick={initializeSearch} disabled={isSearching}>Reset Array & Target</button>
        <button onClick={startSearch} disabled={isSearching || searchConcluded}>Start Search</button>
        <button onClick={stopSearch} disabled={!isSearching || searchConcluded}>Pause Search</button>
        <button onClick={stepForward} disabled={isSearching || searchConcluded}>Next Step</button>
      </div>
      <div className="search-info">
        Searching for: <span className="target-value">{targetValue}</span>
      </div>
      <div className="status-text">{statusText}</div>
      <div className="array-container">
        {currentDisplayArray.map((value, idx) => {
          let barClass = 'array-bar';
          const { low, mid, high, foundAtIndex, searchComplete, notFound } = highlights;

          if (searchComplete) {
            if (foundAtIndex === idx) barClass += ' found';
            else if (foundAtIndex !== undefined) barClass += ' not-relevant';
            else barClass += ' not-found-final';
          } else {
            if (idx >= low && idx <= high) barClass += ' active-range';
            else barClass += ' inactive-range';

            if (idx === mid && highlights.comparing === mid) barClass += ' comparing';
            if (idx === foundAtIndex) barClass += ' found';
            if (idx === low) barClass += ' low-pointer';
            if (idx === high) barClass += ' high-pointer';
          }
          
          return (
            <div className={barClass} key={idx} style={{ height: `${value * 3}px` }}>
              <span className="bar-value">{value}</span>
              {(idx === low && !searchComplete) && <div className="pointer-label low-label">L</div>}
              {(idx === mid && !searchComplete && highlights.comparing === mid) && <div className="pointer-label mid-label">M</div>}
              {(idx === high && !searchComplete) && <div className="pointer-label high-label">H</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BinarySearchVisualizer;
