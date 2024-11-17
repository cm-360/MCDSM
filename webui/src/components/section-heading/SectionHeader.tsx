import { PropsWithChildren } from 'react';

import './SectionHeader.css';

export default function SectionHeader({ children }: PropsWithChildren) {
  return (
    <header className='section-header container-md'>
      {children}
    </header>
  );
}
