import { useEffect } from "react";

const useOnClickOutside = (ref, callback) => {
  useEffect(() => {
    const handler = (event) => {
      if (!ref.current?.contains(event.target)) {
        callback();
      }
    }
    window.addEventListener('click', handler);

    return () => window.removeEventListener('click', handler);
  }, [callback, ref]);
}

export default useOnClickOutside;
