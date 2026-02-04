import { useEffect, useState } from 'react';

const Counter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const totalFrames = Math.round(duration / 16);
    const increment = end / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

export default Counter;
