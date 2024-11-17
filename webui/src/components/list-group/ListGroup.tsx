import { Children, PropsWithChildren } from 'react';
import './ListGroup.css';

export default function ListGroup({ children }: PropsWithChildren) {
  const childrenArray = Children.toArray(children);

  return (
    <ul className='list-group'>
      {childrenArray.map((child) => <li className='list-group-item'>{child}</li>)}
    </ul>
  );
}
