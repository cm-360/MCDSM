import { useMatches } from "react-router-dom";

function Breadcrumbs() {
  const matches = useMatches();

  return (
    <>{JSON.stringify(matches)}</>
  );
}

export default Breadcrumbs;
