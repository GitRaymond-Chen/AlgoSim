import React, { useState, useEffect, useCallback } from 'react';
import './RadixSortVisualizer.css'; // To be created

const ARRAY_SIZE = 12;
const MIN_VAL = 0;
const MAX_VAL = 999; // Numbers up to 3 digits for Radix Sort demo
const DELAY_MS = 500; // Slower for observing bucket distribution

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

// Helper function to get digit at a specific place
function getDigit(num, place) {
  return Math.floor(Math.abs(num) / place) % 10;
}

// Helper function to count number of digits in the largest number
function getMaxDigits(nums) {
  if (nums.length === 0) return 0;
  let max = 0;
  for (let num of nums) {
    max = Math.max(max, Math.abs(num));
  }
  return max === 0 ? 1 : Math.floor(Math.log10(max)) + 1;
}

function getRadixSortHistory(initialArray) {
  const history = [];
  let array = [...initialArray];

  function recordState(highlights, statusText, currentBuckets = null, passNumber = null) {
    history.push({
      arrayState: [...array],
      bucketsState: currentBuckets ? JSON.parse(JSON.stringify(currentBuckets)) : null, // Deep copy buckets
      highlights,
      status: statusText,
      pass: passNumber,
    });
  }

  if (array.length === 0) {
    recordState({}, 'Array is empty, already sorted.');
    return history;
  }

  const maxDigits = getMaxDigits(array);
  recordState({}, `Initial array. Max digits: ${maxDigits}.`, null, 0);

  let place = 1;
  for (let i = 0; i < maxDigits; i++) {
    let buckets = Array.from({ length: 10 }, () => []);
    recordState({ currentPlace: place }, `Pass ${i + 1}: Sorting by digit at place ${place}. Initializing buckets.`, buckets, i + 1);

    // Distribute numbers into buckets
    for (let j = 0; j < array.length; j++) {
      const num = array[j];
      const digit = getDigit(num, place);
      buckets[digit].push(num);
      recordState({ distributingValue: num, toBucket: digit, inputIndex: j }, `Distributing ${num}. Digit ${digit} -> Bucket ${digit}.`, buckets, i + 1);
    }
    recordState({ currentPlace: place }, `Finished distributing for place ${place}.`, buckets, i + 1);

    // Collect numbers from buckets
    let newArray = [];
    for (let k = 0; k < 10; k++) {
        recordState({ collectingFromBucket: k, currentPlace: place }, `Collecting from Bucket ${k}.`, buckets, i + 1);
      for (let num of buckets[k]) {
        newArray.push(num);
        // Show array being rebuilt
        recordState({ collectingValue: num, fromBucket: k, currentPlace: place, rebuiltArrayIndex: newArray.length -1 }, `Collected ${num} from Bucket ${k}. Array: [${newArray.join(', ')}]`, buckets, i + 1);
      }
      buckets[k] = []; // Visually empty bucket after collection (optional, or show as collected)
    }
    array = newArray;
    recordState({ currentPlace: place, passCompleted: i+1 }, `Pass ${i + 1} for place ${place} completed. Array updated.`, null, i + 1); // Buckets are empty now
    place *= 10;
  }

  recordState({ sorted: true }, 'Array sorted.');
  return history;
}

const RadixSortVisualizer = () => {
  const [masterArray, setMasterArray] = useState(generateRandomArray());
  const [currentDisplayArray, setCurrentDisplayArray] = useState([...masterArray]);
  const [currentBuckets, setCurrentBuckets] = useState(null);
  const [sortHistory, setSortHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [statusText, setStatusText] = useState('Press Start Sort');
  const [currentPass, setCurrentPass] = useState(0);

  const initializeSort = useCallback(() => {
    const newArray = generateRandomArray();
    setMasterArray(newArray);
    const history = getRadixSortHistory([...newArray]);
    setSortHistory(history);
    setCurrentStepIndex(0);
    setIsSorted(false);
    setIsSorting(false);
    if (history.length > 0) {
      const firstStep = history[0];
      setCurrentDisplayArray(firstStep.arrayState);
      setCurrentBuckets(firstStep.bucketsState);
      setHighlights(firstStep.highlights || {});
      setStatusText(firstStep.status || 'Ready');
      setCurrentPass(firstStep.pass || 0);
    }
  }, []);

  useEffect(() => {
    initializeSort();
  }, [initializeSort]);

  const stepForward = useCallback(() => {
    if (currentStepIndex >= sortHistory.length - 1) {
      setIsSorted(true);
      setIsSorting(false);
      const lastState = sortHistory[sortHistory.length - 1];
      setHighlights({ sorted: true });
      setStatusText('Array sorted!');
      setCurrentDisplayArray(lastState.arrayState);
      setCurrentBuckets(null); // Buckets are not relevant when fully sorted
      setCurrentPass(lastState.pass || 0);
      return;
    }
    const nextStepIdx = currentStepIndex + 1;
    setCurrentStepIndex(nextStepIdx);
    const nextStepData = sortHistory[nextStepIdx];
    setCurrentDisplayArray(nextStepData.arrayState);
    setCurrentBuckets(nextStepData.bucketsState);
    setHighlights(nextStepData.highlights || {});
    setStatusText(nextStepData.status || '');
    setCurrentPass(nextStepData.pass || 0);
  }, [currentStepIndex, sortHistory]);

  useEffect(() => {
    if (isSorting && !isSorted) {
      const timer = setTimeout(stepForward, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSorting, isSorted, stepForward]);

  const startSort = () => {
    if (isSorted) initializeSort();
    setIsSorting(true);
    if (currentStepIndex === 0 && sortHistory.length > 0) {
        const firstStep = sortHistory[0];
        setCurrentDisplayArray(firstStep.arrayState);
        setCurrentBuckets(firstStep.bucketsState);
        setHighlights(firstStep.highlights || {});
        setStatusText(firstStep.status || 'Sorting...');
        setCurrentPass(firstStep.pass || 0);
    }
  };

  const stopSort = () => setIsSorting(false);

  return (
    <div className="radix-sort-visualizer">
      <div className="controls">
        <button onClick={initializeSort} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepForward} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="status-text">{statusText} (Pass: {currentPass}, Place: {highlights.currentPlace || 'N/A'})</div>
      
      <div className="array-container main-array">
        {currentDisplayArray.map((value, idx) => (
          <div 
            className={`array-bar ${highlights.inputIndex === idx && highlights.distributingValue === value ? 'distributing' : ''} ${highlights.rebuiltArrayIndex === idx && highlights.collectingValue === value ? 'collecting-target' : ''} ${highlights.sorted ? 'sorted' : ''}`}
            key={`main-${idx}`}
            style={{ height: `${Math.log10(value + 1) * 60 + 20}px` }} // Log scale for wider range
          >
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>

      {currentBuckets && (
        <div className="buckets-display-section">
          <h4>Buckets (Digit 0-9)</h4>
          <div className="buckets-container">
            {currentBuckets.map((bucket, bucketIdx) => (
              <div className={`bucket ${highlights.toBucket === bucketIdx ? 'active-bucket-target' : ''} ${highlights.collectingFromBucket === bucketIdx ? 'active-bucket-source' : ''}`} key={`bucket-outer-${bucketIdx}`}>
                <div className="bucket-label">{bucketIdx}</div>
                <div className="bucket-content">
                  {bucket.map((num, numIdx) => (
                    <div 
                      className={`bucket-item ${highlights.distributingValue === num && highlights.toBucket === bucketIdx ? 'distributing-item' : ''} ${highlights.collectingValue === num && highlights.fromBucket === bucketIdx ? 'collecting-item' : ''}`}
                      key={`bucket-${bucketIdx}-item-${numIdx}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RadixSortVisualizer;
