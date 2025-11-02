import { useEffect } from 'react';
import { appMarkup } from './markup';
import { initApp } from './legacy/app';

export default function App() {
  useEffect(() => {
    initApp();
  }, []);

  return (
    <div
      className="isl-virtual-lab"
      dangerouslySetInnerHTML={{ __html: appMarkup }}
    />
  );
}
