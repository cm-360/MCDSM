import { Link, UIMatch, useMatches } from "react-router-dom";

import './Breadcrumbs.css';

export interface Crumb {
  name: string;
  path: string;
}

const crumbDisplayNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/networks': 'Networks',
  '/resources': 'Resources',
  '/settings': 'Settings',
};

function pushIfUnique(crumbs: Crumb[], newCrumb: Crumb) {
  const prevCrumb = crumbs[crumbs.length - 1];
  if (prevCrumb?.path != newCrumb.path) {
    crumbs.push(newCrumb);
  }

  return crumbs;
}

function crumbsReducer(crumbs: Crumb[], match: UIMatch) {
  const { pathname } = match;

  // Skip first match (index)
  if ('/' === pathname) {
    return crumbs;
  }

  // Try looking up crumb name by path
  const displayName = crumbDisplayNames[pathname];
  if (displayName) {
    const newCrumb = { name: displayName, path: pathname };
    pushIfUnique(crumbs, newCrumb);
    return crumbs;
  }

  // Try generating crumb name from path
  const prevCrumb = crumbs[crumbs.length - 1];
  const trimmedPath = pathname.replace(prevCrumb?.path, '').replace('/', '').trim();
  if (!trimmedPath) {
    return crumbs;
  }
  const newCrumb = { name: trimmedPath, path: pathname };
  pushIfUnique(crumbs, newCrumb);
  return crumbs;
}

function Breadcrumbs() {
  const matches = useMatches();

  // Build the breadcrumb elements from path matches
  const crumbLinks = matches
    .reduce(crumbsReducer, [])
    .map((crumb) => 
      <Link className='crumb link' key={crumb.path} to={crumb.path}>{crumb.name.toTitleCase()}</Link>
    );

  return (
    <nav className='breadcrumbs container-md'>{crumbLinks}</nav>
  );
}

export default Breadcrumbs;
