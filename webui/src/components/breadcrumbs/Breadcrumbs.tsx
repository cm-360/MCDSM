import { Link, UIMatch, useMatches } from "react-router-dom";
import { intersperse } from "../../utils";

export interface Crumb {
  name: string;
  path: string;
}

const crumbDisplayNames: Record<string, string> = {
  '/': 'Dashboard',
  '/servers': 'Servers',
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
  const { id, pathname } = match;

  // Skip first match (index)
  if ('0' == id) {
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
  const trimmedPath = pathname.replace(prevCrumb.path, '').replace('/', '').trim();
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
      <Link key={crumb.path} to={crumb.path}>{crumb.name}</Link>
    )
    .intersperse(
      <span> / </span>
    );

  return (
    <nav>
      <div>{crumbLinks}</div>
    </nav>
  );
}

export default Breadcrumbs;
